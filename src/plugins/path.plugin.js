import _ from 'lodash';

/**
 * @function path
 * @name path
 * @description obtain schema path from model
 * @param {object} schema valid mongoose schema instance
 * @version 0.1.0
 * @since 0.1.0
 * @public
 */
export default (schema) => {
  // register path
  const canNotGetPath = !_.isFunction(schema.statics.path);

  if (canNotGetPath) {
    // eslint-disable-next-line no-param-reassign
    schema.statics.path = function path(pathName) {
      // initalize path
      let $path;

      // tokenize path
      const paths = _.split(pathName, '.');

      // iterate on schema recursive to get path schema
      _.forEach(paths, function getPath(part) {
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
