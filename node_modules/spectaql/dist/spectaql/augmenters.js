"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.addExamples = addExamples;exports.augmentData = augmentData;exports.calculateShouldDocument = void 0;exports.createIntrospectionManipulator = createIntrospectionManipulator;exports.hideThingsBasedOnMetadata = hideThingsBasedOnMetadata;exports.removeTrailingPeriodsFromDescriptions = removeTrailingPeriodsFromDescriptions;var _lodash = _interopRequireDefault(require("lodash"));
var _microfiber = require("microfiber");






var _utils = require("./utils");
var _typeHelpers = require("./type-helpers");
var _common = require("../lib/common");
var _stripTrailing = _interopRequireDefault(require("../themes/default/helpers/stripTrailing"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}

const calculateShouldDocument = ({ undocumented, documented, def }) => {
  return undocumented !== true && (documented === true || def === true);
};exports.calculateShouldDocument = calculateShouldDocument;

function augmentData(args) {
  const introspectionManipulator = createIntrospectionManipulator(args);

  args = {
    ...args,
    introspectionManipulator
  };

  hideThingsBasedOnMetadata(args);

  addExamples(args);

  removeMetadata(args);

  return introspectionManipulator.getResponse();
}

function createIntrospectionManipulator(args) {
  const {
    introspectionResponse,
    introspectionOptions: { microfiberOptions }
  } = args;

  return new _microfiber.Microfiber(introspectionResponse, microfiberOptions);
}


function hideThingsBasedOnMetadata({
  introspectionManipulator,
  introspectionOptions
}) {

  hideTypes({
    introspectionManipulator,
    introspectionOptions
  });





  hideFields({
    introspectionManipulator,
    introspectionOptions
  });








  hideArguments({
    introspectionManipulator,
    introspectionOptions
  });

  return {
    introspectionManipulator,
    introspectionOptions
  };
}

function hideTypes({ introspectionManipulator, introspectionOptions }) {
  const {
    metadatasPath,
    queriesDocumentedDefault,
    mutationsDocumentedDefault,
    subscriptionsDocumentedDefault,
    objectsDocumentedDefault,
    objectDocumentedDefault,
    inputsDocumentedDefault,
    inputDocumentedDefault,
    unionsDocumentedDefault,
    unionDocumentedDefault,
    enumsDocumentedDefault,
    enumDocumentedDefault
  } = introspectionOptions;

  const queryType = introspectionManipulator.getQueryType();
  const mutationType = introspectionManipulator.getMutationType();
  const subscriptionType = introspectionManipulator.getSubscriptionType();

  const types = introspectionManipulator.getAllTypes({
    includeReserved: false,
    includeQuery: true,
    includeMutation: true,
    includeSubscription: true
  });

  for (const type of types) {
    let allThingsDocumentedDefault = objectsDocumentedDefault;
    let individualThingsDocumentedDefault = !!objectDocumentedDefault;
    if ((0, _microfiber.typesAreSame)(type, queryType)) {
      allThingsDocumentedDefault = queriesDocumentedDefault;
      individualThingsDocumentedDefault = true;
    } else if ((0, _microfiber.typesAreSame)(type, mutationType)) {
      allThingsDocumentedDefault = !!mutationsDocumentedDefault;
      individualThingsDocumentedDefault = true;
    } else if ((0, _microfiber.typesAreSame)(type, subscriptionType)) {
      allThingsDocumentedDefault = !!subscriptionsDocumentedDefault;
      individualThingsDocumentedDefault = true;
    } else if (type.kind === _microfiber.KINDS.INPUT_OBJECT) {
      allThingsDocumentedDefault = !!inputsDocumentedDefault;
      individualThingsDocumentedDefault = !!inputDocumentedDefault;
    } else if (type.kind === _microfiber.KINDS.ENUM) {
      allThingsDocumentedDefault = !!enumsDocumentedDefault;
      individualThingsDocumentedDefault = !!enumDocumentedDefault;
    } else if (type.kind === _microfiber.KINDS.UNION) {
      allThingsDocumentedDefault = !!unionsDocumentedDefault;
      individualThingsDocumentedDefault = !!unionDocumentedDefault;
    }

    const metadata = _lodash.default.get(type, metadatasPath, {});
    const shouldDocument =
    !!allThingsDocumentedDefault &&
    calculateShouldDocument({
      ...metadata,
      def: !!individualThingsDocumentedDefault
    });

    if (!shouldDocument) {
      introspectionManipulator.removeType({
        kind: type.kind,
        name: type.name
      });
    }
  }
}






function hideFields(options = {}) {
  const { introspectionManipulator, introspectionOptions } = options;

  const {
    metadatasPath,
    queryDocumentedDefault,
    mutationDocumentedDefault,
    subscriptionDocumentedDefault,
    fieldDocumentedDefault,
    inputFieldDocumentedDefault
  } = introspectionOptions;

  const queryType = introspectionManipulator.getQueryType();
  const mutationType = introspectionManipulator.getMutationType();
  const subscriptionType = introspectionManipulator.getSubscriptionType();

  const types = introspectionManipulator.getAllTypes({
    includeReserved: false,
    includeQuery: true,
    includeMutation: true,
    includeSubscription: true
  });

  for (const type of types) {





    let defaultShowHide =
    type.kind === _microfiber.KINDS.INPUT_OBJECT ?
    inputFieldDocumentedDefault :
    fieldDocumentedDefault;

    if (queryType && (0, _microfiber.typesAreSame)(type, queryType)) {
      defaultShowHide = !!queryDocumentedDefault;
    } else if (mutationType && (0, _microfiber.typesAreSame)(type, mutationType)) {
      defaultShowHide = !!mutationDocumentedDefault;
    } else if (subscriptionType && (0, _microfiber.typesAreSame)(type, subscriptionType)) {
      defaultShowHide = !!subscriptionDocumentedDefault;
    }


    for (const field of type.fields ||
    type.inputFields ||
    type.enumValues ||
    []) {
      const metadata = _lodash.default.get(field, metadatasPath, {});
      const shouldDocument = calculateShouldDocument({
        ...metadata,
        def: defaultShowHide
      });
      if (!shouldDocument) {
        introspectionManipulator.removeField({
          typeKind: type.kind,
          typeName: type.name,
          fieldName: field.name
        });
      }
    }
  }
}

function hideArguments(args = {}) {
  const { introspectionManipulator, introspectionOptions } = args;

  const {
    metadatasPath,
    queryArgDocumentedDefault,
    mutationArgDocumentedDefault,
    subscriptionArgDocumentedDefault,
    argDocumentedDefault
  } = introspectionOptions;

  const queryType = introspectionManipulator.getQueryType();
  const mutationType = introspectionManipulator.getMutationType();
  const subscriptionType = introspectionManipulator.getSubscriptionType();

  const types = introspectionManipulator.getAllTypes({
    includeReserved: false,
    includeQuery: true,
    includeMutation: true,
    includeSubscription: true
  });

  for (const type of types) {





    let defaultShowHide = argDocumentedDefault;
    if (queryType && (0, _microfiber.typesAreSame)(type, queryType)) {
      defaultShowHide = !!queryArgDocumentedDefault;
    } else if (mutationType && (0, _microfiber.typesAreSame)(type, mutationType)) {
      defaultShowHide = !!mutationArgDocumentedDefault;
    } else if (subscriptionType && (0, _microfiber.typesAreSame)(type, subscriptionType)) {
      defaultShowHide = !!subscriptionArgDocumentedDefault;
    }

    for (const field of type.fields || []) {
      for (const arg of field.args || []) {
        const metadata = _lodash.default.get(arg, metadatasPath, {});
        const shouldDocument = calculateShouldDocument({
          ...metadata,
          def: defaultShowHide
        });
        if (!shouldDocument) {
          introspectionManipulator.removeArg({
            typeKind: type.kind,
            typeName: type.name,
            fieldName: field.name,
            argName: arg.name
          });
        }
      }
    }
  }
}

function addExamples(args = {}) {
  const dynamicExamplesProcessingModule = _lodash.default.get(
    args,
    'introspectionOptions.dynamicExamplesProcessingModule'
  );

  let processor = () => {};
  if (dynamicExamplesProcessingModule) {
    try {
      processor = require(dynamicExamplesProcessingModule);
      if (!processor) {
        console.warn('\n\n\nNO EXAMPLE PROCESSOR FOUND AT PATH\n\n\n');
        return args;
      }

      if (typeof processor !== 'function') {
        console.warn('\n\n\nPROCESSOR EXPORT MUST BE A FUNCTION\n\n\n');
        return args;
      }
    } catch (e) {
      if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
        console.warn('\n\n\nCOULD NOT LOAD EXAMPLE PROCESSOR\n\n\n');
        return args;
      } else {
        throw e;
      }
    }
  }

  const { introspectionManipulator, introspectionOptions } = args;

  const { metadatasPath } = introspectionOptions;

  const introspectionResponse = introspectionManipulator.getResponse();

  const types = introspectionResponse.__schema.types;

  const queryType = introspectionManipulator.getQueryType();
  const mutationType = introspectionManipulator.getMutationType();
  const subscriptionType = introspectionManipulator.getSubscriptionType();

  for (const type of types) {

    if ((0, _microfiber.isReservedType)(type)) {
      continue;
    }

    const isQueryOrMutationOrSubscription =
    !!(queryType && (0, _microfiber.typesAreSame)(type, queryType)) ||
    !!(mutationType && (0, _microfiber.typesAreSame)(type, mutationType)) ||
    !!(subscriptionType && (0, _microfiber.typesAreSame)(type, subscriptionType));

    if (!isQueryOrMutationOrSubscription) {
      handleExamples({ type });
    }

    for (const field of type.fields || []) {


      if (!isQueryOrMutationOrSubscription) {
        handleExamples({ type, field });
      }

      for (const arg of field.args || []) {
        handleExamples({ type, field, arg });
      }
    }

    for (const inputField of type.inputFields || []) {
      handleExamples({ type, inputField });
    }
  }



  introspectionManipulator.setResponse(introspectionResponse);

  return {
    introspectionManipulator,
    introspectionOptions
  };

  function getExistingExample(thing) {
    let { example, examples } = _lodash.default.get(thing, metadatasPath, {});
    if (examples && examples.length) {
      example = examples[Math.floor(Math.random() * examples.length)];
    }

    return example;
  }

  function handleExamples({ type, field, inputField, arg }) {
    const thing = arg || inputField || field || type;
    const typeForAnalysis = thing === type ? type : thing.type;
    const typeAnalysis = (0, _typeHelpers.analyzeTypeIntrospection)(typeForAnalysis);

    let example = getExistingExample(thing);
    if (!(0, _utils.isUndef)(example)) {
      thing.example = example;
    }

    example = processor({ ...typeAnalysis, type, field, arg, inputField });

    if (!(0, _utils.isUndef)(example)) {
      thing.example = example;
    }

    if (thing.kind === _microfiber.KINDS.SCALAR && typeof thing.example === 'string') {
      thing.example = (0, _common.addSpecialTags)((0, _common.addQuoteTags)(thing.example));
    }
  }
}


function removeMetadata(args = {}) {
  const { introspectionManipulator, introspectionOptions } = args;

  const { metadatasPath } = introspectionOptions;

  const introspectionResponse = introspectionManipulator.getResponse();

  const types = introspectionResponse.__schema.types;

  for (const type of types) {

    if ((0, _microfiber.isReservedType)(type)) {
      continue;
    }

    _lodash.default.unset(type, metadatasPath);

    for (const field of type.fields || []) {
      _lodash.default.unset(field, metadatasPath);

      for (const arg of field.args || []) {
        _lodash.default.unset(arg, metadatasPath);
      }
    }

    for (const inputField of type.inputFields || []) {
      _lodash.default.unset(inputField, metadatasPath);
    }
  }



  introspectionManipulator.setResponse(introspectionResponse);
}

function iterateOverObject(obj, fn) {
  for (const key in obj) {
    const val = obj[key];

    if (typeof val !== 'undefined') {
      const newVal = fn({ key, val, parent: obj });
      if (typeof newVal !== 'undefined') {
        obj[key] = newVal;
        continue;
      } else if (typeof val === 'object') {
        iterateOverObject(val, fn);
        continue;
      }
    }
  }
}

function removeTrailingPeriodsFromDescriptions(obj) {
  iterateOverObject(obj, ({ key, val }) => {
    if (key === 'description' && typeof val === 'string') {
      return (0, _stripTrailing.default)(val, '.', {});
    }
  });

  return obj;
}