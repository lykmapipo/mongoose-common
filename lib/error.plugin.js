'use strict';


/* dependencies */
const _ = require('lodash');
const mongoose = require('mongoose-valid8');


/**
 * @function isUniqueError
 * @name isUniqueError
 * @description Check if the given error is a unique mongdb error.
 * @param {Object} error valid error object to test.
 * @return {Boolean} true if and only if it is an unique error.
 * @returns {Object}
 * @version 0.1.0
 * @since 0.1.0
 */
function isUniqueError(error) {
  return (
    error &&
    (error.name === 'BulkWriteError' || error.name === 'MongoError') &&
    (error.code === 11000 || error.code === 11001) &&
    !_.isEmpty(error.message)
  );
}


/**
 * @function handleUniqueError
 * @name handleUniqueError
 * @description Handle mongodb unique error and transform to mongoose error
 * @param {Schema} schema valid mongoose schema
 * @version 0.2.0
 * @since 0.1.0
 */
function handleUniqueError(schema) {

  const normalizeUniqueError = function (error, doc, next) {

    // reference values
    const values = (doc || this);

    // continue if is not unique error
    if (!isUniqueError(error)) {
      return next(error);
    }

    // obtain unique index path
    let path = _.nth(error.message.match(/index: (.+) dup key:/), 1) || '';
    path = path.split('$').pop();

    // handle compaund unique index
    path = path.split('_');
    path = _.filter(path, function (pathName) {
      return !_.isEmpty(schema.path(pathName));
    });

    // obtain unique index value
    let value = _.nth(error.message.match(/dup key: { (.+) }/), 1) || '';
    value = value ? value.match(/\w+/g) : value;
    value = path.length === 1 ? [value.join(' ')] : value;

    // build mongoose error
    if (!_.isEmpty(path)) {
      const errors = {};
      _.forEach(path, function (pathName, index) {
        const pathValue = (_.get(values, pathName) || _.nth(value, index));
        const props = {
          type: 'unique',
          path: pathName,
          value: pathValue,
          message: 'Path `{PATH}` ({VALUE}) is not unique.',
          reason: error.message
        };
        errors[pathName] = new mongoose.Error.ValidatorError(props);
      });

      error = new mongoose.Error.ValidationError();
      error.status = (error.status || 400);
      error.errors = errors;
    }

    next(error);

  };

  schema.post('save', normalizeUniqueError);
  schema.post('update', normalizeUniqueError);
  schema.post('findOneAndUpdate', normalizeUniqueError);
  schema.post('insertMany', normalizeUniqueError);

}

module.exports = exports = handleUniqueError;