"use strict";var _get = _interopRequireDefault(require("lodash/get"));
var _codify = _interopRequireDefault(require("./codify"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}


module.exports = function (text, url, options) {
  if ((0, _get.default)(options, 'hash.codify') === true) {
    text = (0, _codify.default)(text);
  }

  return `[${text}](${url})`;
};