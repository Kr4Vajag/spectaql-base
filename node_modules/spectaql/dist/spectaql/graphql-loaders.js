"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.loadSchemaFromSDLFile = exports.loadIntrospectionResponseFromUrl = exports.loadIntrospectionResponseFromFile = exports.introspectionResponseFromSchemaSDL = exports.introspectionResponseFromSchema = exports.graphQLSchemaFromIntrospectionResponse = void 0;var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _get = _interopRequireDefault(require("lodash/get"));
var _set = _interopRequireDefault(require("lodash/set"));

var _graphql = require("graphql");






var _loadFiles = require("@graphql-tools/load-files");
var _merge = require("@graphql-tools/merge");

var _schema = require("@graphql-tools/schema");

var _syncRequest = _interopRequireDefault(require("sync-request"));
var _directive = require("./directive");
var _utils = require("./utils");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}

const GRAPHQL_LOAD_FILES_SUPPORTED_EXTENSIONS = [
'gql',
'graphql',
'graphqls',
'ts',
'js'];



function standardizeIntrospectionQueryResult(result) {
  return result.data ? result.data : result;
}

const introspectionResponseFromSchemaSDL = ({
  schemaSDL,
  getIntrospectionQueryOptions
}) => {
  return introspectionResponseFromSchema({
    schema: (0, _graphql.buildSchema)(schemaSDL),
    getIntrospectionQueryOptions
  });
};exports.introspectionResponseFromSchemaSDL = introspectionResponseFromSchemaSDL;

const introspectionResponseFromSchema = ({
  schema,
  getIntrospectionQueryOptions
}) => {
  return standardizeIntrospectionQueryResult(
    (0, _graphql.graphqlSync)({
      schema,
      source: (0, _graphql.getIntrospectionQuery)(getIntrospectionQueryOptions)
    })
  );
};exports.introspectionResponseFromSchema = introspectionResponseFromSchema;

const loadSchemaFromSDLFile = ({
  pathToFile,
  spectaqlDirectiveOptions = {}
} = {}) => {
  const paths = Array.isArray(pathToFile) ? pathToFile : [pathToFile];
  const typesArray = [];
  for (const path of paths) {
    let types;

    if (path.endsWith('.txt')) {
      types = [(0, _utils.readTextFile)(path)];
    } else {
      if (!(0, _utils.fileExtensionIs)(path, GRAPHQL_LOAD_FILES_SUPPORTED_EXTENSIONS)) {
        throw new Error(
          `Unsupported GraphQL schema file extension: ${path}. Supported extensions include ${GRAPHQL_LOAD_FILES_SUPPORTED_EXTENSIONS.join(
            ', '
          )}.`
        );
      }
      types = (0, _loadFiles.loadFilesSync)(path);
    }

    if (types.length) {
      typesArray.push(types);
    } else {
      console.warn(`WARNING: No GraphqQL schema file(s) found at ${path}.`);
    }
  }
  if (!typesArray.length) {
    throw new Error(`No GraphQL schema files found in paths ${paths.join(',')}`);
  }

  const mergedTypeDefs = (0, _merge.mergeTypeDefs)(typesArray);
  const printedTypeDefs = (0, _graphql.print)(mergedTypeDefs);

  let directiveName;
  let directiveSdl = null;
  let optionsTypeName;
  let optionsSdl = null;
  let transformer = (schema) => schema;
  let directables = [];

  if (spectaqlDirectiveOptions.enable) {
    ({
      directiveName,
      directiveSdl,
      optionsSdl,
      optionsTypeName,
      transformer,
      directables
    } = (0, _directive.generateSpectaqlDirectiveSupport)({
      options: spectaqlDirectiveOptions,
      userSdl: printedTypeDefs
    }));
  }

  let schema = (0, _schema.makeExecutableSchema)({
    typeDefs: [
    directiveSdl,
    optionsSdl,



    printedTypeDefs]

  });

  schema = transformer(schema);

  return {
    schema,
    directables,
    directiveName,
    optionsTypeName
  };
};exports.loadSchemaFromSDLFile = loadSchemaFromSDLFile;

const loadIntrospectionResponseFromFile = ({ pathToFile } = {}) => {

  return standardizeIntrospectionQueryResult((0, _utils.fileToObject)(pathToFile));
};exports.loadIntrospectionResponseFromFile = loadIntrospectionResponseFromFile;

const loadIntrospectionResponseFromUrl = ({
  headers,
  url,
  getIntrospectionQueryOptions
}) => {
  const requestBody = {
    operationName: 'IntrospectionQuery',
    query: (0, _graphql.getIntrospectionQuery)(getIntrospectionQueryOptions)
  };

  const requestOpts = {
    json: requestBody
  };

  if (!(0, _isEmpty.default)(headers)) {
    requestOpts.headers = headers;
  }

  const responseBody = (0, _syncRequest.default)('POST', url, requestOpts).getBody('utf8');


  return standardizeIntrospectionQueryResult(

    JSON.parse(responseBody)
  );
};exports.loadIntrospectionResponseFromUrl = loadIntrospectionResponseFromUrl;

const graphQLSchemaFromIntrospectionResponse = (
introspectionResponse) =>
{
  try {
    return (0, _graphql.buildClientSchema)(
      normalizeIntrospectionQueryResult(introspectionResponse),
      { assumeValid: true }
    );
  } catch (err) {
    console.log('Here is your Introspection Query Response:');
    console.log(JSON.stringify(introspectionResponse));
    throw err;
  }
};exports.graphQLSchemaFromIntrospectionResponse = graphQLSchemaFromIntrospectionResponse;




const normalizeIntrospectionQueryResult = (introspectionResponse) => {
  for (const [key, defaultTypeName] of [
  ['queryType', 'Query'],
  ['mutationType', 'Mutation']])
  {
    const queryOrMutationTypeName = (0, _get.default)(
      introspectionResponse,
      `__schema.${key}.name`
    );
    if (
    queryOrMutationTypeName &&
    !findType({ introspectionResponse, typeName: queryOrMutationTypeName }))
    {
      (0, _set.default)(introspectionResponse, `__schema.${key}`, { name: defaultTypeName });
    }
  }

  return introspectionResponse;
};

function findType({ introspectionResponse, typeName }) {
  return (0, _get.default)(introspectionResponse, '__schema.types', []).find(
    (type) => type.kind === 'OBJECT' && type.name === typeName
  );
}