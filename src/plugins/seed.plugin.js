import { join as joinPath, resolve as resolvePath } from 'path';
import {
  compact,
  filter,
  forEach,
  get,
  isArray,
  isEmpty,
  isFunction,
  isPlainObject,
  isString,
  map,
  mapValues,
  noop,
  omit,
} from 'lodash';
import { waterfall, parallel } from 'async';
import { mergeObjects, idOf } from '@lykmapipo/common';
import { getBoolean, getString } from '@lykmapipo/env';
import mongoose from 'mongoose-valid8';

/**
 * @name loadPathSeeds
 * @description load seeds from paths
 * @param {string} collectionName valid collection name
 * @returns {object|object[]} given collection seed from a path
 * @since 0.21.0
 * @version 0.2.0
 * @private
 */
function loadPathSeeds(collectionName) {
  // resolve seed path
  const BASE_PATH = getString('BASE_PATH', process.cwd());
  let SEED_PATH = getString('SEED_PATH', joinPath(BASE_PATH, 'seeds'));
  SEED_PATH = resolvePath(SEED_PATH, collectionName);

  // try load seeds from path
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    let seeds = require(SEED_PATH);
    // honor es6 default exports
    seeds = [].concat(isArray(seeds.default) ? seeds.default : seeds);
    return seeds;
  } catch (e) {
    return [];
  }
}

/**
 * @function clearAndSeedModel
 * @name clearAndSeedModel
 * @description clear and seed the given model data
 * @param {object|object[]|Function} data valid model data
 * @param {Function} done callback to invoke on success or error
 * @returns {object} seed results
 * @since 0.21.0
 * @version 0.2.0
 * @private
 */
function seedModel(data, done) {
  // this: Model static context

  // normalize arguments
  let seeds = [];
  let cb = noop;
  let filterFn = (val) => val;
  let transformFn = (val) => val;
  if (isFunction(data)) {
    cb = data;
  }
  if (isArray(data)) {
    seeds = [].concat(data);
  }
  if (isPlainObject(data)) {
    filterFn = data.filter || filterFn;
    transformFn = data.transform || transformFn;
    seeds = data.data || omit(data, 'filter', 'transform');
    seeds = isArray(seeds) ? seeds : mergeObjects(seeds);
    seeds = [].concat(seeds);
    seeds = filter(seeds, (seed) => !isEmpty(seed));
  }
  if (isFunction(done)) {
    cb = done || cb;
  }
  // let seeds = _.isFunction(data) ? [] : [].concat(data);
  // const cb = _.isFunction(data) ? data : done;

  // compact seeds
  const collectionName =
    get(this, 'collection.name') || get(this, 'collection.collectionName');

  // ignore path seeds if seed provided
  if (isEmpty(seeds)) {
    const pathSeeds = loadPathSeeds(collectionName);
    seeds = compact([...seeds, ...pathSeeds]);
    seeds = filter(seeds, (seed) => !isEmpty(seed));
  }

  // filter seeds
  seeds = filter(seeds, filterFn);

  // transform seeds
  seeds = map(seeds, transformFn);

  // filter empty seeds
  seeds = filter(seeds, (seed) => !isEmpty(seed));

  // find existing instance fullfill seed criteria
  const findExisting = (seed, afterFind) => {
    // map seed to criteria
    const canProvideCriteria = isFunction(this.prepareSeedCriteria);
    let prepareSeedCriteria = ($seed) => $seed;
    if (canProvideCriteria) {
      prepareSeedCriteria = this.prepareSeedCriteria;
    }
    let criteria = prepareSeedCriteria(seed);
    criteria = omit(criteria, 'populate');

    // find existing data
    return this.findOne(criteria, afterFind);
  };

  // fetch existing dependency
  const fetchDependency = (dependency, afterDependency) => {
    // obtain options
    const { model, match, select, array } = dependency;

    const afterFetchDependency = (error, found) => {
      const result = isEmpty(found) ? undefined : found;
      return afterDependency(error, result);
    };

    // try fetch with provide options
    if (isString(model) && isPlainObject(match)) {
      try {
        const Model = mongoose.model(model);
        if (array) {
          return Model.find(
            match,
            mergeObjects(select, { _id: 1 }),
            { autopopulate: false },
            afterFetchDependency
          );
        }
        return Model.findOne(
          match,
          mergeObjects(select, { _id: 1 }),
          { autopopulate: false },
          afterFetchDependency
        );
      } catch (e) {
        return afterDependency(e);
      }
    }

    // backoff: invalid options
    return afterDependency(new Error('Invalid Populate Options'));
  };

  // fetch dependencies exclude ignored
  const fetchDependencyExcludeIgnore = (dependency, afterDependency) => {
    // obtain options
    const { ignore = {} } = dependency;
    return waterfall(
      [
        (next) => {
          if (isEmpty(ignore)) {
            return next(null, []);
          }
          const ignoreCriteria = omit(ignore, 'select');
          return fetchDependency(ignoreCriteria, next);
        }, // fetch ignored
        (ignored, next) => {
          // use ignored
          const ignorePath = ignore.path || '_id';
          const ignoredIds = compact(
            map([].concat(ignored), (val) => idOf(val))
          );
          const { model, select, array } = mergeObjects(dependency);
          let { match } = mergeObjects(dependency);
          if (!isEmpty(ignoredIds)) {
            match = mergeObjects(
              {
                [ignorePath]: { $nin: ignoredIds },
              },
              match
            );
          }
          return fetchDependency({ model, match, select, array }, next);
        }, // fetch dependencies exclude ignored
      ],
      afterDependency
    );
  };

  // fetch existing seed dependencies
  // TODO: optimize queries
  const fetchDependencies = (seed, afterDependencies) => {
    let dependencies = mergeObjects(seed.populate);
    if (isPlainObject(dependencies) && !isEmpty(dependencies)) {
      dependencies = mapValues(dependencies, (dependency) => {
        return (afterDependency) => {
          return fetchDependencyExcludeIgnore(dependency, afterDependency);
        };
      });
      return parallel(dependencies, afterDependencies);
    }
    return afterDependencies(null, seed);
  };

  // merge existing with seed data
  const mergeOne = (found, $data, afterMergeOne) => {
    if (found) {
      const SEED_FRESH = getBoolean('SEED_FRESH', false);
      let updates = {};
      if (SEED_FRESH) {
        updates = mergeObjects(found.toObject(), $data);
      } else {
        updates = mergeObjects($data, found.toObject());
      }
      found.set(updates);
      // eslint-disable-next-line no-param-reassign
      found.updatedAt = new Date();
    } else {
      // eslint-disable-next-line no-param-reassign
      found = new this($data);
    }
    return found.put ? found.put(afterMergeOne) : found.save(afterMergeOne);
  };

  // update or create seed
  const upsertOne = (seed, afterUpsert) => {
    return waterfall(
      [
        (next) => {
          fetchDependencies(seed, (error, dependencies) => {
            if (error) {
              return next(error);
            }
            forEach(dependencies, (value, key) => {
              // eslint-disable-next-line no-param-reassign
              seed[key] = value;
            });
            return next();
          });
        },
        (next) => findExisting(seed, next),
        (found, next) => mergeOne(found, seed, next),
      ],
      afterUpsert
    );
  };

  // prepare seeds
  seeds = map(seeds, (seed) => {
    return (next) => upsertOne(seed, next);
  });

  // run seeds
  return parallel(seeds, cb);
}

/**
 * @function clearAndSeedModel
 * @name clearAndSeedModel
 * @description clear and seed the given model data
 * @param {object|object[]|Function} data valid model data
 * @param {Function} done callback to invoke on success or error
 * @returns {object} seed results
 * @since 0.21.0
 * @version 0.2.0
 * @private
 */
function clearAndSeedModel(data, done) {
  // this: Model static context

  // normalize callback
  const cb = isFunction(data) ? data : done;

  // clear model data
  const doClear = (next) => this.deleteMany((error) => next(error));

  // seed model data
  const doSeed = (next) =>
    isFunction(data) ? this.seed(next) : this.seed(data, next);

  // run clear then seed
  return waterfall([doClear, doSeed], cb);
}

/**
 * @function seedPlugin
 * @name seedPlugin
 * @description Extend mongoose schema with seed capability
 * @param {object} schema valid mongoose schema instance
 * @since 0.21.0
 * @version 0.2.0
 * @public
 */
export default function seedPlugin(schema) {
  const canNotSeed = !isFunction(schema.statics.seed);
  if (canNotSeed) {
    // eslint-disable-next-line no-param-reassign
    schema.statics.seed = seedModel;

    // eslint-disable-next-line no-param-reassign
    schema.statics.clearAndSeed = clearAndSeedModel;
  }
}

// TODO: async prepareSeedCriteria
// TODO: prepareSeedCriteria(seed, code)
// TODO: done(error, criteria)
