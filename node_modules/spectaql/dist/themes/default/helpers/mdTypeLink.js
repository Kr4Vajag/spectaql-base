"use strict";var _typeHelpers = require("../../../spectaql/type-helpers");



var _mdLink = _interopRequireDefault(require("./mdLink"));
var _schemaReferenceHref = _interopRequireDefault(require("./schemaReferenceHref"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}


module.exports = function mdTypeLink(thing, options) {
  thing = normalizeThing(thing);
  const {
    underlyingType



  } = thing.response || (0, _typeHelpers.analyzeTypeIntrospection)(thing.type);

  if (!underlyingType) {
    console.warn(
      JSON.stringify({
        msg: 'no underlyingType found',
        name: thing.name
      })
    );

    return thing.name;
  }

  const url = (0, _schemaReferenceHref.default)(underlyingType.name);
  const text = (0, _typeHelpers.introspectionTypeToString)(thing.type);
  return (0, _mdLink.default)(text, url, options);
};



function normalizeThing(thing) {
  if (thing.type) {
    return thing;
  }
  return {
    ...thing,
    type: thing
  };
}