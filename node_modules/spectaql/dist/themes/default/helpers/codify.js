"use strict";var _get = _interopRequireDefault(require("lodash/get"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}




module.exports = function (value, options) {
  if (typeof value === 'undefined') {
    return value;
  }

  const stringify = !!(0, _get.default)(options, 'hash.stringify');
  if (stringify) {
    value = JSON.stringify(value);
  }

  return '`' + value + '`';
};