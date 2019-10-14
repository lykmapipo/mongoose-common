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
const { parallel, waterfall } = require('async');
const { mergeObjects, uniq } = require('@lykmapipo/common');
const { getString } = require('@lykmapipo/env');
const { include } = require('@lykmapipo/include');
const mongoose = require('mongoose-valid8');
const { toObject } = require('mongoose/lib/utils');
const { Schema, Model, Connection, Query, Aggregate } = mongoose;

/* local helpers */
const isConnection = conn => conn instanceof Connection;

const isSchema = schema => schema instanceof Schema;

const isModel = model => model && model.prototype instanceof Model;

const isQuery = query => query instanceof Query;

const isAggregate = query => query instanceof Aggregate;

const isConnected = conn => isConnection(conn) && conn.readyState === 1;

/**
 * @deprecated
 */
mongoose.oldConnect = function () {
  const conn = mongoose.connection;
  return conn
    .openUri(arguments[0], arguments[1], arguments[2])
    .then(() => mongoose);
};

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
require('mongoose-schema-jsonschema')(mongoose);

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
mongoose.plugin(include(__dirname, 'lib', 'path.plugin'));

/**
 * @name error
 * @description unique error handler schema plugin
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
mongoose.plugin(include(__dirname, 'lib', 'error.plugin'));

/**
 * @name seed
 * @description data seed schema plugin
 * @since 0.21.0
 * @version 0.1.0
 * @public
 */
mongoose.plugin(include(__dirname, 'lib', 'seed.plugin'));

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
exports.SCHEMA_OPTIONS = {
  id: false,
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
  emitIndexErrors: true,
};

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
exports.SUB_SCHEMA_OPTIONS = {
  _id: false,
  id: false,
  timestamps: false,
  emitIndexErrors: true,
};

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
exports.isConnected = (conn = mongoose.connection) => isConnected(conn);

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
exports.enableDebug = () => mongoose.set('debug', true);

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
exports.disableDebug = () => mongoose.set('debug', false);

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
exports.toCollectionName = modelName => {
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
exports.isObjectId = val => {
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
exports.isMap = val => {
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
exports.isString = val => {
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
exports.isStringArray = val => {
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
exports.isNumber = val => {
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
exports.isNumberArray = val => {
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
exports.isInstance = value => {
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
    _.get(schemaType, 'caster.options'),
    // grab direct schema options
    _.get(schemaType, 'options')
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
exports.collectionNameOf = modelName => {
  // derive collection name from model
  const Ref = exports.model(modelName);
  let collectionName =
    _.get(Ref, 'collection.name') || _.get(Ref, 'collection.collectionName');

  // derive collection from model name
  if (_.isEmpty(collectionName)) {
    collectionName = exports.toCollectionName(modelName);
  }

  // return collection name
  return collectionName;
};

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
 * @version 0.2.0
 * @public
 * @example
 *
 * connect(done);
 * connect(url, done);
 *
 */
exports.connect = (url, done) => {
  // obtain current node runtime environment
  const NODE_ENV = getString('NODE_ENV', 'development');

  // ensure database name using environment and package
  let DB_NAME = NODE_ENV;
  try {
    DB_NAME = _.get(include('@cwd/package.json'), 'name', NODE_ENV);
    DB_NAME = _.toLower(_.last(_.split(DB_NAME, '/')));
    DB_NAME = DB_NAME === NODE_ENV ? DB_NAME : `${DB_NAME} ${NODE_ENV}`;
    DB_NAME = _.kebabCase(DB_NAME);
  } catch (e) { /*ignore*/ }
  DB_NAME = `mongodb://localhost/${DB_NAME}`;

  // ensure database uri from environment
  const MONGODB_URI = _.trim(getString('MONGODB_URI', DB_NAME)) || DB_NAME;

  // normalize arguments
  let uri = _.isFunction(url) ? MONGODB_URI : url;
  const _done = _.isFunction(url) ? url : done;

  // connection options
  const _options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  };

  // establish mongoose connection
  uri = _.trim(uri) || MONGODB_URI;
  mongoose.oldConnect(uri, _options, _done);
};

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
exports.disconnect = (connection, done) => {
  // normalize arguments
  const _connection = isConnection(connection) ? connection : undefined;
  const _done = !isConnection(connection) ? connection : done;

  // disconnect
  if (_connection) {
    _connection.close(_done);
  } else {
    mongoose.disconnect(_done);
  }
};

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
exports.clear = (...modelNames) => {
  // collect provided model names
  let _modelNames = [].concat(...modelNames);

  // obtain callback
  let _connection = _.first(
    _.filter([..._modelNames], function (v) {
      return isConnection(v);
    })
  );
  _connection = _connection || mongoose.connection;
  const _done = _.last(_.filter([..._modelNames], _.isFunction));

  // collect actual model names
  _modelNames = _.filter([..._modelNames], function (v) {
    return _.isString(v) || isModel(v);
  });

  // collect from connection.modelNames();
  if (_.isEmpty(_modelNames)) {
    _modelNames = [...modelNames].concat(_connection.modelNames());
  }

  // compact and ensure unique model names
  _modelNames = _.uniq(_.compact([..._modelNames]));

  // map modelNames to deleteMany
  const connected = isConnected(_connection);
  let deletes = _.map([..._modelNames], function (modelName) {
    // obtain model
    let Model = modelName;
    if (!isModel(modelName)) {
      Model = exports.model(modelName, _connection);
    }
    // prepare cleaner
    if (connected && Model && Model.deleteMany) {
      return function clear(next) {
        Model.deleteMany(function afterDeleteMany(error) {
          next(error);
        });
      };
    }
  });

  // compact deletes
  deletes = _.compact([...deletes]);

  // delete
  waterfall(deletes, _done);
};

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
exports.drop = (connection, done) => {
  // normalize arguments
  let _connection = mongoose.connection;
  if (isConnection(connection)) {
    _connection = connection;
  }
  const _done = !isConnection(connection) ? connection : done;

  // drop database if connection available
  let canDrop = isConnected(_connection);
  canDrop = canDrop && _connection.dropDatabase;
  if (canDrop) {
    _connection.dropDatabase(function afterDropDatabase(error) {
      // back-off on error
      if (error) {
        _done(error);
      }
      // disconnect
      else {
        exports.disconnect(_connection, _done);
      }
    });
  }
  // continue to disconnect
  else {
    exports.disconnect(_connection, _done);
  }
};

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
exports.model = (modelName, schema, connection) => {
  // normalize arguments

  // obtain modelName or obtain random name
  let _modelName = new mongoose.Types.ObjectId().toString();
  _modelName = _.isString(modelName) ? modelName : _modelName;

  // obtain schema
  const _schema = isSchema(modelName) ? modelName : schema;

  // ensure connection or use default connection
  let _connection = isConnection(modelName) ? modelName : schema;
  _connection = isConnection(_connection) ? _connection : connection;
  _connection = isConnection(_connection) ? _connection : mongoose.connection;

  // check if modelName already registered
  const modelExists = _.includes(_connection.modelNames(), _modelName);

  // try obtain model or new register model
  try {
    if (modelExists) {
      return _connection.model(_modelName);
    }
    return _connection.model(_modelName, _schema);
  } catch (error) {
    // catch error
    // unknown model
    return undefined;
  }
};

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
exports.syncIndexes = done => {
  // ensure connection before sync
  const canSync = isConnected(mongoose.connection);
  if (!canSync) {
    return done();
  }

  // obtain available models
  const Models = _.map(exports.modelNames(), modelName => {
    return exports.model(modelName);
  });

  // build indexes sync tasks
  let syncs = _.map(Models, Model => {
    if (Model && Model.syncIndexes) {
      const syncIndexOf = next => {
        Model.syncIndexes(error => next(error));
      };
      return syncIndexOf;
    }
  });

  // do syncing
  syncs = _.compact([...syncs]);
  return parallel(syncs, error => done(error));
};

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
exports.createSubSchema = (definition, optns) => {
  // ensure schema definition
  const schemaDefinition = mergeObjects(definition);

  // ensure schema options
  const schemaOptions = mergeObjects(exports.SUB_SCHEMA_OPTIONS, optns);

  // create sub schema
  const subSchema = new Schema(schemaDefinition, schemaOptions);

  // return created sub schema
  return subSchema;
};

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
exports.createSchema = (definition, optns, ...plugins) => {
  // ensure schema definition
  const schemaDefinition = mergeObjects(definition);

  // ensure schema options
  const schemaOptions = mergeObjects(exports.SCHEMA_OPTIONS, optns);

  // create schema
  const schema = new Schema(schemaDefinition, schemaOptions);

  // apply schema plugins with model options
  _.forEach([...plugins], plugin => {
    schema.plugin(plugin, schemaOptions);
  });

  // return created schema
  return schema;
};

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
exports.createModel = (schema, options, ...plugins) => {
  // ensure model schema definition
  const schemaDefinition = mergeObjects(schema);

  // ensure model options with timestamps
  const modelOptions = mergeObjects(options, exports.SCHEMA_OPTIONS);

  // create schema
  const modelSchema = exports.createSchema(
    schemaDefinition,
    modelOptions,
    ...plugins
  );

  // register model
  const { modelName } = modelOptions;
  const model = exports.model(modelName, modelSchema);

  // return created model
  return model;
};

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
exports.createVarySubSchema = (optns, ...paths) => {
  // ensure options
  const defaults = { required: false };
  const options = mergeObjects(defaults, optns);

  // normalize and collect fields
  const fields = _.map([...paths], field => {
    // handle: string field definition
    if (_.isString(field)) {
      return { name: field, required: false };
    }
    // handle: object field definition
    else if (_.isPlainObject(field)) {
      return mergeObjects({ required: false }, field);
    }
    // ignore: not valid field definition
    else {
      return undefined;
    }
  });

  // prepare schema definition
  const definition = {};
  _.forEach(uniq([...fields]), field => {
    definition[field.name] = mergeObjects(options, _.omit(field, 'name'));
  });

  // build field as sub-schema
  const schema = exports.createSubSchema(definition);

  // return vary sub-schema
  return schema;
};

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
exports.validationErrorFor = optns => {
  // obtain options
  const { status = 400, code = 400, paths = {} } = mergeObjects(optns);

  // create mongoose validation error
  const error = new mongoose.Error.ValidationError();
  error.status = status;
  error.code = code || status;

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