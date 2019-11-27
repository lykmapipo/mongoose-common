'use strict';

/* dependencies */
const path = require('path');
const _ = require('lodash');
const { waterfall, parallel } = require('async');
const { mergeObjects } = require('@lykmapipo/common');
const { getBoolean, getString } = require('@lykmapipo/env');
const mongoose = require('mongoose');

const loadPathSeeds = collectionName => {
  const BASE_PATH = getString('BASE_PATH', process.cwd());
  let SEED_PATH = getString('SEED_PATH', path.join(BASE_PATH, 'seeds'));
  SEED_PATH = path.resolve(SEED_PATH, collectionName);
  try {
    let seeds = require(SEED_PATH);
    seeds = [].concat(seeds);
    return seeds;
  } catch (e) {
    return [];
  }
};

const seedModel = function(data, done) {
  /* jshint validthis: true */

  // this: Model static context

  // normalize arguments
  let seeds = _.isFunction(data) ? [] : [].concat(data);
  const cb = _.isFunction(data) ? data : done;

  // compact seeds
  const collectionName =
    _.get(this, 'collection.name') || _.get(this, 'collection.collectionName');

  // ignore path seeds if seed provided
  if (_.isEmpty(seeds)) {
    const pathSeeds = loadPathSeeds(collectionName);
    seeds = _.compact([...seeds, ...pathSeeds]);
  }

  // map to seed and criteria
  const canProvideCriteria = _.isFunction(this.prepareSeedCriteria);
  let prepareSeedCriteria = seed => seed;
  if (canProvideCriteria) {
    prepareSeedCriteria = this.prepareSeedCriteria;
  }
  seeds = _.map(seeds, seed => {
    const criteria = prepareSeedCriteria(seed);
    return { criteria, data: seed };
  });

  // find existing instance fullfill seed criteria
  const findExisting = (criteria, afterFind) =>
    this.findOne(criteria, afterFind);

  // fetch existing seed dependencies
  // TODO: fix hacks & dances
  const fetchDependencies = (seed, afterDependencies) => {
    let dependencies = mergeObjects(seed.populate);
    if (_.isPlainObject(dependencies) && !_.isEmpty(dependencies)) {
      dependencies = _.mapValues(dependencies, dependency => {
        const { model, match, array } = dependency;
        return afterDependency => {
          if (_.isString(model) && _.isPlainObject(match)) {
            try {
              const Model = mongoose.model(model);
              if (array) {
                return Model.find(
                  match,
                  { _id: 1 },
                  { autopopulate: false },
                  afterDependency
                );
              }
              return Model.findOne(
                match,
                { _id: 1 },
                { autopopulate: false },
                afterDependency
              );
            } catch (e) {
              return afterDependency(e);
            }
          }
          return afterDependency(new Error('Invalid Populate Options'));
        };
      });
      return parallel(dependencies, afterDependencies);
    }
    return afterDependencies(null, seed);
  };
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
  const upsertOne = (seed, afterUpsert) => {
    const { criteria, data } = seed;
    return waterfall(
      [
        next => findExisting(_.omit(criteria, 'populate'), next),
        (found, next) => {
          fetchDependencies(data, (error, dependencies) => {
            _.forEach(dependencies, (value, key) => {
              data[key] = value;
            });
            next(error, found);
          });
        },
        (found, next) => mergeOne(found, data, next),
      ],
      afterUpsert
    );
  };

  // prepare seeds
  seeds = _.map(seeds, seed => {
    return next => upsertOne(seed, next);
  });

  // run seeds
  return parallel(seeds, cb);
};

const clearAndSeedModel = function(data, done) {
  /* jshint validthis: true */

  // this: Model static context

  // clear model data
  const doclear = next => this.deleteMany(error => next(error));
  // seed model data
  const doSeed = next => this.seed(data, next);
  // run clear then seed
  return waterfall([doclear, doSeed], done);
};

/**
 * @function seed
 * @name seed
 * @description extend mongoose schema with seed capability
 * @param {Schema} schema valid mongoose schema instance
 * @since 0.21.0
 * @version 0.1.0
 */
module.exports = exports = schema => {
  const canNotSeed = !_.isFunction(schema.statics.seed);
  if (canNotSeed) {
    schema.statics.seed = seedModel;
    schema.statics.clearAndSeed = clearAndSeedModel;
  }
};

// TODO: async prepareSeedCriteria
// TODO: prepareSeedCriteria(seed, code)
// TODO: done(error, criteria)
