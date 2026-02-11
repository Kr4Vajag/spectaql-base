"use strict";var _handlebars = _interopRequireDefault(require("handlebars"));
var _common = require("../../../lib/common");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}

module.exports = function (value, _options) {
  if (!value) {
    return '';
  }
  const html = (0, _common.printSchema)(value);
  return new _handlebars.default.SafeString(html);
};