"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;exports.generateQuery = generateQuery;var _typeHelpers = require("./type-helpers");
var _microfiber = require("microfiber");
var _common = require("../lib/common");



var _utils = require("./utils");








const QUERY_NAME_STRATEGY_NONE = 'none';
const QUERY_NAME_STRATEGY_CAPITALIZE_FIRST = 'capitalizeFirst';
const QUERY_NAME_STRATEGY_CAPITALIZE = 'capitalize';
const QUERY_NAME_STRATEGY_CAMELCASE = 'camelCase';
const QUERY_NAME_STRATEGY_SNAKECASE = 'snakeCase';
const QUERY_NAME_STRATEGY_UPPERCASE = 'upperCase';
const QUERY_NAME_STRATEGY_LOWERCASE = 'lowerCase';


function friendlyArgsString({ args, depth }) {
  if (!args.length) {
    return '';
  }
  const outerSpace = '  '.repeat(depth);
  let argsStr;
  if (args.length === 1) {
    argsStr = args[0];
    return `(${argsStr})`;
  } else {
    argsStr = '\n';
    const innerSpace = '  '.repeat(depth + 1);
    argsStr += args.map((piece) => innerSpace + piece).join(',\n');
    argsStr += '\n';
    return `(${argsStr}${outerSpace})`;
  }
}

function generateQuery({
  prefix,
  field,
  introspectionResponse,
  graphQLSchema,
  extensions,
  queryNameStrategy,
  allOptions
}) {var _allOptions$specData;
  let fieldExpansionDepth =
  allOptions === null || allOptions === void 0 || (_allOptions$specData = allOptions.specData) === null || _allOptions$specData === void 0 || (_allOptions$specData = _allOptions$specData.introspection) === null || _allOptions$specData === void 0 ? void 0 : _allOptions$specData.fieldExpansionDepth;
  if (typeof fieldExpansionDepth === 'undefined') {
    fieldExpansionDepth = 1;
  }
  const introspectionManipulator = new _microfiber.Microfiber(
    introspectionResponse
  );

  const queryResult = generateQueryInternal({
    field,
    introspectionManipulator,
    introspectionResponse,
    graphQLSchema,
    fieldExpansionDepth,
    depth: 1
  });

  const args = queryResult.args.
  filter((item, pos) => queryResult.args.indexOf(item) === pos).
  map((arg) => `$${arg.name}: ${(0, _typeHelpers.introspectionTypeToString)(arg.type)}`);

  const argStr = friendlyArgsString({ args, depth: 0 });

  const cleanedQuery = queryResult.query.replace(/ : [\w![\]]+/g, '');

  let queryName = field.name;
  if (!queryNameStrategy || queryNameStrategy === QUERY_NAME_STRATEGY_NONE) {

  } else if (queryNameStrategy === QUERY_NAME_STRATEGY_CAPITALIZE_FIRST) {
    queryName = (0, _utils.capitalizeFirstLetter)(queryName);
  } else if (queryNameStrategy === QUERY_NAME_STRATEGY_CAPITALIZE) {
    queryName = (0, _utils.capitalize)(queryName);
  } else if (queryNameStrategy === QUERY_NAME_STRATEGY_CAMELCASE) {
    queryName = (0, _utils.camelCase)(queryName);
  } else if (queryNameStrategy === QUERY_NAME_STRATEGY_SNAKECASE) {
    queryName = (0, _utils.snakeCase)(queryName);
  } else if (queryNameStrategy === QUERY_NAME_STRATEGY_UPPERCASE) {
    queryName = (0, _utils.upperCase)(queryName);
  } else if (queryNameStrategy === QUERY_NAME_STRATEGY_LOWERCASE) {
    queryName = (0, _utils.lowerCase)(queryName);
  }

  const query = `${prefix} ${queryName}${
  argStr ? `${argStr}` : ''} {\n${
  cleanedQuery}}`;

  const variables = (0, _common.introspectionArgsToVariables)({
    args: queryResult.args,
    introspectionResponse,
    introspectionManipulator,
    extensions
  });

  const response = {
    data: {
      [field.name]: (0, _common.introspectionQueryOrMutationToResponse)({
        field,
        introspectionResponse,
        introspectionManipulator,
        extensions
      })
    }
  };

  return {
    query,
    variables,
    response
  };
}

function generateQueryInternal({
  field,
  args = [],
  fieldExpansionDepth,
  depth,

  introspectionManipulator
} = {}) {var _returnType$fields;
  const { name } = field;

  const space = '  '.repeat(depth);
  let queryStr = space + name;


  const fieldArgs = [...args];


  const argsStrPieces = [];
  for (const arg of field.args || []) {
    fieldArgs.push(arg);
    argsStrPieces.push(`${arg.name}: $${arg.name}`);
  }


  if (argsStrPieces.length > 0 && depth === 1) {
    queryStr += friendlyArgsString({ args: argsStrPieces, depth });
  }

  const returnType = introspectionManipulator.getType(
    _microfiber.Microfiber.digUnderlyingType(field.type)
  );


  if (returnType.kind === _microfiber.KINDS.UNION) {
    try {
      const subQuery = returnType.possibleTypes.
      map((possibleType) => {
        const returnType = introspectionManipulator.getType(possibleType);
        const subQuery = generateQueryInternal({
          field: {
            name: returnType.name,
            type: possibleType
          },
          fieldExpansionDepth,
          depth: depth + 1,
          introspectionManipulator
        }).query;
        return `${space}  ... on ${subQuery.trim()}`;
      }).
      join('\n');

      queryStr += ` {\n${subQuery}\n${space}}`;
    } catch (err) {
      console.warn('Problem generating inline fragments for UNION type.');
      console.warn(
        'Please file an issue with SpectaQL at https://github.com/anvilco/spectaql/issues'
      );
      console.warn('The error:');
      console.warn(err);
    }
  } else


  if (returnType !== null && returnType !== void 0 && (_returnType$fields = returnType.fields) !== null && _returnType$fields !== void 0 && _returnType$fields.length) {
    if (depth > fieldExpansionDepth) {
      return {
        query: `${queryStr} {\n${space}  ...${returnType.name}Fragment\n${space}}\n`,
        args: fieldArgs
      };
    }

    const subQuery = returnType.fields.
    map((childField) => {
      return generateQueryInternal({
        field: childField,
        args: fieldArgs,
        fieldExpansionDepth,
        depth: depth + 1,
        introspectionManipulator
      }).query;
    }).
    join('');

    queryStr += ` {\n${subQuery}${space}}`;
  }

  return {
    query: queryStr + '\n',
    args: fieldArgs
  };
}var _default = exports.default =

generateQuery;