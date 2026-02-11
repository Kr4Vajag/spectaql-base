"use strict";var _handlebars = _interopRequireDefault(require("handlebars"));
var _common = require("../../../lib/common");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}

module.exports = function (json, _options) {
  if (!json) {
    return '';
  }
  const html = (0, _common.printSchema)(json);
  return new _handlebars.default.SafeString(html);
};