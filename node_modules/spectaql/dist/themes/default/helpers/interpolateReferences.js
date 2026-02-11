"use strict";const PATH_TO_PREFIX_MAP = {
  Types: 'definition',
  Queries: 'query',
  Mutations: 'mutation',
  Subscriptions: 'subscription'
};

module.exports = function interpolateReferences(value, options) {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(/{{(.*?)}}/g, (match, value) => {
    const [path, name] = value.split('.');
    const prefix = PATH_TO_PREFIX_MAP[path];
    if (!prefix) {var _options$data;
      const msg = `Unsupported interpolation encountered: "${match}"`;
      if (
      (options === null || options === void 0 || (_options$data = options.data) === null || _options$data === void 0 || (_options$data = _options$data.root) === null || _options$data === void 0 || (_options$data = _options$data.allOptions) === null || _options$data === void 0 || (_options$data = _options$data.specData) === null || _options$data === void 0 || (_options$data = _options$data.spectaql) === null || _options$data === void 0 ? void 0 : _options$data.
      errorOnInterpolationReferenceNotFound) !== false)
      {
        throw new Error(
          msg +
          '. You can change this to be a warning via the "errorOnInterpolationReferenceNotFound" option'
        );
      } else {
        console.warn('WARNING: ' + msg);
        return match;
      }
    }

    return `#${prefix}-${name}`;
  });
};