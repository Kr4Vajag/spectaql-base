"use strict";var _get = _interopRequireDefault(require("lodash/get"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}






module.exports = function (value, ifTrue, ifFalse, options) {
  const undefOnly = !!(0, _get.default)(options, 'hash.undefOnly');

  if (value) {
    return ifTrue;
  }

  if (undefOnly) {
    return typeof value !== 'undefined' ? ifTrue : ifFalse;
  }

  return ifFalse;
};