"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.buildSchemas = buildSchemas;exports.default = void 0;var _graphqlLoaders = require("./graphql-loaders");







var _metadataLoaders = require("./metadata-loaders");




var _augmenters = require("./augmenters");




function errorThingDone({ trying, done }) {
  const msg = `Cannot try to ${trying} while also having ${done}`;
  throw new Error(msg);
}

function buildSchemas(opts) {
  const { specData: spec } = opts;

  const {
    introspection: introspectionOptions,
    introspection: {
      spectaqlDirective: spectaqlDirectiveOptions = {},
      url: introspectionUrl,
      schemaFile,
      introspectionFile,
      metadataFile,
      headers,
      removeTrailingPeriodFromDescriptions,

      inputValueDeprecation = false
    }
  } = spec;

  let done = false;
  let introspectionResponse;


  const getIntrospectionQueryOptions = {
    inputValueDeprecation
  };

  if (schemaFile) {
    const { schema, directables, directiveName, optionsTypeName } =
    (0, _graphqlLoaders.loadSchemaFromSDLFile)({
      pathToFile: schemaFile,
      spectaqlDirectiveOptions
    });

    introspectionResponse = (0, _graphqlLoaders.introspectionResponseFromSchema)({
      schema,
      getIntrospectionQueryOptions
    });
    if (spectaqlDirectiveOptions.enable && !introspectionResponse.errors) {
      introspectionResponse = (0, _metadataLoaders.addMetadataFromDirectables)({
        ...introspectionOptions,
        directables,
        directiveName,
        optionsTypeName,
        introspectionQueryResponse: introspectionResponse
      });
    }

    done = 'loaded GraphQL SDL from file';
  }

  if (introspectionFile) {
    if (done) {
      errorThingDone({ trying: 'load Introspection from file', done });
    }
    introspectionResponse = (0, _graphqlLoaders.loadIntrospectionResponseFromFile)({
      pathToFile: introspectionFile
    });
    done = 'loaded Introspection from file';
  }

  if (introspectionUrl) {
    if (done) {
      errorThingDone({ trying: 'load Introspection from URL', done });
    }

    let resolvedHeaders = {};
    if (headers) {

      resolvedHeaders =
      typeof headers === 'string' ? JSON.parse(headers) : headers;
    }

    introspectionResponse = (0, _graphqlLoaders.loadIntrospectionResponseFromUrl)({
      headers: resolvedHeaders,
      url: introspectionUrl,
      getIntrospectionQueryOptions
    });
    done = 'loaded via Introspection URL';
  }

  if (!done) {
    throw new Error('Must provide some way to get your schema');
  }

  if (!introspectionResponse) {
    throw new Error('No Introspection Query response');
  }

  if (introspectionResponse.errors) {
    throw new Error('Problem with Introspection Query Response');
  }

  if (metadataFile) {
    (0, _metadataLoaders.addMetadataFromFile)({
      ...introspectionOptions,
      pathToFile: metadataFile,
      introspectionQueryResponse: introspectionResponse
    });
  }

  const augmentedIntrospectionResponse = (0, _augmenters.augmentData)({
    introspectionResponse,
    introspectionOptions
  });

  if (removeTrailingPeriodFromDescriptions) {
    (0, _augmenters.removeTrailingPeriodsFromDescriptions)(augmentedIntrospectionResponse);
  }

  const graphQLSchema = (0, _graphqlLoaders.graphQLSchemaFromIntrospectionResponse)(
    augmentedIntrospectionResponse
  );

  return {
    introspectionResponse: augmentedIntrospectionResponse,
    graphQLSchema
  };
}var _default = exports.default =

buildSchemas;