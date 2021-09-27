'use strict';

const lodash = require('lodash');
const crypto = require('crypto');
const common = require('@lykmapipo/common');
const mongoose = require('mongoose-valid8');
const utils = require('mongoose/lib/utils');
const mongooseConnection = require('@lykmapipo/mongoose-connection');
const path = require('path');
const async = require('async');
const env = require('@lykmapipo/env');

/**
 * @function isUniqueError
 * @name isUniqueError
 * @description Check if the given error is a unique mongodb error.
 * @param {object} error valid error object to test.
 * @returns {boolean} true if and only if it is an unique error.
 * @version 0.2.0
 * @since 0.1.0
 * @private
 */
const isUniqueError = (error) => {
  return (
    error &&
    (error.name === 'BulkWriteError' ||
      error.name === 'MongoError' ||
      error.name === 'MongoServerError' ||
      error.name === 'MongoBulkWriteError') &&
    (error.code === 11000 || error.code === 11001) &&
    !lodash.isEmpty(error.message)
  );
};

/**
 * @function parseErrorPaths
 * @name parseErrorPaths
 * @description Parse paths found in unique mongodb error.
 * @param {object} schema valid mongoose schema.
 * @param {Error} error valid mongodb error.
 * @returns {string[]} found paths in error.
 * @version 0.19.0
 * @since 0.1.0
 * @private
 */
const parseErrorPaths = (schema, error) => {
  // back off if no error message
  if (!error.message) {
    return [];
  }

  // obtain paths from error message
  let paths = lodash.nth(error.message.match(/index: (.+?) dup key:/), 1) || '';
  paths = paths.split('$').pop();

  // handle compound unique paths index
  paths = [].concat(paths.split('_'));

  // in case for id ensure _id too and compact paths
  paths = common.uniq([
    ...paths,
    ...lodash.map(paths, (pathName) => (pathName === 'id' ? '_id' : pathName)),
  ]);

  // ensure paths are within schema
  paths = lodash.filter(paths, (pathName) => !lodash.isEmpty(schema.path(pathName)));

  // return found paths
  return paths;
};

/**
 * @function parseErrorValues
 * @name parseErrorValues
 * @description Parse paths value found in unique mongodb error.
 * @param {string[]} paths paths found in unique mongodb error.
 * @param {Error} error valid mongodb error.
 * @returns {string[]} found paths value from error.
 * @version 0.19.0
 * @since 0.1.0
 * @private
 */
const parseErrorValues = (paths, error) => {
  // back off if no error message
  if (!error.message) {
    return [];
  }

  // obtain paths value
  let values = lodash.nth(error.message.match(/dup key: { (.+?) }/), 1) || '';
  values = common.uniq(
    [].concat(values.match(/'(.+?)'/g)).concat(values.match(/"(.+?)"/g))
  ); // enclosed with quotes
  values = lodash.map(values, (v) => v.replace(/^"(.+?)"$/, '$1')); // double quotes
  values = lodash.map(values, (v) => v.replace(/^'(.+?)'$/, '$1')); // single quotes
  values = paths.length === 1 ? [values.join(' ')] : values;

  // return parsed paths values
  return values;
};

/**
 * @function uniqueErrorPlugin
 * @name uniqueErrorPlugin
 * @description Plugin to handle mongodb unique error
 * @param {object} schema valid mongoose schema
 * @version 0.2.0
 * @since 0.1.0
 * @public
 */
function uniqueErrorPlugin(schema) {
  /**
   * @function handleUniqueError
   * @name handleUniqueError
   * @description Handle mongodb unique error and transform to mongoose error
   * @param {Error|object} error valid mongodb unique error
   * @param {object} doc valid mongoose document
   * @param {Function} next callback to invoke on success or error
   * @returns {Error} valid mongoose error
   * @version 0.2.0
   * @since 0.1.0
   * @private
   */
  function handleUniqueError(error, doc, next) {
    // this: Model instance context

    // obtain current instance
    const instance = doc || this;

    // continue if is not unique error
    if (!isUniqueError(error)) {
      return next(error);
    }

    // obtain index name
    const indexName =
      lodash.nth(error.message.match(/index: (.+?) dup key:/), 1) || '';

    // obtain unique paths from error
    const paths = parseErrorPaths(schema, error);

    // obtain paths value from error
    const values = parseErrorValues(paths, error);

    // build mongoose validations error bag
    if (!lodash.isEmpty(paths) && !lodash.isEmpty(values)) {
      const errors = {};

      lodash.forEach(paths, (pathName, index) => {
        // construct path error properties
        let pathValue = lodash.nth(values, index);
        if (lodash.isFunction(instance.get)) {
          pathValue = instance.get(pathName);
        }
        const props = {
          type: 'unique',
          path: pathName,
          value: pathValue,
          message: 'Path `{PATH}` ({VALUE}) is not unique.',
          reason: error.message,
          index: indexName,
        };

        // construct path validation error
        const pathError = new mongoose.Error.ValidatorError(props);
        pathError.index = indexName;
        errors[pathName] = pathError;
      });

      // build mongoose validation error
      const err = new mongoose.Error.ValidationError();
      err.status = err.status || 400;
      err.errors = errors;

      return next(err);
    }

    // continue with error
    return next(error);
  }

  // plugin unique error handler
  schema.post('save', handleUniqueError);
  schema.post('insertMany', handleUniqueError);
  schema.post('findOneAndReplace', handleUniqueError);
  schema.post('findOneAndUpdate', handleUniqueError);
  schema.post('replaceOne', handleUniqueError);
  schema.post('update', handleUniqueError);
  schema.post('updateMany', handleUniqueError);
  schema.post('updateOne', handleUniqueError);
}

/**
 * @function path
 * @name path
 * @description obtain schema path from model
 * @param {object} schema valid mongoose schema instance
 * @version 0.1.0
 * @since 0.1.0
 * @public
 */
const pathPlugin = (schema) => {
  // register path
  const canNotGetPath = !lodash.isFunction(schema.statics.path);

  if (canNotGetPath) {
    // eslint-disable-next-line no-param-reassign
    schema.statics.path = function path(pathName) {
      // initalize path
      let $path;

      // tokenize path
      const paths = lodash.split(pathName, '.');

      // iterate on schema recursive to get path schema
      lodash.forEach(paths, function getPath(part) {
        // obtain schema to resolve path
        const $schema = $path ? $path.schema : schema;
        $path = $schema && $schema.path ? $schema.path(part) : undefined;
      });

      // fall back to direct path
      $path = $path || schema.path(pathName);

      // return found path
      return $path;
    };
  }
};

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
  const BASE_PATH = env.getString('BASE_PATH', process.cwd());
  let SEED_PATH = env.getString('SEED_PATH', path.join(BASE_PATH, 'seeds'));
  SEED_PATH = path.resolve(SEED_PATH, collectionName);

  // try load seeds from path
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    let seeds = require(SEED_PATH);
    // honor es6 default exports
    seeds = [].concat(lodash.isArray(seeds.default) ? seeds.default : seeds);
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
  let cb = lodash.noop;
  let filterFn = (val) => val;
  let transformFn = (val) => val;
  if (lodash.isFunction(data)) {
    cb = data;
  }
  if (lodash.isArray(data)) {
    seeds = [].concat(data);
  }
  if (lodash.isPlainObject(data)) {
    filterFn = data.filter || filterFn;
    transformFn = data.transform || transformFn;
    seeds = data.data || lodash.omit(data, 'filter', 'transform');
    seeds = lodash.isArray(seeds) ? seeds : common.mergeObjects(seeds);
    seeds = [].concat(seeds);
    seeds = lodash.filter(seeds, (seed) => !lodash.isEmpty(seed));
  }
  if (lodash.isFunction(done)) {
    cb = done || cb;
  }
  // let seeds = _.isFunction(data) ? [] : [].concat(data);
  // const cb = _.isFunction(data) ? data : done;

  // compact seeds
  const collectionName =
    lodash.get(this, 'collection.name') || lodash.get(this, 'collection.collectionName');

  // ignore path seeds if seed provided
  if (lodash.isEmpty(seeds)) {
    const pathSeeds = loadPathSeeds(collectionName);
    seeds = lodash.compact([...seeds, ...pathSeeds]);
    seeds = lodash.filter(seeds, (seed) => !lodash.isEmpty(seed));
  }

  // filter seeds
  seeds = lodash.filter(seeds, filterFn);

  // transform seeds
  seeds = lodash.map(seeds, transformFn);

  // filter empty seeds
  seeds = lodash.filter(seeds, (seed) => !lodash.isEmpty(seed));

  // find existing instance fullfill seed criteria
  const findExisting = (seed, afterFind) => {
    // map seed to criteria
    const canProvideCriteria = lodash.isFunction(this.prepareSeedCriteria);
    let prepareSeedCriteria = ($seed) => $seed;
    if (canProvideCriteria) {
      prepareSeedCriteria = this.prepareSeedCriteria;
    }
    let criteria = prepareSeedCriteria(seed);
    criteria = lodash.omit(criteria, 'populate');

    // find existing data
    return this.findOne(criteria, afterFind);
  };

  // fetch existing dependency
  const fetchDependency = (dependency, afterDependency) => {
    // obtain options
    const { model, match, select, array } = dependency;

    const afterFetchDependency = (error, found) => {
      const result = lodash.isEmpty(found) ? undefined : found;
      return afterDependency(error, result);
    };

    // try fetch with provide options
    if (lodash.isString(model) && lodash.isPlainObject(match)) {
      try {
        const Model = mongoose.model(model);
        if (array) {
          return Model.find(
            match,
            common.mergeObjects(select, { _id: 1 }),
            { autopopulate: false },
            afterFetchDependency
          );
        }
        return Model.findOne(
          match,
          common.mergeObjects(select, { _id: 1 }),
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
    return async.waterfall(
      [
        (next) => {
          if (lodash.isEmpty(ignore)) {
            return next(null, []);
          }
          const ignoreCriteria = lodash.omit(ignore, 'select');
          return fetchDependency(ignoreCriteria, next);
        }, // fetch ignored
        (ignored, next) => {
          // use ignored
          const ignorePath = ignore.path || '_id';
          const ignoredIds = lodash.compact(
            lodash.map([].concat(ignored), (val) => common.idOf(val))
          );
          const { model, select, array } = common.mergeObjects(dependency);
          let { match } = common.mergeObjects(dependency);
          if (!lodash.isEmpty(ignoredIds)) {
            match = common.mergeObjects(
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
    let dependencies = common.mergeObjects(seed.populate);
    if (lodash.isPlainObject(dependencies) && !lodash.isEmpty(dependencies)) {
      dependencies = lodash.mapValues(dependencies, (dependency) => {
        return (afterDependency) => {
          return fetchDependencyExcludeIgnore(dependency, afterDependency);
        };
      });
      return async.parallel(dependencies, afterDependencies);
    }
    return afterDependencies(null, seed);
  };

  // merge existing with seed data
  const mergeOne = (found, $data, afterMergeOne) => {
    if (found) {
      const SEED_FRESH = env.getBoolean('SEED_FRESH', false);
      let updates = {};
      if (SEED_FRESH) {
        updates = common.mergeObjects(found.toObject(), $data);
      } else {
        updates = common.mergeObjects($data, found.toObject());
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
    return async.waterfall(
      [
        (next) => {
          fetchDependencies(seed, (error, dependencies) => {
            if (error) {
              return next(error);
            }
            lodash.forEach(dependencies, (value, key) => {
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
  seeds = lodash.map(seeds, (seed) => {
    return (next) => upsertOne(seed, next);
  });

  // run seeds
  return async.parallel(seeds, cb);
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
  const cb = lodash.isFunction(data) ? data : done;

  // clear model data
  const doClear = (next) => this.deleteMany((error) => next(error));

  // seed model data
  const doSeed = (next) =>
    lodash.isFunction(data) ? this.seed(next) : this.seed(data, next);

  // run clear then seed
  return async.waterfall([doClear, doSeed], cb);
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
function seedPlugin(schema) {
  const canNotSeed = !lodash.isFunction(schema.statics.seed);
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

/**
 * @module mongoose-common
 * @name mongoose-common
 * @description Re-usable helpers for mongoose
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since  0.1.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const {
 *   connect,
 *   clear,
 *   drop,
 *   disconnect,
 * } = require('@lykmapipo/mongoose-common');
 *
 * connect((error) => { ... });
 * clear((error) => { ... });
 * drop((error) => { ... });
 * disconnect((error) => { ... });
 */

// set global mongoose promise
mongoose.Promise = global.Promise;

/**
 * @name path
 * @description register path schema plugin
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const name = User.path('name');
 * //=> SchemaString { path: 'name', instance: 'String', ... }
 */
mongoose.plugin(pathPlugin); // TODO: ignore global

/**
 * @name error
 * @description unique error handler schema plugin
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
mongoose.plugin(uniqueErrorPlugin); // TODO: ignore global

/**
 * @name seed
 * @description data seed schema plugin
 * @since 0.21.0
 * @version 0.1.0
 * @public
 */
mongoose.plugin(seedPlugin); // TODO: ignore global

// expose shortcuts
const { STATES } = mongoose;
const { Aggregate } = mongoose;
const { Collection } = mongoose;
const { Connection } = mongoose;
const { Schema } = mongoose;
const { SchemaType } = mongoose;
const { SchemaTypes } = mongoose;
const { VirtualType } = mongoose;
const { Types } = mongoose;
const MongooseTypes = mongoose.Types;
const { Query } = mongoose;
const MongooseError = mongoose.Error;
const { CastError } = mongoose;
const modelNames = () => mongoose.modelNames();
const { GridFSBucket } = mongoose.mongo;

// schema types shortcuts

const SchemaString = Schema.Types.String;
const SchemaNumber = Schema.Types.Number;
const SchemaBoolean = Schema.Types.Boolean;
const { DocumentArray } = Schema.Types;
const SchemaDocumentArray = Schema.Types.DocumentArray;
const SubDocument = Schema.Types.Subdocument;
const SchemaSubDocument = Schema.Types.Subdocument;
const Embedded = SubDocument;
const SchemaEmbedded = SubDocument;
const SchemaArray = Schema.Types.Array;
const SchemaBuffer = Schema.Types.Buffer;
const SchemaDate = Schema.Types.Date;
const { ObjectId } = Schema.Types;
const SchemaObjectId = Schema.Types.ObjectId;
const { Mixed } = Schema.Types;
const SchemaMixed = Schema.Types.Mixed;
const { Decimal128 } = Schema.Types;
const SchemaDecimal = Decimal128;
const SchemaDecimal128 = Decimal128;
const SchemaMap = Schema.Types.Map;

/**
 * @name LOOKUP_FIELDS
 * @description Common lookup fields used in aggregation
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.13.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const { LOOKUP_FIELDS } = require('@lykmapipo/mongoose-common');
 * //=> ['from', 'localField', 'foreignField', 'as']
 */
const LOOKUP_FIELDS = ['from', 'localField', 'foreignField', 'as'];

/**
 * @function toCollectionName
 * @name toCollectionName
 * @description Produces a collection name of provided model name
 * @param {string} modelName a model name
 * @returns {string} a collection name
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.8.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const collectionName = toCollectionName('User');
 * //=> users
 */
const toCollectionName = (modelName) => {
  let collectionName = modelName;
  if (!lodash.isEmpty(modelName)) {
    collectionName = mongoose.pluralize()(modelName);
  }
  return collectionName;
};

/**
 * @function isObjectId
 * @name isObjectId
 * @description Check if provided value is an instance of ObjectId
 * @param {Mixed} val value to check if its an ObjectId
 * @author lally elias <lallyelias87@mail.com>
 * @returns {boolean} whether a val is ObjectId instance
 * @since 0.2.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isObjectId(val);
 * //=> true
 */
const isObjectId = (val) => {
  const $isObjectId = val instanceof mongoose.Types.ObjectId;
  return $isObjectId;
};

/**
 * @function isMap
 * @name isMap
 * @description Check if provided value is an instance of Map
 * @param {Mixed} val value to check if its a Map
 * @author lally elias <lallyelias87@mail.com>
 * @returns {boolean} whether a val is Map instance
 * @since 0.2.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isMap(val);
 * //=> true
 */
const isMap = (val) => {
  const $isMap = val instanceof mongoose.Types.Map;
  return $isMap;
};

/**
 * @function isString
 * @name isString
 * @description Check if provided value is an instance of String schema type
 * @param {Mixed} val value to check if its a String schema type
 * @author lally elias <lallyelias87@mail.com>
 * @returns {boolean} whether a val is String instance
 * @since 0.10.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isString(val);
 * //=> true
 */
const isString = (val) => {
  const $isString = val instanceof Schema.Types.String;
  return $isString;
};

/**
 * @function isArraySchemaType
 * @name isArraySchemaType
 * @description check if schema type is array
 * @param {SchemaType} val valid mongoose schema type
 * @returns {boolean} whether schema type is array
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.16.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isArraySchemaType(val)
 * //=> true
 */
const isArraySchemaType = (val = {}) => {
  const { $isMongooseArray = false, instance } = val;
  const isArray =
    val instanceof Schema.Types.Array ||
    $isMongooseArray ||
    instance === 'Array';
  return isArray;
};

/**
 * @function isStringArray
 * @name isStringArray
 * @description Check if provided value is an instance of StringArray
 * schema type
 * @param {Mixed} val value to check if its a StringArray schema type
 * @author lally elias <lallyelias87@mail.com>
 * @returns {boolean} whether a val is String Array instance
 * @since 0.11.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isStringArray(val);
 * //=> true
 */
const isStringArray = (val) => {
  const $isStringArray =
    val &&
    val instanceof Schema.Types.Array &&
    val.caster instanceof Schema.Types.String;
  return $isStringArray;
};

/**
 * @function isNumber
 * @name isNumber
 * @description Check if provided value is an instance of Number schema type
 * @param {Mixed} val value to check if its a Number schema type
 * @author lally elias <lallyelias87@mail.com>
 * @returns {boolean} whether a val is Number instance
 * @since 0.10.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isNumber(<val>);
 * //=> true
 */
const isNumber = (val) => {
  const $isNumber = val instanceof Schema.Types.Number;
  return $isNumber;
};

/**
 * @function isNumberArray
 * @name isNumberArray
 * @description Check if provided value is an instance of NumberArray
 * schema type
 * @param {Mixed} val value to check if its a NumberArray schema type
 * @author lally elias <lallyelias87@mail.com>
 * @returns {boolean} whether a val is Number Array instance
 * @since 0.11.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isNumberArray(val);
 * //=> true
 */
const isNumberArray = (val) => {
  const $isNumberArray =
    val &&
    val instanceof Schema.Types.Array &&
    val.caster instanceof Schema.Types.Number;
  return $isNumberArray;
};

/**
 * @function isInstance
 * @name isInstance
 * @description check if object is valid mongoose model instance
 * @param {object} value valid object
 * @returns {boolean} whether object is valid model instance
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.4.0
 * @version 0.2.0
 * @public
 * @example
 *
 * isInstance(val);
 * //=> true
 */
const isInstance = (value) => {
  if (value) {
    const $isInstance =
      lodash.isFunction(lodash.get(value, 'toObject', null)) &&
      !lodash.isNull(lodash.get(value, '$__', null));
    return $isInstance;
  }
  return false;
};

/**
 * @name copyInstance
 * @description copy and return plain object of mongoose model instance
 * @param {object} value valid object
 * @returns {object} plain object from mongoose model instance
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.4.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const instance = copyInstance(val);
 * //=> { ... }
 */
const copyInstance = (value = {}) => common.mergeObjects(utils.toObject(value));

/**
 * @function schemaTypeOptionOf
 * @name schemaTypeOptionOf
 * @description obtain schema type options
 * @param {SchemaType} schemaType valid mongoose schema type
 * @returns {object} schema type options
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.14.0
 * @version 0.1.0
 * @private
 * @example
 *
 * const options = schemaTypeOptionOf(schemaType)
 * //=> { trim: true, ... }
 */
const schemaTypeOptionOf = (schemaType = {}) => {
  // grab options
  const options = common.mergeObjects(
    // grub schema caster options
    lodash.toPlainObject(lodash.get(schemaType, 'caster.options')),
    // grab direct schema options
    lodash.toPlainObject(lodash.get(schemaType, 'options'))
  );
  // return options
  return options;
};

/**
 * @function eachPath
 * @name eachPath
 * @description iterate recursively on schema primitive paths and invoke
 * provided iteratee function.
 * @param {object} schema valid instance of mongoose schema
 * @param {Function} iteratee callback function invoked per each path found.
 * The callback is passed the pathName, parentPath and schemaType as arguments
 * on each iteration.
 * @see {@link https://mongoosejs.com/docs/api.html#schema_Schema-eachPath}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 *
 * eachPath(schema, (path, schemaType) => { ... });
 */
const eachPath = (schema, iteratee) => {
  /**
   * @name iterateRecursive
   * @description recursivily search for a schema path
   * @param {string} pathName valid schema path name
   * @param {object} schemaType valid schema type
   * @param {string} parentPath parent schema path
   */
  function iterateRecursive(pathName, schemaType, parentPath) {
    // compute path name
    const $path = common.compact([parentPath, pathName]).join('.');

    // check if is sub schema
    const $isSchema =
      schemaType.schema && lodash.isFunction(schemaType.schema.eachPath);

    // iterate over sub schema
    if ($isSchema) {
      const { schema: subSchema } = schemaType;
      subSchema.eachPath(function iterateSubSchema($pathName, $schemaType) {
        iterateRecursive($pathName, $schemaType, $path);
      });
    }

    // invoke iteratee
    else {
      iteratee($path, schemaType);
    }
  }

  // iterate recursive
  schema.eachPath(function iterateParentSchema(pathName, schemaType) {
    iterateRecursive(pathName, schemaType);
  });
};

/**
 * @function jsonSchema
 * @name jsonSchema
 * @description Produces valid json schema of all available models
 * if `mongoose-schema-jsonschema` has been applied
 * @author lally elias <lallyelias87@mail.com>
 * @returns {object[]} models json schema
 * @since 0.8.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const jsonSchema = jsonSchema();
 * //=> {"user": {title: "User", type: "object", properties: {..} } }
 */
const jsonSchema = () => {
  // initialize schemas dictionary
  const schemas = {};
  // get model names
  const $modelNames = mongoose.modelNames();
  // loop model names to get schemas
  lodash.forEach($modelNames, function getJsonSchema(modelName) {
    // get model
    const Model = mongooseConnection.model(modelName);
    // collect model json schema
    if (Model && lodash.isFunction(Model.jsonSchema)) {
      schemas[modelName] = Model.jsonSchema();
    }
  });
  // return available schemas
  return schemas;
};

/**
 * @function validationErrorFor
 * @name validationErrorFor
 * @description Create mongoose validation error for specified options
 * @param {object} optns valid error options
 * @param {number | string} [optns.status] valid error status
 * @param {number | string} [optns.code] valid error code
 * @param {object} [optns.paths] paths with validator error properties
 * @returns {object} valid instance of mongoose validation error
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.24.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const status = 400;
 * const paths = {
 *   name: { type: 'required', path:'name', value: ..., message: ...  }
 * };
 * const error = validationErrorFor({ status, paths });
 * //=> error
 */
const validationErrorFor = (optns) => {
  // obtain options
  const { status = 400, code = 400, paths = {} } = common.mergeObjects(optns);

  // create mongoose validation error
  const error = new mongoose.Error.ValidationError();
  error.status = status;
  error.code = code || status;
  // eslint-disable-next-line no-underscore-dangle
  error.message = error.message || error._message;

  // attach path validator error
  if (!lodash.isEmpty(paths)) {
    const errors = {};
    lodash.forEach(paths, (props, path) => {
      let pathError = common.mergeObjects({ path }, props);
      pathError = new mongoose.Error.ValidatorError(pathError);
      errors[path] = pathError;
    });
    error.errors = errors;
  }

  // return validation error
  return error;
};

/**
 * @function areSameInstance
 * @name areSameInstance
 * @description check if given two mongoose model instances are same
 * @param {object} a valid model instance
 * @param {object} b valid model instance
 * @returns {boolean} whether model instance are same
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.31.0
 * @version 0.1.0
 * @public
 * @example
 *
 * areSameInstance(a, a); //=> true
 */
const areSameInstance = (a, b) => {
  try {
    const areSame = !!(a && b && a.equals(b));
    return areSame;
  } catch (e) {
    return false;
  }
};

/**
 * @function areSameObjectId
 * @name areSameObjectId
 * @description check if given two mongoose objectid are same
 * @param {object} a valid object id
 * @param {object} b valid object
 * @returns {boolean} whether objectid's are same
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.31.0
 * @version 0.1.0
 * @public
 * @example
 *
 * areSameObjectId(a, a); //=> true
 */
const areSameObjectId = (a, b) => {
  try {
    // grab actual ids
    const idOfA = common.idOf(a) || a;
    const idOfB = common.idOf(b) || b;

    // convert to string
    const idA = isObjectId(idOfA) ? idOfA.toString() : idOfA;
    const idB = isObjectId(idOfB) ? idOfB.toString() : idOfB;

    // check if are equal
    const areSame = idA === idB;
    return areSame;
  } catch (e) {
    return false;
  }
};

/**
 * @function toObjectIds
 * @name toObjectIds
 * @description convert given model instances into object ids
 * @param {...object} instances valid model instances
 * @returns {object[]} objectid's of model instances
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.31.0
 * @version 0.1.0
 * @public
 * @example
 *
 * toObjectIds(a, b); //=> [ '5e90486301de071ca4ebc03d', ... ]
 */
const toObjectIds = (...instances) => {
  const ids = lodash.map([...instances], (instance) => {
    const id = common.idOf(instance) || instance;
    return id;
  });
  return ids;
};

/**
 * @function toObjectIdStrings
 * @name toObjectIdStrings
 * @description convert given model instances objectid's into strings
 * @param {...object} instances valid model instances
 * @returns {string[]} objectid's as strings
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.31.0
 * @version 0.1.0
 * @public
 * @example
 *
 * toObjectIdStrings(a, b); //=> [ '5e90486301de071ca4ebc03d', ... ]
 */
const toObjectIdStrings = (...instances) => {
  const ids = toObjectIds(...instances);
  const idStrings = lodash.map([...ids], (id) => {
    const idString = isObjectId(id) ? id.toString() : id;
    return idString;
  });
  return idStrings;
};

/**
 * @function objectIdFor
 * @name objectIdFor
 * @description create a unique objectid of a given model values
 * @param {...string} modelName valid model name
 * @param {...string} parts values to generate object id for
 * @returns {object} valid objectid
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.36.0
 * @version 0.1.0
 * @public
 * @example
 *
 * objectIdFor('Party', 'TZ-0101');
 * //=> '5e90486301de071ca4ebc03d'
 */
const objectIdFor = (modelName, ...parts) => {
  // ensure parts
  const values = common.compact([].concat(modelName).concat(...parts));

  // ensure secret & message
  const secret = lodash.head(values);
  const data = common.join(lodash.tail(values), ':');

  // generate 24-byte hex hash
  const hash = crypto.createHmac('md5', secret)
    .update(data)
    .digest('hex')
    .slice(0, 24);

  // create objectid from hash
  const objectId = mongoose.Types.ObjectId.createFromHexString(hash);

  return objectId;
};

Object.defineProperty(exports, 'SCHEMA_OPTIONS', {
  enumerable: true,
  get: function () { return mongooseConnection.SCHEMA_OPTIONS; }
});
Object.defineProperty(exports, 'SUB_SCHEMA_OPTIONS', {
  enumerable: true,
  get: function () { return mongooseConnection.SUB_SCHEMA_OPTIONS; }
});
Object.defineProperty(exports, 'clear', {
  enumerable: true,
  get: function () { return mongooseConnection.clear; }
});
Object.defineProperty(exports, 'collectionNameOf', {
  enumerable: true,
  get: function () { return mongooseConnection.collectionNameOf; }
});
Object.defineProperty(exports, 'connect', {
  enumerable: true,
  get: function () { return mongooseConnection.connect; }
});
Object.defineProperty(exports, 'createModel', {
  enumerable: true,
  get: function () { return mongooseConnection.createModel; }
});
Object.defineProperty(exports, 'createSchema', {
  enumerable: true,
  get: function () { return mongooseConnection.createSchema; }
});
Object.defineProperty(exports, 'createSubSchema', {
  enumerable: true,
  get: function () { return mongooseConnection.createSubSchema; }
});
Object.defineProperty(exports, 'createVarySubSchema', {
  enumerable: true,
  get: function () { return mongooseConnection.createVarySubSchema; }
});
Object.defineProperty(exports, 'disableDebug', {
  enumerable: true,
  get: function () { return mongooseConnection.disableDebug; }
});
Object.defineProperty(exports, 'disconnect', {
  enumerable: true,
  get: function () { return mongooseConnection.disconnect; }
});
Object.defineProperty(exports, 'drop', {
  enumerable: true,
  get: function () { return mongooseConnection.drop; }
});
Object.defineProperty(exports, 'enableDebug', {
  enumerable: true,
  get: function () { return mongooseConnection.enableDebug; }
});
Object.defineProperty(exports, 'isAggregate', {
  enumerable: true,
  get: function () { return mongooseConnection.isAggregate; }
});
Object.defineProperty(exports, 'isConnected', {
  enumerable: true,
  get: function () { return mongooseConnection.isConnected; }
});
Object.defineProperty(exports, 'isConnection', {
  enumerable: true,
  get: function () { return mongooseConnection.isConnection; }
});
Object.defineProperty(exports, 'isModel', {
  enumerable: true,
  get: function () { return mongooseConnection.isModel; }
});
Object.defineProperty(exports, 'isQuery', {
  enumerable: true,
  get: function () { return mongooseConnection.isQuery; }
});
Object.defineProperty(exports, 'isSchema', {
  enumerable: true,
  get: function () { return mongooseConnection.isSchema; }
});
Object.defineProperty(exports, 'model', {
  enumerable: true,
  get: function () { return mongooseConnection.model; }
});
Object.defineProperty(exports, 'syncIndexes', {
  enumerable: true,
  get: function () { return mongooseConnection.syncIndexes; }
});
exports.Aggregate = Aggregate;
exports.CastError = CastError;
exports.Collection = Collection;
exports.Connection = Connection;
exports.Decimal128 = Decimal128;
exports.DocumentArray = DocumentArray;
exports.Embedded = Embedded;
exports.GridFSBucket = GridFSBucket;
exports.LOOKUP_FIELDS = LOOKUP_FIELDS;
exports.Mixed = Mixed;
exports.MongooseError = MongooseError;
exports.MongooseTypes = MongooseTypes;
exports.ObjectId = ObjectId;
exports.Query = Query;
exports.STATES = STATES;
exports.Schema = Schema;
exports.SchemaArray = SchemaArray;
exports.SchemaBoolean = SchemaBoolean;
exports.SchemaBuffer = SchemaBuffer;
exports.SchemaDate = SchemaDate;
exports.SchemaDecimal = SchemaDecimal;
exports.SchemaDecimal128 = SchemaDecimal128;
exports.SchemaDocumentArray = SchemaDocumentArray;
exports.SchemaEmbedded = SchemaEmbedded;
exports.SchemaMap = SchemaMap;
exports.SchemaMixed = SchemaMixed;
exports.SchemaNumber = SchemaNumber;
exports.SchemaObjectId = SchemaObjectId;
exports.SchemaString = SchemaString;
exports.SchemaSubDocument = SchemaSubDocument;
exports.SchemaType = SchemaType;
exports.SchemaTypes = SchemaTypes;
exports.SubDocument = SubDocument;
exports.Types = Types;
exports.VirtualType = VirtualType;
exports.areSameInstance = areSameInstance;
exports.areSameObjectId = areSameObjectId;
exports.copyInstance = copyInstance;
exports.eachPath = eachPath;
exports.isArraySchemaType = isArraySchemaType;
exports.isInstance = isInstance;
exports.isMap = isMap;
exports.isNumber = isNumber;
exports.isNumberArray = isNumberArray;
exports.isObjectId = isObjectId;
exports.isString = isString;
exports.isStringArray = isStringArray;
exports.jsonSchema = jsonSchema;
exports.modelNames = modelNames;
exports.objectIdFor = objectIdFor;
exports.schemaTypeOptionOf = schemaTypeOptionOf;
exports.toCollectionName = toCollectionName;
exports.toObjectIdStrings = toObjectIdStrings;
exports.toObjectIds = toObjectIds;
exports.validationErrorFor = validationErrorFor;
