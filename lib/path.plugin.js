'use strict';

/* dependencies */
const _ = require('lodash');

/**
 * @function path
 * @name path
 * @description obtain schema path from model
 * @param {Schema} schema valid mongoose schema instance
 * @param {String} value valid mongoose model schema path name
 * @returns {SchemaType}
 * @version 0.1.0
 * @since 0.1.0
 */
const path = schema => {
  // register path
  const canNotGetPath = !_.isFunction(schema.statics.path);
  if (canNotGetPath) {
    schema.statics.path = function path(pathName) {
      // initalize path
      let _path;

      // tokenize path
      const paths = _.split(pathName, '.');

      // iterate on schema recursive to get path schema
      _.forEach(paths, function getPath(path) {
        // obtain schema to resolve path
        const _schema = _path ? _path.schema : schema;
        _path = _schema && _schema.path ? _schema.path(path) : undefined;
      });

      // fall back to direct path
      _path = _path || schema.path(pathName);

      // return found path
      return _path;
    };
  }
};

module.exports = exports = path;
