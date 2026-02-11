"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.analyzeTypeIntrospection = analyzeTypeIntrospection;exports.getArgFromIntrospectionResponseField = getArgFromIntrospectionResponseField;exports.getFieldFromIntrospectionResponseType = getFieldFromIntrospectionResponseType;exports.getTypeFromIntrospectionResponse = getTypeFromIntrospectionResponse;exports.introspectionTypeToString = introspectionTypeToString;exports.isReservedType = isReservedType;exports.removeTypeFromIntrospectionResponse = removeTypeFromIntrospectionResponse;exports.typesAreSame = typesAreSame;var _lodash = _interopRequireDefault(require("lodash"));
var _microfiber = require("microfiber");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}

function getTypeFromIntrospectionResponse({
  name,
  kind,
  kinds = [
  _microfiber.KINDS.OBJECT,
  _microfiber.KINDS.SCALAR,
  _microfiber.KINDS.ENUM,
  _microfiber.KINDS.INPUT_OBJECT,
  _microfiber.KINDS.INTERFACE],

  introspectionResponse
} = {}) {
  kinds = kind ? [kind] : kinds;
  return (
    name &&
    _lodash.default.get(introspectionResponse, '__schema.types', []).find(
      (type) => type.name === name && kinds.includes(type.kind)
    ));

}

function removeTypeFromIntrospectionResponse({
  name,
  kind,
  introspectionResponse
} = {}) {
  const types = _lodash.default.get(introspectionResponse, '__schema.types', []);
  const idx = types.findIndex((e) => e.name === name && e.type === kind);
  if (idx > -1) {
    types.splice(idx, 1);
  }
}

function getFieldFromIntrospectionResponseType({
  name,
  type: introspectionResponseTypeObject
} = {}) {
  return (
    name &&
    (
    introspectionResponseTypeObject.fields ||
    introspectionResponseTypeObject.inputFields ||
    introspectionResponseTypeObject.enumValues ||
    []).
    find((field) => field.name === name));

}

function getArgFromIntrospectionResponseField({
  name,
  field: introspectionResponseFieldObject
} = {}) {
  return (
    name &&
    (introspectionResponseFieldObject.args || []).find(
      (arg) => arg.name === name
    ));

}


function analyzeTypeIntrospection(type) {
  let isRequired = false;
  let itemsRequired = false;
  let isArray = false;


  while (true) {
    if (type.kind === _microfiber.KINDS.NON_NULL) {


      if (isArray) {
        itemsRequired = true;
      } else {


        isRequired = true;
      }
    } else if (type.kind === _microfiber.KINDS.LIST) {
      isArray = true;
    } else {
      break;
    }

    type = type.ofType;
  }

  return {
    underlyingType: type,
    isRequired,
    isArray,
    itemsRequired
  };
}

function introspectionTypeToString(type, { joiner = '' } = {}) {
  const { underlyingType, isRequired, isArray, itemsRequired } =
  analyzeTypeIntrospection(type);

  const pieces = [underlyingType.name];
  if (isArray) {
    if (itemsRequired) {
      pieces.push('!');
    }
    pieces.unshift('[');
    pieces.push(']');
  }
  if (isRequired) {
    pieces.push('!');
  }

  return pieces.join(joiner);
}

function isReservedType(type) {
  return type.name.startsWith('__');
}

function typesAreSame(typeA, typeB) {
  return typeA.kind === typeB.kind && typeA.name === typeB.name;
}