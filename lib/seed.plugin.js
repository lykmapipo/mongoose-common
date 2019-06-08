'use strict';

/* dependencies */
const path = require('path');
const _ = require('lodash');
const { waterfall, parallel } = require('async');
const { mergeObjects } = require('@lykmapipo/common');
const { getString } = require('@lykmapipo/env');

const loadPathSeeds = collectionName => {
  const BASE_PATH = getString('BASE_PATH', process.cwd());
  const SEEDS_PATH = getString('SEEDS_PATH', path.join(BASE_PATH, 'seeds'));
  const SEED_PATH = path.resolve(SEEDS_PATH, collectionName);
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

  // prepare upsert
  const findOne = (criteria, afterFind) => this.findOne(criteria, afterFind);
  const mergeOne = (found, data, afterMergeOne) => {
    if (found) {
      const updates = mergeObjects(data, found.toObject());
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
        next => findOne(criteria, next),
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
