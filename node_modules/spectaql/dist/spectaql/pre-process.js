"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = preProcess;var _htmlId = _interopRequireDefault(require("../themes/default/helpers/htmlId"));
var _generateGraphqlExampleData = _interopRequireDefault(require("./generate-graphql-example-data"));
var _common = require("../lib/common");
var _typeHelpers = require("./type-helpers");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}

function preProcess({
  items,
  introspectionResponse,
  graphQLSchema,
  extensions = {},
  queryNameStrategy,
  allOptions
}) {
  handleItems(items, {
    introspectionResponse,
    graphQLSchema,
    extensions,
    queryNameStrategy,
    allOptions
  });
}

function handleItems(
items,
{
  depth = 0,
  names = [],
  introspectionResponse,
  graphQLSchema,
  extensions,
  queryNameStrategy,
  allOptions
} = {})
{
  if (!Array.isArray(items)) {
    return;
  }

  for (const item of items) {
    handleItem(item, {
      depth,
      names,
      introspectionResponse,
      graphQLSchema,
      extensions,
      queryNameStrategy,
      allOptions
    });
  }
}

function handleItem(
item,
{
  depth,
  names,
  introspectionResponse,
  graphQLSchema,
  extensions,
  queryNameStrategy,
  allOptions
})
{
  if (!item) {
    return;
  }

  names = names.filter(Boolean);
  if (!item.hideInContent && names.length) {
    item.parentName = names[names.length - 1];
    item.parentHtmlId = (0, _htmlId.default)(names.join('-'));
  }

  item.depth = depth;

  if (Array.isArray(item.items)) {

    names.push(item.name);
    item.htmlId = (0, _htmlId.default)(names.join('-'));

    return handleItems(item.items, {
      depth: depth + 1,
      names,
      introspectionResponse,
      graphQLSchema,
      extensions,
      queryNameStrategy,
      allOptions
    });
  }



  let anchorPrefix;
  if (item.isQuery) {
    anchorPrefix = 'query';
    addQueryToItem({
      item,
      introspectionResponse,
      graphQLSchema,
      extensions,
      queryNameStrategy,
      allOptions
    });
  } else if (item.isMutation) {
    anchorPrefix = 'mutation';
    addMutationToItem({
      item,
      introspectionResponse,
      graphQLSchema,
      extensions,
      queryNameStrategy,
      allOptions
    });
  } else if (item.isSubscription) {
    anchorPrefix = 'subscription';
    addSubscriptionToItem({
      item,
      introspectionResponse,
      graphQLSchema,
      extensions,
      queryNameStrategy,
      allOptions
    });
  } else {

    anchorPrefix = 'definition';
    addThingsToDefinitionItem({
      item,
      introspectionResponse,
      graphQLSchema,
      extensions,
      allOptions
    });
  }

  item.htmlId = (0, _htmlId.default)([anchorPrefix, item.name].join('-'));
}

function addQueryToItem({
  item,
  introspectionResponse,
  graphQLSchema,
  extensions,
  queryNameStrategy,
  allOptions
}) {
  return _addQueryToItem({
    item,
    flavor: 'query',
    introspectionResponse,
    graphQLSchema,
    extensions,
    queryNameStrategy,
    allOptions
  });
}

function addMutationToItem({
  item,
  introspectionResponse,
  graphQLSchema,
  extensions,
  queryNameStrategy,
  allOptions
}) {
  return _addQueryToItem({
    item,
    flavor: 'mutation',
    introspectionResponse,
    graphQLSchema,
    extensions,
    queryNameStrategy,
    allOptions
  });
}

function addSubscriptionToItem({
  item,
  introspectionResponse,
  graphQLSchema,
  extensions,
  queryNameStrategy,
  allOptions
}) {
  return _addQueryToItem({
    item,
    flavor: 'subscription',
    introspectionResponse,
    graphQLSchema,
    extensions,
    queryNameStrategy,
    allOptions
  });
}

function _addQueryToItem({
  item,
  flavor,
  introspectionResponse,
  graphQLSchema,
  extensions,
  queryNameStrategy,
  allOptions
}) {
  const stuff = (0, _generateGraphqlExampleData.default)({
    prefix: flavor,
    field: item,
    introspectionResponse,
    graphQLSchema,
    extensions,
    queryNameStrategy,
    allOptions
  });
  const { query, variables, response } = stuff;

  item[flavor] = query;
  item.variables = variables;

  const { underlyingType, isRequired, isArray, itemsRequired } =
  (0, _typeHelpers.analyzeTypeIntrospection)(item.type);

  item.response = {
    underlyingType,
    isRequired,
    isArray,
    itemsRequired,
    data: response
  };
}

function addThingsToDefinitionItem({
  item,
  introspectionResponse,
  graphQLSchema,
  extensions

}) {

  if (typeof item.example === 'undefined') {
    item.example = (0, _common.generateIntrospectionTypeExample)({
      type: item,
      introspectionResponse,
      graphQLSchema,
      extensions
    });
  }
}