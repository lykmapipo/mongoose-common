'use strict';

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
 *
 */

/* dependencies */
const _ = require('lodash');
const { createHmac } = require('crypto');
const { compact, idOf, join, mergeObjects } = require('@lykmapipo/common');
const mongoose = require('mongoose-valid8');
const { toObject } = require('mongoose/lib/utils');
const {
  SCHEMA_OPTIONS,
  SUB_SCHEMA_OPTIONS,
  enableDebug,
  disableDebug,
  isConnection,
  isSchema,
  isModel,
  isQuery,
  isAggregate,
  isConnected,
  collectionNameOf,
  connect,
  disconnect,
  clear,
  drop,
  model,
  syncIndexes,
  createSubSchema,
  createSchema,
  createVarySubSchema,
  createModel,
} = require('@lykmapipo/mongoose-connection');
const { Schema, Connection, Query, Aggregate } = mongoose;

/* set global mongoose promise */
mongoose.Promise = global.Promise;

/**
 * @description register jsonschema schema plugin
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const jsonSchema = User.jsonSchema();
 */
require('mongoose-schema-jsonschema')(mongoose); // TODO: ignore global

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
 *
 */
mongoose.plugin(require('./lib/path.plugin')); // TODO: ignore global

/**
 * @name error
 * @description unique error handler schema plugin
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
mongoose.plugin(require('./lib/error.plugin')); // TODO: ignore global

/**
 * @name seed
 * @description data seed schema plugin
 * @since 0.21.0
 * @version 0.1.0
 * @public
 */
mongoose.plugin(require('./lib/seed.plugin')); // TODO: ignore global

/* expose shortcuts */
exports.Schema = Schema;
exports.SchemaTypes = Schema.Types;
exports.SchemaType = mongoose.SchemaType;
exports.VirtualType = mongoose.VirtualType;
exports.Types = exports.MongooseTypes = mongoose.Types;
exports.Error = exports.MongooseError = mongoose.Error;
exports.CastError = mongoose.CastError;
exports.STATES = mongoose.STATES;
exports.modelNames = () => mongoose.modelNames();
exports.GridFSBucket = mongoose.mongo.GridFSBucket;
exports.Connection = Connection;
exports.Query = Query;
exports.Aggregate = Aggregate;

/* schema types shortcuts*/
exports.String = exports.SchemaString = Schema.Types.String;
exports.Number = exports.SchemaNumber = Schema.Types.Number;
exports.Boolean = exports.SchemaBoolean = Schema.Types.Boolean;
exports.DocumentArray = exports.SchemaDocumentArray =
  Schema.Types.DocumentArray;
exports.Embedded = exports.SchemaEmbedded = Schema.Types.Embedded;
exports.Array = exports.SchemaArray = Schema.Types.Array;
exports.Buffer = exports.SchemaBuffer = Schema.Types.Buffer;
exports.Date = exports.SchemaDate = Schema.Types.Date;
exports.ObjectId = exports.SchemaObjectId = Schema.Types.ObjectId;
exports.Mixed = exports.SchemaMixed = Schema.Types.Mixed;
exports.Decimal = exports.SchemaDecimal = Schema.Types.Decimal;
exports.Map = exports.SchemaMap = Schema.Types.Map;

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
 *
 */
exports.LOOKUP_FIELDS = ['from', 'localField', 'foreignField', 'as'];

/**
 * @name SCHEMA_OPTIONS
 * @description Common options to set on schema
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const { SCHEMA_OPTIONS } = require('@lykmapipo/mongoose-common');
 * //=> { timestamps: true, ... }
 *
 */
exports.SCHEMA_OPTIONS = SCHEMA_OPTIONS;

/**
 * @name SUB_SCHEMA_OPTIONS
 * @description Common options to set on sub doc schema
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const { SUB_SCHEMA_OPTIONS } = require('@lykmapipo/mongoose-common');
 * //=> { timestamps: false, ... }
 */
exports.SUB_SCHEMA_OPTIONS = SUB_SCHEMA_OPTIONS;

/**
 * @function isConnection
 * @name isConnection
 * @description Check if provided value is an instance of mongoose connection
 * @param {Mixed} val value to check if its a Connection
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.6.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isConnection(conn);
 * //=> true
 *
 */
exports.isConnection = isConnection;

/**
 * @function isConnected
 * @name isConnected
 * @description Check if provided mongoose connection is connected
 * @param {Connection} val valid mongoose connection to check it state
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.6.1
 * @version 0.2.0
 * @public
 * @example
 *
 * isConnected(conn);
 * //=> true
 *
 */
exports.isConnected = isConnected;

/**
 * @function isSchema
 * @name isSchema
 * @description Check if provided value is an instance of mongoose schema
 * @param {Mixed} val value to check if its a Schema
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.6.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isSchema(schema);
 * //=> true
 *
 */
exports.isSchema = isSchema;

/**
 * @function isModel
 * @name isModel
 * @description Check if provided value is valid of mongoose model
 * @param {Mixed} val value to check if its a mongoose model
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.17.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isModel(model);
 * //=> true
 *
 */
exports.isModel = isModel;

/**
 * @function isQuery
 * @name isQuery
 * @description Check if provided value is an instance of mongoose query
 * @param {Mixed} val value to check if its a query instance
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.12.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isQuery(query);
 * //=> true
 *
 */
exports.isQuery = isQuery;

/**
 * @function isAggregate
 * @name isAggregate
 * @description Check if provided value is an instance of mongoose aggregate
 * @param {Mixed} val value to check if its a aggregate instance
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.23.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isAggregate(query);
 * //=> true
 *
 */
exports.isAggregate = isAggregate;

/**
 * @function enableDebug
 * @name enableDebug
 * @description Enable internal mongoose debug option
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.20.0
 * @version 0.1.0
 * @public
 * @example
 *
 * enableDebug();
 *
 */
exports.enableDebug = enableDebug;

/**
 * @function disableDebug
 * @name disableDebug
 * @description Disable internal mongoose debug option
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.20.0
 * @version 0.1.0
 * @public
 * @example
 *
 * disableDebug();
 *
 */
exports.disableDebug = disableDebug;

/**
 * @function toCollectionName
 * @name toCollectionName
 * @description Produces a collection name of provided model name
 * @param {String} modelName a model name
 * @return {String} a collection name
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.8.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const collectionName = toCollectionName('User');
 * //=> users
 *
 */
exports.toCollectionName = (modelName) => {
  let collectionName = modelName;
  if (!_.isEmpty(modelName)) {
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
 * @since 0.2.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isObjectId(val);
 * //=> true
 *
 */
exports.isObjectId = (val) => {
  const _isObjectId = val instanceof mongoose.Types.ObjectId;
  return _isObjectId;
};

/**
 * @function isMap
 * @name isMap
 * @description Check if provided value is an instance of Map
 * @param {Mixed} val value to check if its a Map
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.2.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isMap(val);
 * //=> true
 *
 */
exports.isMap = (val) => {
  const _isMap = val instanceof mongoose.Types.Map;
  return _isMap;
};

/**
 * @function isString
 * @name isString
 * @description Check if provided value is an instance of String schema type
 * @param {Mixed} val value to check if its a String schema type
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.10.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isString(val);
 * //=> true
 */
exports.isString = (val) => {
  const _isString = val instanceof Schema.Types.String;
  return _isString;
};

/**
 * @function isArraySchemaType
 * @name isArraySchemaType
 * @description check if schema type is array
 * @param {SchemaType} val valid mongoose schema type
 * @return {Boolean} whether schema type is array
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.16.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isArraySchemaType(val)
 * //=> true
 *
 */
exports.isArraySchemaType = (val = {}) => {
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
 * @since 0.11.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isStringArray(val);
 * //=> true
 *
 */
exports.isStringArray = (val) => {
  const _isStringArray =
    val &&
    val instanceof Schema.Types.Array &&
    val.caster instanceof Schema.Types.String;
  return _isStringArray;
};

/**
 * @function isNumber
 * @name isNumber
 * @description Check if provided value is an instance of Number schema type
 * @param {Mixed} val value to check if its a Number schema type
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.10.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isNumber(<val>);
 * //=> true
 *
 */
exports.isNumber = (val) => {
  const _isNumber = val instanceof Schema.Types.Number;
  return _isNumber;
};

/**
 * @function isNumberArray
 * @name isNumberArray
 * @description Check if provided value is an instance of NumberArray
 * schema type
 * @param {Mixed} val value to check if its a NumberArray schema type
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.11.0
 * @version 0.1.0
 * @public
 * @example
 *
 * isNumberArray(val);
 * //=> true
 *
 */
exports.isNumberArray = (val) => {
  const _isNumberArray =
    val &&
    val instanceof Schema.Types.Array &&
    val.caster instanceof Schema.Types.Number;
  return _isNumberArray;
};

/**
 * @function isInstance
 * @name isInstance
 * @description check if object is valid mongoose model instance
 * @param {Object} value valid object
 * @returns {Boolean} whether object is valid model instance
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.4.0
 * @version 0.2.0
 * @public
 * @example
 *
 * isInstance(val);
 * //=> true
 *
 */
exports.isInstance = (value) => {
  if (value) {
    const _isInstance =
      _.isFunction(_.get(value, 'toObject', null)) &&
      !_.isNull(_.get(value, '$__', null));
    return _isInstance;
  }
  return false;
};

/**
 * @name copyInstance
 * @description copy and return plain object of mongoose model instance
 * @param {Object} value valid object
 * @returns {Object} plain object from mongoose model instance
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.4.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const instance = copyInstance(val);
 * //=> { ... }
 *
 */
exports.copyInstance = (value = {}) => mergeObjects(toObject(value));

/**
 * @function schemaTypeOptionOf
 * @name schemaTypeOptionOf
 * @description obtain schema type options
 * @param {SchemaType} schemaType valid mongoose schema type
 * @return {Object} schema type options
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.14.0
 * @version 0.1.0
 * @private
 * @example
 *
 * const options = schemaTypeOptionOf(schemaType)
 * //=> { trim: true, ... }
 *
 */
exports.schemaTypeOptionOf = (schemaType = {}) => {
  // grab options
  const options = mergeObjects(
    // grub schema caster options
    _.toPlainObject(_.get(schemaType, 'caster.options')),
    // grab direct schema options
    _.toPlainObject(_.get(schemaType, 'options'))
  );
  // return options
  return options;
};

/**
 * @function collectionNameOf
 * @name collectionNameOf
 * @description obtain collection name of provided model name
 * @param {String} modelName valid model name
 * @return {String} underlying collection of the model
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.16.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const collectionName = collectionNameOf('User');
 * //=> 'users'
 *
 */
exports.collectionNameOf = collectionNameOf;

// TODO return default connection
// TODO return created connection
// TODO create new connection

/**
 * @function connect
 * @name connect
 * @description Opens the default mongoose connection
 * @param {String} [url] valid mongodb conenction string. if not provided it
 * will be obtained from process.env.MONGODB_URI or package name prefixed with
 * current execution environment name
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.3.1
 * @public
 * @example
 *
 * connect(done);
 * connect(url, done);
 *
 */
exports.connect = connect;

/**
 * @function disconnect
 * @name disconnect
 * @description Close all mongoose connection
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 *
 * disconnect(done);
 *
 */
exports.disconnect = disconnect;

/**
 * @function clear
 * @name clear
 * @description Clear provided collection or all if none give
 * @param {Connection} [connection] valid mongoose database connection. If not
 * provide default connection will be used.
 * @param {String[]|String|...String} modelNames name of models to clear
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.2.0
 * @public
 * @example
 *
 * clear(done);
 * clear('User', done);
 * clear('User', 'Profile', done);
 *
 */
exports.clear = clear;

/**
 * @function drop
 * @name drop
 * @description Deletes the given database, including all collections,
 * documents, and indexes
 * @param {Connection} [connection] valid mongoose database connection. If not
 * provide default connection will be used.
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.2.0
 * @public
 * @example
 *
 * drop(done);
 *
 */
exports.drop = drop;

/**
 * @function model
 * @name model
 * @description Try obtain already registered or register new model safely.
 * @param {String} [modelName] valid model name
 * @param {Schema} [schema] valid mongoose schema instance
 * @param {Connection} [connection] valid mongoose database connection. If not
 * provide default connection will be used.
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.2.0
 * @public
 * @example
 *
 * const User = model('User');
 * const User = model('User', Schema);
 *
 */
exports.model = model;

/**
 * @function eachPath
 * @name eachPath
 * @description iterate recursively on schema primitive paths and invoke
 * provided iteratee function.
 * @param {Schema} Schema valid instance of mongoose schema
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
 *
 */
exports.eachPath = (schema, iteratee) => {
  function iterateRecursive(pathName, schemaType, parentPath) {
    // compute path name
    const _path = _.compact([parentPath, pathName]).join('.');

    // check if is sub schema
    const isSchema =
      schemaType.schema && _.isFunction(schemaType.schema.eachPath);

    // iterate over sub schema
    if (isSchema) {
      const { schema: subSchema } = schemaType;
      subSchema.eachPath(function iterateSubSchema(_pathName, _schemaType) {
        iterateRecursive(_pathName, _schemaType, _path);
      });
    }

    // invoke iteratee
    else {
      iteratee(_path, schemaType);
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
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.8.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const jsonSchema = jsonSchema();
 * //=> {"user": {title: "User", type: "object", properties: {..} } }
 *
 */
exports.jsonSchema = () => {
  // initialize schemas dictionary
  let schemas = {};
  // get model names
  const modelNames = mongoose.modelNames();
  // loop model names to get schemas
  _.forEach(modelNames, function getJsonSchema(modelName) {
    // get model
    const Model = exports.model(modelName);
    // collect model json schema
    if (Model && _.isFunction(Model.jsonSchema)) {
      schemas[modelName] = Model.jsonSchema();
    }
  });
  //return available schemas
  return schemas;
};

/**
 * @function syncIndexes
 * @name syncIndexes
 * @description Sync indexes in MongoDB to match, indexes defined in schemas
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.20.0
 * @version 0.1.0
 * @public
 * @example
 *
 * syncIndexes(done);
 *
 */
exports.syncIndexes = syncIndexes;

/**
 * @function createSubSchema
 * @name createSubSchema
 * @description Create mongoose sub schema with no id and timestamp
 * @param {Object} definition valid model schema definition
 * @param {Object} [optns] valid schema options
 * @return {Schema} valid mongoose sub schema
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.21.0
 * @version 0.3.0
 * @public
 * @example
 *
 * const User = createSubSchema({ name: { type: String } });
 *
 */
exports.createSubSchema = createSubSchema;

/**
 * @function createSchema
 * @name createSchema
 * @description Create mongoose schema with timestamps
 * @param {Object} definition valid model schema definition
 * @param {Object} [optns] valid schema options
 * @param {...Function} [plugins] list of valid mongoose plugin to apply
 * @return {Schema} valid mongoose schema
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.23.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const User = createSchema({ name: { type: String } });
 *
 */
exports.createSchema = createSchema;

/**
 * @function createModel
 * @name createModel
 * @description Create and register mongoose model
 * @param {Object} schema valid model schema definition
 * @param {Object} options valid model schema options
 * @param {String} options.modelName valid model name
 * @param {...Function} [plugins] list of valid mongoose plugin to apply
 * @param {Connection} [connection] valid mongoose database connection. If not
 * provide default connection will be used.
 * @return {Model} valid mongoose model
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.21.0
 * @version 0.2.0
 * @public
 * @example
 *
 * const User = createModel({ name: { type: String } }, { name: 'User' });
 * const User = createModel(
 *  { name: { type: String } },
 *  { name: 'User' },
 *  autopopulate, hidden
 * );
 *
 */
exports.createModel = createModel;

/**
 * @function createVarySubSchema
 * @name createVarySubSchema
 * @description Create sub schema with variable paths
 * @param {Object} optns valid schema type options
 * @param {...Object|...String} paths variable paths to include on schema
 * @return {Schema} valid mongoose schema
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.22.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const locale = createVarySubSchema({ type: String }, 'en', 'sw');
 * const locale = createVarySubSchema(
 *  { type: String },
 *  { name: 'en': required: true },
 *  'sw'
 * );
 *
 */
exports.createVarySubSchema = createVarySubSchema;

/**
 * @function validationErrorFor
 * @name validationErrorFor
 * @description Create mongoose validation error for specified options
 * @param {Object} optns valid error options
 * @param {Number|String} [optns.status] valid error status
 * @param {Number|String} [optns.code] valid error code
 * @param {Object} [optns.paths] paths with validator error properties
 * @return {ValidationError} valid instance of mongoose validation error
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
 *
 */
exports.validationErrorFor = (optns) => {
  // obtain options
  const { status = 400, code = 400, paths = {} } = mergeObjects(optns);

  // create mongoose validation error
  const error = new mongoose.Error.ValidationError();
  error.status = status;
  error.code = code || status;
  error.message = error.message || error._message;

  // attach path validator error
  if (!_.isEmpty(paths)) {
    const errors = {};
    _.forEach(paths, (props, path) => {
      let pathError = mergeObjects({ path }, props);
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
 * @param {Object} a valid model instance
 * @param {Object} b valid model instance
 * @returns {Boolean} whether model instance are same
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.31.0
 * @version 0.1.0
 * @public
 * @example
 *
 * areSameInstance(a, a); //=> true
 *
 */
exports.areSameInstance = (a, b) => {
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
 * @param {Object} a valid object id
 * @param {Object} b valid object
 * @returns {Boolean} whether objectid's are same
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.31.0
 * @version 0.1.0
 * @public
 * @example
 *
 * areSameObjectId(a, a); //=> true
 *
 */
exports.areSameObjectId = (a, b) => {
  try {
    // grab actual ids
    const idOfA = idOf(a) || a;
    const idOfB = idOf(b) || b;

    // convert to string
    const idA = exports.isObjectId(idOfA) ? idOfA.toString() : idOfA;
    const idB = exports.isObjectId(idOfB) ? idOfB.toString() : idOfB;

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
 * @param {...Object} instances valid model instances
 * @returns {Object[]} objectid's of model instances
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.31.0
 * @version 0.1.0
 * @public
 * @example
 *
 * toObjectIds(a, b); //=> [ '5e90486301de071ca4ebc03d', ... ]
 *
 */
exports.toObjectIds = (...instances) => {
  const ids = _.map([...instances], (instance) => {
    const id = idOf(instance) || instance;
    return id;
  });
  return ids;
};

/**
 * @function toObjectIdStrings
 * @name toObjectIdStrings
 * @description convert given model instances objectid's into strings
 * @param {...Object} instances valid model instances
 * @returns {String[]} objectid's as strings
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.31.0
 * @version 0.1.0
 * @public
 * @example
 *
 * toObjectIdStrings(a, b); //=> [ '5e90486301de071ca4ebc03d', ... ]
 *
 */
exports.toObjectIdStrings = (...instances) => {
  const ids = exports.toObjectIds(...instances);
  const idStrings = _.map([...ids], (id) => {
    const idString = exports.isObjectId(id) ? id.toString() : id;
    return idString;
  });
  return idStrings;
};

/**
 * @function objectIdFor
 * @name objectIdFor
 * @description create a unique objectid of a given model values
 * @param {...String} model valid model name
 * @param {...String} parts values to generate object id for
 * @returns {Object} valid objectid
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.36.0
 * @version 0.1.0
 * @public
 * @example
 *
 * objectIdFor('Party', 'TZ-0101');
 * //=> '5e90486301de071ca4ebc03d'
 *
 */
exports.objectIdFor = (model, ...parts) => {
  // ensure parts
  const values = compact([].concat(model).concat(...parts));

  // ensure secret & message
  const secret = _.head(values);
  const data = join(_.tail(values), ':');

  // generate 24-byte hex hash
  const hash = createHmac('md5', secret)
    .update(data)
    .digest('hex')
    .slice(0, 24);

  // create objectid from hash
  const objectId = mongoose.Types.ObjectId.createFromHexString(hash);

  return objectId;
};
