'use strict';

/* dependencies */
const path = require('path');
const _ = require('lodash');
const { waterfall, parallel } = require('async');
const { mergeObjects, idOf } = require('@lykmapipo/common');
const { getBoolean, getString } = require('@lykmapipo/env');
const mongoose = require('mongoose');

const loadPathSeeds = (collectionName) => {
  const BASE_PATH = getString('BASE_PATH', process.cwd());
  let SEED_PATH = getString('SEED_PATH', path.join(BASE_PATH, 'seeds'));
  SEED_PATH = path.resolve(SEED_PATH, collectionName);
  try {
    let seeds = require(SEED_PATH);
    // honor es6 default exports
    seeds = [].concat(_.isArray(seeds.default) ? seeds.default : seeds);
    return seeds;
  } catch (e) {
    return [];
  }
};

const seedModel = function (data, done) {
  /* jshint validthis: true */

  // this: Model static context

  // normalize arguments
  let seeds = [];
  let cb = _.noop;
  let filter = (val) => val;
  let transform = (val) => val;
  if (_.isFunction(data)) {
    cb = data;
  }
  if (_.isArray(data)) {
    seeds = [].concat(data);
  }
  if (_.isPlainObject(data)) {
    filter = data.filter || filter;
    transform = data.transform || transform;
    seeds = [].concat(data.data || _.omit(data, 'filter', 'transform'));
    seeds = _.filter(seeds, (seed) => !_.isEmpty(seed));
  }
  if (_.isFunction(done)) {
    cb = done || cb;
  }
  // let seeds = _.isFunction(data) ? [] : [].concat(data);
  // const cb = _.isFunction(data) ? data : done;

  // compact seeds
  const collectionName =
    _.get(this, 'collection.name') || _.get(this, 'collection.collectionName');

  // ignore path seeds if seed provided
  if (_.isEmpty(seeds)) {
    const pathSeeds = loadPathSeeds(collectionName);
    seeds = _.compact([...seeds, ...pathSeeds]);
    seeds = _.filter(seeds, (seed) => !_.isEmpty(seed));
  }

  // filter seeds
  seeds = _.filter(seeds, filter);

  // transform seeds
  seeds = _.map(seeds, transform);

  // filter empty seeds
  seeds = _.filter(seeds, (seed) => !_.isEmpty(seed));

  // find existing instance fullfill seed criteria
  const findExisting = (seed, afterFind) => {
    // map seed to criteria
    const canProvideCriteria = _.isFunction(this.prepareSeedCriteria);
    let prepareSeedCriteria = (seed) => seed;
    if (canProvideCriteria) {
      prepareSeedCriteria = this.prepareSeedCriteria;
    }
    let criteria = prepareSeedCriteria(seed);
    criteria = _.omit(criteria, 'populate');

    // find existing data
    return this.findOne(criteria, afterFind);
  };

  // fetch existing dependency
  const fetchDependency = (dependency, afterDependency) => {
    // obtain options
    const { model, match, select, array } = dependency;

    const afterFetchDependency = (error, found) => {
      const result = _.isEmpty(found) ? undefined : found;
      return afterDependency(error, result);
    };

    // try fetch with provide options
    if (_.isString(model) && _.isPlainObject(match)) {
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
          if (_.isEmpty(ignore)) {
            return next(null, []);
          }
          const ignoreCriteria = _.omit(ignore, 'select');
          return fetchDependency(ignoreCriteria, next);
        }, // fetch ignored
        (ignored, next) => {
          // use ignored
          const ignorePath = ignore.path || '_id';
          const ignoredIds = _.compact(
            _.map([].concat(ignored), (val) => idOf(val))
          );
          let { model, match, select, array } = mergeObjects(dependency);
          if (!_.isEmpty(ignoredIds)) {
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
    if (_.isPlainObject(dependencies) && !_.isEmpty(dependencies)) {
      dependencies = _.mapValues(dependencies, (dependency) => {
        return (afterDependency) => {
          return fetchDependencyExcludeIgnore(dependency, afterDependency);
        };
      });
      return parallel(dependencies, afterDependencies);
    }
    return afterDependencies(null, seed);
  };

  // merge existing with seed data
  const mergeOne = (found, data, afterMergeOne) => {
    if (found) {
      const SEED_FRESH = getBoolean('SEED_FRESH', false);
      let updates = {};
      if (SEED_FRESH) {
        updates = mergeObjects(found.toObject(), data);
      } else {
        updates = mergeObjects(data, found.toObject());
      }
      found.set(updates);
      found.updatedAt = new Date();
    } else {
      found = new this(data);
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
            _.forEach(dependencies, (value, key) => {
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
  seeds = _.map(seeds, (seed) => {
    return (next) => upsertOne(seed, next);
  });

  // run seeds
  return parallel(seeds, cb);
};

const clearAndSeedModel = function (data, done) {
  /* jshint validthis: true */

  // this: Model static context

  // normalize callback
  let cb = _.isFunction(data) ? data : done;

  // clear model data
  const doClear = (next) => this.deleteMany((error) => next(error));

  // seed model data
  const doSeed = (next) =>
    _.isFunction(data) ? this.seed(next) : this.seed(data, next);

  // run clear then seed
  return waterfall([doClear, doSeed], cb);
};

/**
 * @function seed
 * @name seed
 * @description extend mongoose schema with seed capability
 * @param {Schema} schema valid mongoose schema instance
 * @since 0.21.0
 * @version 0.1.0
 */
module.exports = exports = (schema) => {
  const canNotSeed = !_.isFunction(schema.statics.seed);
  if (canNotSeed) {
    schema.statics.seed = seedModel;
    schema.statics.clearAndSeed = clearAndSeedModel;
  }
};

// TODO: async prepareSeedCriteria
// TODO: prepareSeedCriteria(seed, code)
// TODO: done(error, criteria)
