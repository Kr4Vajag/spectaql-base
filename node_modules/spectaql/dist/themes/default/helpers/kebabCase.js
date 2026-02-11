"use strict";var _kebabCase = _interopRequireDefault(require("lodash/kebabCase"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}







module.exports = function (value, options) {var _options$hash;
  const defaultValue = (options === null || options === void 0 || (_options$hash = options.hash) === null || _options$hash === void 0 ? void 0 : _options$hash.defaultValue) || '';
  return value != null ? (0, _kebabCase.default)(value) : defaultValue;
};