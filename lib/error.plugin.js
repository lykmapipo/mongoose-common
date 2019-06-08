'use strict';

/* dependencies */
const _ = require('lodash');
const { uniq } = require('@lykmapipo/common');
const mongoose = require('mongoose-valid8');

/**
 * @function isUniqueError
 * @name isUniqueError
 * @description Check if the given error is a unique mongodb error.
 * @param {Object} error valid error object to test.
 * @return {Boolean} true if and only if it is an unique error.
 * @returns {Object}
 * @version 0.2.0
 * @since 0.1.0
 */
const isUniqueError = error => {
  return (
    error &&
    (error.name === 'BulkWriteError' || error.name === 'MongoError') &&
    (error.code === 11000 || error.code === 11001) &&
    !_.isEmpty(error.message)
  );
};

/**
 * @function parseErrorPaths
 * @name parseErrorPaths
 * @description Parse paths found in unique mongodb error.
 * @param {Schema} schema valid mongoose schema.
 * @param {Error} error valid mongodb error.
 * @return {String[]} found paths in error.
 * @version 0.19.0
 * @since 0.1.0
 */
const parseErrorPaths = (schema, error) => {
  // back off if no error message
  if (!error.message) {
    return [];
  }

  // obtain paths from error message
  let paths = _.nth(error.message.match(/index: (.+?) dup key:/), 1) || '';
  paths = paths.split('$').pop();

  // handle compound unique paths index
  paths = [].concat(paths.split('_'));

  // in case for id ensure _id too and compact paths
  paths = uniq([
    ...paths,
    ..._.map(paths, pathName => (pathName === 'id' ? '_id' : pathName)),
  ]);

  // ensure paths are within schema
  paths = _.filter(paths, pathName => !_.isEmpty(schema.path(pathName)));

  // return found paths
  return paths;
};

/**
 * @function parseErrorValues
 * @name parseErrorValues
 * @description Parse paths value found in unique mongodb error.
 * @param {String[]} paths paths found in unique mongodb error.
 * @param {Error} error valid mongodb error.
 * @return {String[]} found paths value from error.
 * @version 0.19.0
 * @since 0.1.0
 */
const parseErrorValues = (paths, error) => {
  // back off if no error message
  if (!error.message) {
    return [];
  }

  // obtain paths value
  let values = _.nth(error.message.match(/dup key: { (.+?) }/), 1) || '';
  values = uniq(
    [].concat(values.match(/'(.+?)'/g)).concat(values.match(/"(.+?)"/g))
  ); // enclosed with quotes
  values = values.map(v => v.replace(/^"(.+?)"$/, '$1')); //double quotes
  values = values.map(v => v.replace(/^'(.+?)'$/, '$1')); //single quotes
  values = paths.length === 1 ? [values.join(' ')] : values;

  // return parsed paths values
  return values;
};

/**
 * @function handleUniqueError
 * @name handleUniqueError
 * @description Handle mongodb unique error and transform to mongoose error
 * @param {Schema} schema valid mongoose schema
 * @version 0.2.0
 * @since 0.1.0
 */
const handleUniqueError = schema => {
  const normalizeUniqueError = (error, doc, next) => {
    // obtain current instance
    const instance = doc || this;

    // continue if is not unique error
    if (!isUniqueError(error)) {
      return next(error);
    }

    // obtain index name
    const indexName =
      _.nth(error.message.match(/index: (.+?) dup key:/), 1) || '';

    // obtain unique paths from error
    const paths = parseErrorPaths(schema, error);

    // obtain paths value from error
    const values = parseErrorValues(paths, error);

    // build mongoose validations error bag
    if (!_.isEmpty(paths) && !_.isEmpty(values)) {
      const errors = {};
      _.forEach(paths, (pathName, index) => {
        // construct path error properties
        let pathValue = _.nth(values, index);
        if (_.isFunction(instance.get)) {
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
      error = new mongoose.Error.ValidationError();
      error.status = error.status || 400;
      error.errors = errors;
    }

    // continue with error
    next(error);
  };

  schema.post('save', normalizeUniqueError);
  schema.post('insertMany', normalizeUniqueError);
  schema.post('findOneAndReplace', normalizeUniqueError);
  schema.post('findOneAndUpdate', normalizeUniqueError);
  schema.post('replaceOne', normalizeUniqueError);
  schema.post('update', normalizeUniqueError);
  schema.post('updateMany', normalizeUniqueError);
  schema.post('updateOne', normalizeUniqueError);
};

module.exports = exports = handleUniqueError;
