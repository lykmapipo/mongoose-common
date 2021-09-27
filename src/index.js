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

import {
  forEach,
  get,
  head,
  isEmpty,
  isFunction,
  isNull,
  map,
  tail,
  toPlainObject,
} from 'lodash';
import { createHmac } from 'crypto';
import { compact, idOf, join, mergeObjects } from '@lykmapipo/common';
import mongoose from 'mongoose-valid8';
import { toObject } from 'mongoose/lib/utils';
import {
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
} from '@lykmapipo/mongoose-connection';
import errorPlugin from './plugins/error.plugin';
import pathPlugin from './plugins/path.plugin';
import seedPlugin from './plugins/seed.plugin';

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
mongoose.plugin(errorPlugin); // TODO: ignore global

/**
 * @name seed
 * @description data seed schema plugin
 * @since 0.21.0
 * @version 0.1.0
 * @public
 */
mongoose.plugin(seedPlugin); // TODO: ignore global

// expose shortcuts
export const { STATES } = mongoose;
export const { Aggregate } = mongoose;
export const { Collection } = mongoose;
export const { Connection } = mongoose;
export const { Schema } = mongoose;
export const { SchemaType } = mongoose;
export const { SchemaTypes } = mongoose;
export const { VirtualType } = mongoose;
export const { Types } = mongoose;
export const MongooseTypes = mongoose.Types;
export const { Query } = mongoose;
export const MongooseError = mongoose.Error;
export const { CastError } = mongoose;
export const modelNames = () => mongoose.modelNames();
export const { GridFSBucket } = mongoose.mongo;

// schema types shortcuts

export const SchemaString = Schema.Types.String;
export const SchemaNumber = Schema.Types.Number;
export const SchemaBoolean = Schema.Types.Boolean;
export const { DocumentArray } = Schema.Types;
export const SchemaDocumentArray = Schema.Types.DocumentArray;
export const SubDocument = Schema.Types.Subdocument;
export const SchemaSubDocument = Schema.Types.Subdocument;
export const Embedded = SubDocument;
export const SchemaEmbedded = SubDocument;
export const SchemaArray = Schema.Types.Array;
export const SchemaBuffer = Schema.Types.Buffer;
export const SchemaDate = Schema.Types.Date;
export const { ObjectId } = Schema.Types;
export const SchemaObjectId = Schema.Types.ObjectId;
export const { Mixed } = Schema.Types;
export const SchemaMixed = Schema.Types.Mixed;
export const { Decimal128 } = Schema.Types;
export const SchemaDecimal = Decimal128;
export const SchemaDecimal128 = Decimal128;
export const SchemaMap = Schema.Types.Map;

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
export const LOOKUP_FIELDS = ['from', 'localField', 'foreignField', 'as'];

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
 */
export { SCHEMA_OPTIONS };

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
export { SUB_SCHEMA_OPTIONS };

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
 */
export { isConnection };

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
 */
export { isConnected };

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
 */
export { isSchema };

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
 */
export { isModel };

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
 */
export { isQuery };

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
 */
export { isAggregate };

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
 */
export { enableDebug };

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
 */
export { disableDebug };

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
export const toCollectionName = (modelName) => {
  let collectionName = modelName;
  if (!isEmpty(modelName)) {
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
export const isObjectId = (val) => {
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
export const isMap = (val) => {
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
export const isString = (val) => {
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
export const isArraySchemaType = (val = {}) => {
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
export const isStringArray = (val) => {
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
export const isNumber = (val) => {
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
export const isNumberArray = (val) => {
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
export const isInstance = (value) => {
  if (value) {
    const $isInstance =
      isFunction(get(value, 'toObject', null)) &&
      !isNull(get(value, '$__', null));
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
export const copyInstance = (value = {}) => mergeObjects(toObject(value));

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
export const schemaTypeOptionOf = (schemaType = {}) => {
  // grab options
  const options = mergeObjects(
    // grub schema caster options
    toPlainObject(get(schemaType, 'caster.options')),
    // grab direct schema options
    toPlainObject(get(schemaType, 'options'))
  );
  // return options
  return options;
};

/**
 * @function collectionNameOf
 * @name collectionNameOf
 * @description obtain collection name of provided model name
 * @param {string} modelName valid model name
 * @returns {string} underlying collection of the model
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.16.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const collectionName = collectionNameOf('User');
 * //=> 'users'
 */
export { collectionNameOf };

// TODO return default connection
// TODO return created connection
// TODO create new connection

/**
 * @function connect
 * @name connect
 * @description Opens the default mongoose connection
 * @param {string} [url] valid mongodb conenction string. if not provided it
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
 */
export { connect };

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
 */
export { disconnect };

/**
 * @function clear
 * @name clear
 * @description Clear provided collection or all if none give
 * @param {Connection} [connection] valid mongoose database connection. If not
 * provide default connection will be used.
 * @param {string[] | string | ...string} modelNames name of models to clear
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
 */
export { clear };

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
 */
export { drop };

/**
 * @function model
 * @name model
 * @description Try obtain already registered or register new model safely.
 * @param {string} [modelName] valid model name
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
 */
export { model };

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
export const eachPath = (schema, iteratee) => {
  /**
   * @name iterateRecursive
   * @description recursivily search for a schema path
   * @param {string} pathName valid schema path name
   * @param {object} schemaType valid schema type
   * @param {string} parentPath parent schema path
   */
  function iterateRecursive(pathName, schemaType, parentPath) {
    // compute path name
    const $path = compact([parentPath, pathName]).join('.');

    // check if is sub schema
    const $isSchema =
      schemaType.schema && isFunction(schemaType.schema.eachPath);

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
export const jsonSchema = () => {
  // initialize schemas dictionary
  const schemas = {};
  // get model names
  const $modelNames = mongoose.modelNames();
  // loop model names to get schemas
  forEach($modelNames, function getJsonSchema(modelName) {
    // get model
    const Model = model(modelName);
    // collect model json schema
    if (Model && isFunction(Model.jsonSchema)) {
      schemas[modelName] = Model.jsonSchema();
    }
  });
  // return available schemas
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
 */
export { syncIndexes };

/**
 * @function createSubSchema
 * @name createSubSchema
 * @description Create mongoose sub schema with no id and timestamp
 * @param {object} definition valid model schema definition
 * @param {object} [optns] valid schema options
 * @returns {object} valid mongoose sub schema
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.21.0
 * @version 0.3.0
 * @public
 * @example
 *
 * const User = createSubSchema({ name: { type: String } });
 */
export { createSubSchema };

/**
 * @function createSchema
 * @name createSchema
 * @description Create mongoose schema with timestamps
 * @param {object} definition valid model schema definition
 * @param {object} [optns] valid schema options
 * @param {...Function} [plugins] list of valid mongoose plugin to apply
 * @returns {object} valid mongoose schema
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.23.0
 * @version 0.1.0
 * @public
 * @example
 *
 * const User = createSchema({ name: { type: String } });
 */
export { createSchema };

/**
 * @function createModel
 * @name createModel
 * @description Create and register mongoose model
 * @param {object} schema valid model schema definition
 * @param {object} options valid model schema options
 * @param {string} options.modelName valid model name
 * @param {...Function} [plugins] list of valid mongoose plugin to apply
 * @param {Connection} [connection] valid mongoose database connection. If not
 * provide default connection will be used.
 * @returns {object} valid mongoose model
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
 */
export { createModel };

/**
 * @function createVarySubSchema
 * @name createVarySubSchema
 * @description Create sub schema with variable paths
 * @param {object} optns valid schema type options
 * @param {...object | ...string} paths variable paths to include on schema
 * @returns {object} valid mongoose schema
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
 */
export { createVarySubSchema };

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
export const validationErrorFor = (optns) => {
  // obtain options
  const { status = 400, code = 400, paths = {} } = mergeObjects(optns);

  // create mongoose validation error
  const error = new mongoose.Error.ValidationError();
  error.status = status;
  error.code = code || status;
  // eslint-disable-next-line no-underscore-dangle
  error.message = error.message || error._message;

  // attach path validator error
  if (!isEmpty(paths)) {
    const errors = {};
    forEach(paths, (props, path) => {
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
export const areSameInstance = (a, b) => {
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
export const areSameObjectId = (a, b) => {
  try {
    // grab actual ids
    const idOfA = idOf(a) || a;
    const idOfB = idOf(b) || b;

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
export const toObjectIds = (...instances) => {
  const ids = map([...instances], (instance) => {
    const id = idOf(instance) || instance;
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
export const toObjectIdStrings = (...instances) => {
  const ids = toObjectIds(...instances);
  const idStrings = map([...ids], (id) => {
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
export const objectIdFor = (modelName, ...parts) => {
  // ensure parts
  const values = compact([].concat(modelName).concat(...parts));

  // ensure secret & message
  const secret = head(values);
  const data = join(tail(values), ':');

  // generate 24-byte hex hash
  const hash = createHmac('md5', secret)
    .update(data)
    .digest('hex')
    .slice(0, 24);

  // create objectid from hash
  const objectId = mongoose.Types.ObjectId.createFromHexString(hash);

  return objectId;
};
