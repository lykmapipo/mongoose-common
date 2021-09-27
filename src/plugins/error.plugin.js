import { filter, forEach, isEmpty, isFunction, map, nth } from 'lodash';
import { uniq } from '@lykmapipo/common';
import mongoose from 'mongoose-valid8';

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
    !isEmpty(error.message)
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
  let paths = nth(error.message.match(/index: (.+?) dup key:/), 1) || '';
  paths = paths.split('$').pop();

  // handle compound unique paths index
  paths = [].concat(paths.split('_'));

  // in case for id ensure _id too and compact paths
  paths = uniq([
    ...paths,
    ...map(paths, (pathName) => (pathName === 'id' ? '_id' : pathName)),
  ]);

  // ensure paths are within schema
  paths = filter(paths, (pathName) => !isEmpty(schema.path(pathName)));

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
  let values = nth(error.message.match(/dup key: { (.+?) }/), 1) || '';
  values = uniq(
    [].concat(values.match(/'(.+?)'/g)).concat(values.match(/"(.+?)"/g))
  ); // enclosed with quotes
  values = map(values, (v) => v.replace(/^"(.+?)"$/, '$1')); // double quotes
  values = map(values, (v) => v.replace(/^'(.+?)'$/, '$1')); // single quotes
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
export default function uniqueErrorPlugin(schema) {
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
      nth(error.message.match(/index: (.+?) dup key:/), 1) || '';

    // obtain unique paths from error
    const paths = parseErrorPaths(schema, error);

    // obtain paths value from error
    const values = parseErrorValues(paths, error);

    // build mongoose validations error bag
    if (!isEmpty(paths) && !isEmpty(values)) {
      const errors = {};

      forEach(paths, (pathName, index) => {
        // construct path error properties
        let pathValue = nth(values, index);
        if (isFunction(instance.get)) {
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
