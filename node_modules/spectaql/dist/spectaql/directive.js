"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.addMetadataFromDirectables = exports.DEFAULT_DIRECTIVE_OPTION_NAME = exports.DEFAULT_DIRECTIVE_NAME = void 0;exports.generateDirectiveSdl = generateDirectiveSdl;exports.generateOptionsSdl = generateOptionsSdl;exports.generateSpectaqlDirectiveSupport = generateSpectaqlDirectiveSupport;exports.generateSpectaqlSdl = generateSpectaqlSdl;var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _set = _interopRequireDefault(require("lodash/set"));

var _graphql = require("graphql");

var _utils = require("@graphql-tools/utils");

var _microfiber = require("microfiber");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}

const DEFAULT_DIRECTIVE_NAME = exports.DEFAULT_DIRECTIVE_NAME = 'spectaql';
const DEFAULT_DIRECTIVE_OPTION_NAME = exports.DEFAULT_DIRECTIVE_OPTION_NAME = 'SpectaQLOption';

const MICROFIBER_OPTIONS = Object.freeze({
  fixQueryAndMutationAndSubscriptionTypes: false,
  removeUnusedTypes: false,
  removeFieldsWithMissingTypes: false,
  removeArgsWithMissingTypes: false,
  removeInputFieldsWithMissingTypes: false,
  removePossibleTypesOfMissingTypes: false,
  cleanupSchemaImmediately: false
});


function parseExample(val) {
  try {
    return JSON.parse(val);
  } catch {
    return String(val);
  }
}

const OPTION_TO_CONVERTER_FN = {
  undocumented: (val) => val === true || val === 'true',
  documented: (val) => val === true || val === 'true',
  example: (val) => parseExample(val),
  examples: (vals) => JSON.parse(vals)
};

function generateSpectaqlSdl({
  directiveName = DEFAULT_DIRECTIVE_NAME,
  optionsTypeName = DEFAULT_DIRECTIVE_OPTION_NAME
} = {}) {
  return (
    generateDirectiveSdl({ directiveName, optionsTypeName }) +
    '\n' +
    generateOptionsSdl({ optionsTypeName }) +
    '\n');

}

function generateDirectiveSdl({
  directiveName = DEFAULT_DIRECTIVE_NAME,
  optionsTypeName = DEFAULT_DIRECTIVE_OPTION_NAME
} = {}) {




  return `directive @${directiveName}(options: [${optionsTypeName}]) on ${Object.values(
    _graphql.DirectiveLocation
  ).join(' | ')}`;
}

function generateOptionsSdl({
  optionsTypeName = DEFAULT_DIRECTIVE_OPTION_NAME
} = {}) {
  return `input ${optionsTypeName} { key: String!, value: String! }`;
}

function processDirective(directive) {
  return ((directive === null || directive === void 0 ? void 0 : directive.options) || []).reduce((acc, { key: option, value }) => {
    if (OPTION_TO_CONVERTER_FN[option]) {
      acc[option] = OPTION_TO_CONVERTER_FN[option](value);
    }
    return acc;
  }, {});
}

function generateSpectaqlDirectiveSupport({
  options: spectaqlDirectiveOptions = {},
  userSdl = ''
} = {}) {
  const directables = [];

  const {
    onlyAddIfMissing,
    directiveName = DEFAULT_DIRECTIVE_NAME,
    optionsTypeName = DEFAULT_DIRECTIVE_OPTION_NAME
  } = spectaqlDirectiveOptions;

  let { directiveSdl, optionsSdl } = spectaqlDirectiveOptions;

  if (
  !directiveSdl && (
  !userSdl.includes(`directive @${directiveName}`) || !onlyAddIfMissing))
  {
    directiveSdl = generateSpectaqlSdl(spectaqlDirectiveOptions);
  }

  if (
  !optionsSdl && (
  !userSdl.includes(`input ${optionsTypeName}`) || !onlyAddIfMissing))
  {
    optionsSdl = generateOptionsSdl(spectaqlDirectiveOptions);
  }

  function typeHandler(type, schema, mapperKind) {var _getDirective;
    const directive = (_getDirective = (0, _utils.getDirective)(schema, type, 'spectaql')) === null || _getDirective === void 0 ? void 0 : _getDirective[0];
    if (!(0, _isEmpty.default)(directive)) {
      directables.push({
        directive: processDirective(directive),
        type,
        mapperKind
      });
    }
  }

  function configHandler(config, fieldName, typeName, schema, mapperKind) {var _getDirective2;
    const directive = (_getDirective2 = (0, _utils.getDirective)(schema, config, 'spectaql')) === null || _getDirective2 === void 0 ? void 0 : _getDirective2[0];

    if (!(0, _isEmpty.default)(directive)) {
      directables.push({
        directive: processDirective(directive),
        config,
        fieldName,
        typeName,
        mapperKind
      });
    }
  }

  function enumValueHandler(
  config,
  typeName,
  schema,
  externalValue,
  mapperKind)
  {var _getDirective3;
    const directive = (_getDirective3 = (0, _utils.getDirective)(schema, config, 'spectaql')) === null || _getDirective3 === void 0 ? void 0 : _getDirective3[0];

    if (!(0, _isEmpty.default)(directive)) {
      directables.push({
        directive: processDirective(directive),
        config,
        typeName,
        externalValue,
        mapperKind
      });
    }
  }

  const HANDLER_MAP = {
    [_utils.MapperKind.TYPE]: (...args) => typeHandler(...args, _utils.MapperKind.TYPE),
    [_utils.MapperKind.SCALAR_TYPE]: (...args) =>
    typeHandler(...args, _utils.MapperKind.SCALAR_TYPE),
    [_utils.MapperKind.ENUM_TYPE]: (...args) =>
    typeHandler(...args, _utils.MapperKind.ENUM_TYPE),
    [_utils.MapperKind.COMPOSITE_TYPE]: (...args) =>
    typeHandler(...args, _utils.MapperKind.COMPOSITE_TYPE),
    [_utils.MapperKind.OBJECT_TYPE]: (...args) =>
    typeHandler(...args, _utils.MapperKind.OBJECT_TYPE),
    [_utils.MapperKind.INPUT_OBJECT_TYPE]: (...args) =>
    typeHandler(...args, _utils.MapperKind.INPUT_OBJECT_TYPE),
    [_utils.MapperKind.ABSTRACT_TYPE]: (...args) =>
    typeHandler(...args, _utils.MapperKind.ABSTRACT_TYPE),
    [_utils.MapperKind.UNION_TYPE]: (...args) =>
    typeHandler(...args, _utils.MapperKind.UNION_TYPE),
    [_utils.MapperKind.INTERFACE_TYPE]: (...args) =>
    typeHandler(...args, _utils.MapperKind.INTERFACE_TYPE),
    [_utils.MapperKind.ROOT_OBJECT]: (...args) =>
    typeHandler(...args, _utils.MapperKind.ROOT_OBJECT),
    [_utils.MapperKind.QUERY]: (...args) => typeHandler(...args, _utils.MapperKind.QUERY),
    [_utils.MapperKind.MUTATION]: (...args) =>
    typeHandler(...args, _utils.MapperKind.MUTATION),
    [_utils.MapperKind.SUBSCRIPTION]: (...args) =>
    typeHandler(...args, _utils.MapperKind.SUBSCRIPTION),
    [_utils.MapperKind.ENUM_VALUE]: (...args) =>
    enumValueHandler(...args, _utils.MapperKind.ENUM_VALUE),
    [_utils.MapperKind.FIELD]: (...args) => configHandler(...args, _utils.MapperKind.FIELD),
    [_utils.MapperKind.OBJECT_FIELD]: (...args) =>
    configHandler(...args, _utils.MapperKind.OBJECT_FIELD),
    [_utils.MapperKind.ROOT_FIELD]: (...args) =>
    configHandler(...args, _utils.MapperKind.ROOT_FIELD),
    [_utils.MapperKind.QUERY_ROOT_FIELD]: (...args) =>
    configHandler(...args, _utils.MapperKind.QUERY_ROOT_FIELD),
    [_utils.MapperKind.MUTATION_ROOT_FIELD]: (...args) =>
    configHandler(...args, _utils.MapperKind.MUTATION_ROOT_FIELD),
    [_utils.MapperKind.SUBSCRIPTION_ROOT_FIELD]: (...args) =>
    configHandler(...args, _utils.MapperKind.SUBSCRIPTION_ROOT_FIELD),
    [_utils.MapperKind.INTERFACE_FIELD]: (...args) =>
    configHandler(...args, _utils.MapperKind.INTERFACE_FIELD),
    [_utils.MapperKind.COMPOSITE_FIELD]: (...args) =>
    configHandler(...args, _utils.MapperKind.COMPOSITE_FIELD),
    [_utils.MapperKind.INPUT_OBJECT_FIELD]: (...args) =>
    configHandler(...args, _utils.MapperKind.INPUT_OBJECT_FIELD),
    [_utils.MapperKind.ARGUMENT]: (...args) =>
    configHandler(...args, _utils.MapperKind.ARGUMENT)

  };

  return {
    directables,
    directiveName,
    directiveSdl,
    optionsTypeName,
    optionsSdl,
    transformer: (schema) => {
      return (0, _utils.mapSchema)(schema, HANDLER_MAP);
    }
  };
}

const MAPPER_KIND_TO_KIND_MAP = Object.freeze({
  [_utils.MapperKind.OBJECT_FIELD]: _microfiber.KINDS.OBJECT,
  [_utils.MapperKind.QUERY_ROOT_FIELD]: _microfiber.KINDS.OBJECT,
  [_utils.MapperKind.MUTATION_ROOT_FIELD]: _microfiber.KINDS.OBJECT,
  [_utils.MapperKind.SUBSCRIPTION_ROOT_FIELD]: _microfiber.KINDS.OBJECT,
  [_utils.MapperKind.INTERFACE_FIELD]: _microfiber.KINDS.INTERFACE,
  [_utils.MapperKind.ENUM_VALUE]: _microfiber.KINDS.ENUM
});

const MAPPER_KIND_TO_STUFF_MAP = Object.freeze({
  [_utils.MapperKind.ARGUMENT]: {
    fnName: 'getArg',
    typeKind: _microfiber.KINDS.OBJECT
  },
  [_utils.MapperKind.INPUT_OBJECT_FIELD]: {
    fnName: 'getField',
    typeKind: _microfiber.KINDS.INPUT_OBJECT
  }
});

const addMetadataFromDirectables = ({
  directables,
  directiveName,
  optionsTypeName,
  introspectionQueryResponse,
  metadatasWritePath
}) => {
  const microfiber = new _microfiber.Microfiber(
    introspectionQueryResponse,
    MICROFIBER_OPTIONS
  );

  const typeFnMap = {
    ObjectTypeDefinition: ({ type }) =>
    microfiber.getType({ kind: _microfiber.KINDS.OBJECT, name: type.name }),
    ScalarTypeDefinition: ({ type }) =>
    microfiber.getType({ kind: _microfiber.KINDS.SCALAR, name: type.name }),
    EnumTypeDefinition: ({ type }) =>
    microfiber.getType({ kind: _microfiber.KINDS.ENUM, name: type.name }),
    InterfaceTypeDefinition: ({ type }) =>
    microfiber.getType({ kind: _microfiber.KINDS.INTERFACE, name: type.name }),
    UnionTypeDefinition: ({ type }) =>
    microfiber.getType({ kind: _microfiber.KINDS.UNION, name: type.name }),
    InputObjectTypeDefinition: ({ type }) =>
    microfiber.getType({ kind: _microfiber.KINDS.INPUT_OBJECT, name: type.name })
  };

  const configFnMap = {
    FieldDefinition: ({ type, config, typeName, fieldName, mapperKind }) => {
      const typeKind = MAPPER_KIND_TO_KIND_MAP[mapperKind];
      if (!typeKind) {
        console.error(new Error('Unsupported mapperKind'), {
          type,
          config,
          mapperKind,
          typeName,
          fieldName
        });
        return;
      }
      return microfiber.getField({ typeKind, typeName, fieldName });
    },
    InputValueDefinition: ({
      type,
      config,
      typeName,
      fieldName,
      mapperKind,
      astNode
    }) => {
      const { fnName, typeKind } = MAPPER_KIND_TO_STUFF_MAP[mapperKind] || {};
      if (!typeKind) {
        console.error(new Error('Unsupported mapperKind'), {
          type,
          config,
          mapperKind,
          typeName,
          fieldName
        });
        return;
      }

      return microfiber[fnName]({
        typeKind,
        typeName,
        fieldName,
        argName: astNode.name.value
      });
    },
    EnumValueDefinition: ({
      type,
      config,
      typeName,
      externalValue,
      mapperKind
    }) => {
      const typeKind = MAPPER_KIND_TO_KIND_MAP[mapperKind];
      if (!typeKind) {
        console.error(new Error('Unsupported mapperKind'), {
          type,
          config,
          mapperKind,
          typeName,
          externalValue
        });
        return;
      }
      return microfiber.getField({
        typeKind,
        typeName,
        fieldName: externalValue
      });
    }
  };

  for (const {
    directive,
    type,
    config,
    fieldName,
    typeName,
    externalValue,
    mapperKind
  } of directables) {
    if (!directive || !Object.keys(directive).length) {
      continue;
    }

    const map = type ? typeFnMap : config ? configFnMap : {};
    const astNode = (type || config).astNode;

    const fn = map[astNode.kind];
    if (fn) {
      const typeDef = fn({
        type,
        config,
        typeName,
        fieldName,
        externalValue,
        mapperKind,
        astNode
      });
      if (typeDef) {
        (0, _set.default)(typeDef, metadatasWritePath, directive);
      } else {
        console.error(new Error('Unsupported typeDef'), {
          type,
          config,
          typeName,
          fieldName,
          externalValue,
          mapperKind,
          astNode
        });
      }
    } else {
      console.error(new Error('Unsupported astNode.kind'), {
        type,
        config,
        typeName,
        fieldName,
        externalValue,
        astNode
      });
    }
  }


  microfiber.removeDirective({ name: directiveName });
  microfiber.removeType({ kind: _microfiber.KINDS.INPUT_OBJECT, name: optionsTypeName });

  return microfiber.getResponse();
};exports.addMetadataFromDirectables = addMetadataFromDirectables;