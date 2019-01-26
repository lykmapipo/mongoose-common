'use strict';


/**
 * @module mongoose-common
 * @description Re-usable helpers for mongoose
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since  0.1.0
 * @version 0.1.0
 * @public
 * @example
 * const {
 *   connect,
 *   clear, 
 *   drop, 
 *   disconnect,
 *   model,
 *   eachPath 
 * } = require('@lykmapipo/mongoose-common');
 *
 * connect((error) => { ... });
 * clear((error) => { ... });
 * drop((error) => { ... });
 * disconnect((error) => { ... });
 * const User = model('User');
 * const User = model('User', schema);
 * const randomModel = model(schema);
 * eachPath(schema, (path, schemaType) => { ... });
 */


/* dependencies */
const _ = require('lodash');
const { waterfall } = require('async');
const { getString } = require('@lykmapipo/env');
const { include } = require('@lykmapipo/include');
const mongoose = require('mongoose-valid8');
const { Schema, Connection } = mongoose;


/* local helpers */
function isConnection(conn) { return conn instanceof Connection; }

function isSchema(schema) { return schema instanceof Schema; }

function isConnected(conn) {
  return (isConnection(conn) && (conn.readyState === 1));
}



/* set global mongoose promise */
mongoose.Promise = global.Promise;


/**
 * @description register jsonschema schema plugin
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 * const jsonSchema = User.jsonSchema();
 */
require('mongoose-schema-jsonschema')(mongoose);


/**
 * @description register path schema plugin
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 * const name = User.path('name');
 */
mongoose.plugin(include(__dirname, 'lib', 'path.plugin'));


/**
 * @description unique error handler schema plugin
 * @since 0.1.0
 * @version 0.1.0
 * @public
 */
mongoose.plugin(include(__dirname, 'lib', 'error.plugin'));


/* expose shortcuts */
exports.Schema = Schema;
exports.SchemaTypes = Schema.Types;
exports.SchemaType = mongoose.SchemaType;
exports.VirtualType = mongoose.VirtualType;
exports.Types = exports.MongooseTypes = mongoose.Types;
exports.Error = exports.MongooseError = mongoose.Error;
exports.CastError = mongoose.CastError;
exports.STATES = mongoose.STATES;
exports.modelNames = mongoose.modelNames;
exports.GridFSBucket = mongoose.mongo.GridFSBucket;
exports.Connection = Connection;


/* schema types shortcuts*/
exports.String = exports.SchemaString = Schema.Types.String;
exports.Number = exports.SchemaNumber = Schema.Types.Number;
exports.Boolean = exports.SchemaBoolean = Schema.Types.Boolean;
exports.DocumentArray = exports.SchemaDocumentArray = Schema.Types.DocumentArray;
exports.Embedded = exports.SchemaEmbedded = Schema.Types.Embedded;
exports.Array = exports.SchemaArray = Schema.Types.Array;
exports.Buffer = exports.SchemaBuffer = Schema.Types.Buffer;
exports.Date = exports.SchemaDate = Schema.Types.Date;
exports.ObjectId = exports.SchemaObjectId = Schema.Types.ObjectId;
exports.Mixed = exports.SchemaMixed = Schema.Types.Mixed;
exports.Decimal = exports.SchemaDecimal = Schema.Types.Decimal;
exports.Map = exports.SchemaMap = Schema.Types.Map;


/**
 * @name SCHEMA_OPTIONS
 * @description Common options to set on schema
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 * const { SCHEMA_OPTIONS } = require('@lykmapipo/mongoose-common'); 
 */
exports.SCHEMA_OPTIONS = ({
  timestamps: true,
  emitIndexErrors: true
});


/**
 * @name SUB_SCHEMA_OPTIONS
 * @description Common options to set on sub doc schema
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 * const { SUB_SCHEMA_OPTIONS } = require('@lykmapipo/mongoose-common'); 
 */
exports.SUB_SCHEMA_OPTIONS = ({
  _id: false,
  id: false,
  timestamps: false,
  emitIndexErrors: true
});


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
 * const _isConnection = isConnection(conn);
 */
exports.isConnection = isConnection;


/**
 * @function isConnected
 * @name isConnected
 * @description Check if provided mongoose connection is connected
 * @param {Connection} val valid mongoose connection to check it state
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.6.1
 * @version 0.1.0
 * @public
 * @example
 * const _isConnected = isConnected(conn);
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
 * const _isSchema = isSchema(conn);
 */
exports.isSchema = isSchema;


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
 * const collectionName = toCollectionName('User'); // => users
 */
exports.toCollectionName = function toCollectionName(modelName) {
  const collectionName =
    (!_.isEmpty(modelName) ? mongoose.pluralize()(modelName) : modelName);
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
 * const _isObjectId = isObjectId(<val>);
 */
exports.isObjectId = function isObjectId(val) {
  const _isObjectId = (val instanceof mongoose.Types.ObjectId);
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
 * const _isMap = isMap(<val>);
 */
exports.isMap = function isMap(val) {
  const _isMap = (val instanceof mongoose.Types.Map);
  return _isMap;
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
 * const _isInstance = isInstance(<val>);
 */
exports.isInstance = function isInstance(value) {
  if (value) {
    const _isInstance = (
      _.isFunction(_.get(value, 'toObject', null)) &&
      !_.isNull(_.get(value, '$__', null))
    );
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
 * const instance = copyInstance(<val>);
 */
exports.copyInstance = function copyInstance(value) {
  if (value) {
    return (
      exports.isInstance(value) ?
      _.merge({}, value.toObject()) :
      _.merge({}, value)
    );
  }
  return {};
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
 * connect(done);
 * connect(<url>, done);
 */
exports.connect = function connect(url, done) {

  // ensure database name
  const NODE_ENV = getString('NODE_ENV', 'development');
  let DB_NAME = _.get(include('@cwd/package.json'), 'name', NODE_ENV);
  DB_NAME = _.toLower(_.last(_.split(DB_NAME, '/')));
  DB_NAME = ((DB_NAME === NODE_ENV) ? DB_NAME : `${DB_NAME} ${NODE_ENV}`);
  DB_NAME = _.kebabCase(DB_NAME);
  DB_NAME = `mongodb://localhost/${DB_NAME}`;
  const MONGODB_URI = getString('MONGODB_URI', DB_NAME);

  // normalize arguments
  const _url = _.isFunction(url) ? MONGODB_URI : url;
  const _done = _.isFunction(url) ? url : done;

  // connection options
  const _options = { useNewUrlParser: true };

  // establish mongoose connection
  mongoose.connect(_url, _options, _done);

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
 * disconnect(done);
 */
exports.disconnect = function disconnect(connection, done) {
  // normalize arguments
  const _connection =
    (isConnection(connection) ? connection : undefined);
  const _done = (!isConnection(connection) ? connection : done);

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
 * clear(done);
 * clear('User', done);
 * clear('User', 'Profile', done);
 */
exports.clear = function clear(...modelNames) {

  // collect provided model names
  let _modelNames = [].concat(...modelNames);

  // obtain callback
  let _connection = _.first(_.filter([..._modelNames], function (v) {
    return isConnection(v);
  }));
  _connection = (_connection || mongoose.connection);
  const _done = _.last(_.filter([..._modelNames], _.isFunction));

  // collect actual model names
  _modelNames = _.filter([..._modelNames], _.isString);

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
    const Model = exports.model(modelName, _connection);
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
 * drop(done);
 */
exports.drop = function drop(connection, done) {
  // normalize arguments
  const _connection =
    (isConnection(connection) ? connection : mongoose.connection);
  const _done = (!isConnection(connection) ? connection : done);

  // drop database if connection available
  let canDrop = isConnected(_connection);
  canDrop = (canDrop && _connection.dropDatabase);
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
 * const User = model('User');
 * const User = model('User', Schema);
 */
exports.model = function model(modelName, schema, connection) {
  // normalize arguments

  // obtain modelName or obtain random name
  let _modelName = new mongoose.Types.ObjectId().toString();
  _modelName = (_.isString(modelName) ? modelName : _modelName);

  // obtain schema
  const _schema = (isSchema(modelName) ? modelName : schema);

  // ensure connection or use default connection
  let _connection = (isConnection(modelName) ? modelName : schema);
  _connection = (isConnection(_connection) ? _connection : connection);
  _connection = (isConnection(_connection) ? _connection : mongoose.connection);

  // check if modelName already registered
  const modelExists = _.includes(_connection.modelNames(), _modelName);

  // try obtain model or new register model
  try {
    const Model = (
      modelExists ?
      _connection.model(_modelName) :
      _connection.model(_modelName, _schema)
    );
    return Model;
  }

  // catch error
  catch (error) {
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
 * @param {Function} iteratee callback function invoked per each path found. The 
 * callback is passed the pathName, parentPath and schemaType as arguments on 
 * each iteration.
 * @see {@link https://mongoosejs.com/docs/api.html#schema_Schema-eachPath}
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 * eachPath(schema, (path, schemaType) => { ... });
 */
exports.eachPath = function eachPath(schema, iteratee) {


  function iterateRecursive(pathName, schemaType, parentPath) {

    // compute path name
    const _path = _.compact([parentPath, pathName]).join('.');

    // check if is sub schema
    const isSchema =
      (schemaType.schema && _.isFunction(schemaType.schema.eachPath));

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
 * const jsonSchema = jsonSchema(); 
 *   // => {"user": {title: "User", type: "object", properties: {..} } }
 */
exports.jsonSchema = function jsonSchema() {
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