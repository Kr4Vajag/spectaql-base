"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.getExampleForGraphQLScalar = getExampleForGraphQLScalar;
var _graphqlScalars = require("graphql-scalars");

const ADAPTERS_BY_SCALAR_NAME = {
  URL: (val) => val.toString(),
  Byte: (val) => JSON.parse(`[${val.toString()}]`)
};


const GRAPHQL_SCALAR_TO_EXAMPLE = Object.freeze(
  Object.entries(_graphqlScalars.mocks).reduce((acc, [k, v]) => {
    acc[k] = v();
    return acc;
  }, {})
);

function getExampleForGraphQLScalar(scalarName) {
  const value = GRAPHQL_SCALAR_TO_EXAMPLE[scalarName];
  if (ADAPTERS_BY_SCALAR_NAME[scalarName]) {
    return ADAPTERS_BY_SCALAR_NAME[scalarName](value);
  }

  return value;
}