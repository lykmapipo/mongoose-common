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
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/* expose shortcuts */
exports.Schema = Schema;
_.merge(exports, Schema.Types);


/**
 * @name SCHEMA_OPTIONS
 * @description Common options to set on schema
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
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
 */
exports.SUB_SCHEMA_OPTIONS = ({
  _id: false,
  id: false,
  timestamps: false,
  emitIndexErrors: true
});


/**
 * @function connect
 * @name connect
 * @description Opens the default mongoose connection
 * @param {String} [url] valid mongodb conenction string. if not provided it 
 * will be obtained from process.env.MONGODB_URI
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 * connect(done);
 * connect(<url>, done);
 */
exports.connect = function connect(url, done) {

  // ensure test database
  const MONGODB_URI = process.env.MONGODB_URI;

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
exports.disconnect = function disconnect(done) {
  mongoose.disconnect(done);
};


/**
 * @function clear
 * @name clear
 * @description Clear provided collection or all if none give
 * @param {String[]|String} modelNames name of models to clear
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
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
  const _done = _.last(_.filter([..._modelNames], _.isFunction));

  // collect actual model names
  _modelNames = _.filter([..._modelNames], _.isString);

  // collect from mongoose.modelNames();
  if (_.isEmpty(_modelNames)) {
    _modelNames = [...modelNames].concat(mongoose.modelNames());
  }

  // compact and ensure unique model names
  _modelNames = _.uniq(_.compact([..._modelNames]));

  // map modelNames to deleteMany
  const connected =
    (mongoose.connection && mongoose.connection.readyState === 1);
  let deletes = _.map([..._modelNames], function (modelName) {
    // obtain model
    const Model = exports.model(modelName);
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
 * @param {Function} done a callback to invoke on success or failure
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 * drop(done);
 */
exports.drop = function drop(done) {

  // drop database if connection available
  const canDrop =
    (mongoose.connection && mongoose.connection.readyState === 1);
  if (canDrop && mongoose.connection.dropDatabase) {
    mongoose.connection.dropDatabase(function afterDropDatabase(error) {
      // back-off on error
      if (error) {
        done(error);
      }
      // disconnect 
      else {
        exports.disconnect(done);
      }
    });
  }
  // continue
  else {
    // disconnect
    exports.disconnect(done);
  }

};


/**
 * @function model
 * @name model
 * @description Try obtain already registered or register new model safely.
 * @author lally elias <lallyelias87@mail.com>
 * @since 0.1.0
 * @version 0.1.0
 * @public
 * @example
 * const User = model('User');
 * const User = model('User', Schema);
 */
exports.model = function model(modelName, schema) {

  // obtain modelName or obtain random name
  let _modelName = new mongoose.Types.ObjectId().toString();
  _modelName = (_.isString(modelName) ? modelName : _modelName);

  // obtain schema
  const _schema = ((modelName instanceof Schema) ? modelName : schema);

  // check if modelName already registered
  const modelExists = _.includes(mongoose.modelNames(), _modelName);

  // try obtain model or new register model
  try {
    const Model = (
      modelExists ?
      mongoose.model(_modelName) :
      mongoose.model(_modelName, _schema)
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