"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.addMetadata = void 0;Object.defineProperty(exports, "addMetadataFromDirectables", { enumerable: true, get: function () {return _directive.addMetadataFromDirectables;} });exports.loadMetadataFromFile = exports.addMetadataFromFile = void 0;var _apolloServerPluginIntrospectionMetadata = require("@anvilco/apollo-server-plugin-introspection-metadata");

var _utils = require("./utils");

var _directive = require("./directive");

const loadMetadataFromFile = ({ pathToFile } = {}) => {
  return (0, _utils.fileToObject)(pathToFile);
};exports.loadMetadataFromFile = loadMetadataFromFile;

const addMetadataFromFile = ({
  pathToFile,
  introspectionQueryResponse,
  metadatasReadPath,
  metadatasWritePath
} = {}) => {
  const metadata = loadMetadataFromFile({ pathToFile });
  return addMetadata({
    introspectionQueryResponse,
    metadata,
    metadatasReadPath,
    metadatasWritePath
  });
};exports.addMetadataFromFile = addMetadataFromFile;

const addMetadata = ({
  introspectionQueryResponse,
  metadata,
  metadatasReadPath: metadataSourceKey,
  metadatasWritePath: metadataTargetKey
} = {}) => {
  return (0, _apolloServerPluginIntrospectionMetadata.addMetadata)({
    introspectionQueryResponse,
    schemaMetadata: metadata,
    metadataSourceKey,
    metadataTargetKey
  });
};exports.addMetadata = addMetadata;