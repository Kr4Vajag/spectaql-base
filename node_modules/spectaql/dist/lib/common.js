"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.addQuoteTags = addQuoteTags;exports.addSpecialTags = addSpecialTags;exports.enumToJsonFriendly = enumToJsonFriendly;exports.generateIntrospectionTypeExample = generateIntrospectionTypeExample;exports.getExampleForScalarDefinition = getExampleForScalarDefinition;exports.introspectionArgsToVariables = introspectionArgsToVariables;exports.introspectionQueryOrMutationToResponse = introspectionQueryOrMutationToResponse;exports.markdown = markdown;exports.printSchema = printSchema;var _json = _interopRequireDefault(require("json5"));

var _jsonStringifyPrettyCompact = _interopRequireDefault(require("json-stringify-pretty-compact"));
var _cheerio = require("cheerio");
var _marked = require("marked");
var _highlight = _interopRequireDefault(require("highlight.js"));
var _graphqlHl = require("../spectaql/graphql-hl");



var _typeHelpers = require("../spectaql/type-helpers");
var _utils = require("../spectaql/utils");
var _microfiber = require("microfiber");
var _graphqlScalars = require("../themes/default/helpers/graphql-scalars");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}


_highlight.default.configure({

});

_highlight.default.registerLanguage('graphql', _graphqlHl.ourFunction);


const mdRenderer = new _marked.marked.Renderer();
mdRenderer.code = highlight;


_marked.marked.setOptions({

  renderer: mdRenderer
});





const SPECIAL_TAG = 'SPECIALTAG';
const SPECIAL_TAG_REGEX = new RegExp(`"?${SPECIAL_TAG}"?`, 'g');

const QUOTE_TAG = 'QUOTETAG';
const QUOTE_TAG_REGEX = new RegExp(QUOTE_TAG, 'g');

const QUOTE_HTML = '&quot;';
const QUOTE_HTML_REGEX = new RegExp(QUOTE_HTML, 'g');


const SCALAR_TO_EXAMPLE = {
  String: ['abc123', 'xyz789'],
  Int: [123, 987],
  Float: [123.45, 987.65],
  Boolean: [true, false],
  Date: [
  new Date(),
  new Date(new Date().setMonth(new Date().getMonth() - 6).valueOf())].
  map((date) => date.toISOString()),
  DateTime: [
  new Date(),
  new Date(new Date().setMonth(new Date().getMonth() - 6).valueOf())].
  map((date) => date.toISOString()),
  JSON: SPECIAL_TAG + '{}' + SPECIAL_TAG,
  ID: [4, '4']
};

function unwindTags(str) {
  if (typeof str !== 'string') {
    return str;
  }

  return replaceQuoteTags(removeSpecialTags(str));
}

function jsonReplacer(name, value) {
  return value;

}

function enumToJsonFriendly(str) {
  return (
    str.

    replace(
      /(:\s*)([a-zA-Z]\w*)/g,
      (match, keyPart, enumValue) => keyPart + '"' + enumValue + '"'
    ).

    replace(/\[(([a-zA-Z]\w*)[,\s]*)*\]/g, (match) => {
      return (
        '[' +
        match.
        substr(1, match.length - 2).
        split(',').
        map((enumValue) => '"' + enumValue.trim() + '"').
        join(', ') +
        ']');

    }));

}

function addSpecialTags(value) {
  if (typeof value !== 'string' || value.includes(SPECIAL_TAG)) return value;
  return `${SPECIAL_TAG}${value}${SPECIAL_TAG}`;
}

function removeSpecialTags(value) {
  if (typeof value !== 'string') return value;
  return value.replace(SPECIAL_TAG_REGEX, '');
}


function addQuoteTags(value) {

  if (!value || typeof value !== 'string' || value.includes(QUOTE_TAG)) {
    return value;
  }

  return `${QUOTE_TAG}${value}${QUOTE_TAG}`;
}

function replaceQuoteTags(value) {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(QUOTE_TAG_REGEX, QUOTE_HTML);
}

function replaceHtmlQuotesWithQuotes(value) {
  if (typeof value !== 'string') return value;
  return value.replace(QUOTE_HTML_REGEX, '"');
}








function markdown(
value,
{ stripParagraph = false, addClass = false } = {})
{
  if (!value) {
    return value;
  }

  let html = _marked.marked.parse(value);

  if (stripParagraph) {
    let $ = (0, _cheerio.load)('<root>' + html + '</root>')('root');

    if ($.children().length === 1 && $.children('p').length === 1) {
      html = $.children('p').html();
    }
  }

  if (addClass) {
    let $ = (0, _cheerio.load)('<root>' + html + '</root>')('root');
    if ($.children().length === 1) {
      $.children().first().addClass(addClass);
      html = $.html();
    }
  }

  return html;
}

function highlight(code, language) {
  let highlighted;
  if (language) {
    try {
      highlighted = _highlight.default.highlight(code, { language }).value;
    } catch (e) {
      console.error(e);
    }
  }
  if (!highlighted) {
    highlighted = _highlight.default.highlightAuto(code).value;
  }

  return (
    '<pre><code' + (
    language ?
    ' class="hljs ' + this.options.langPrefix + language + '"' :
    ' class="hljs"') +
    '>' +
    highlighted +
    '\n</code></pre>\n');

}

function getExampleForScalarDefinition(scalarDefinition, otherOptions) {var _otherOptions$extensi;
  const { name, kind } = scalarDefinition;

  if (kind !== 'SCALAR') {
    return;
  }
  let replacement;
  let wasFromGraphQLScalar = false;

  const useGraphqlScalarExamples =
  otherOptions === null || otherOptions === void 0 || (_otherOptions$extensi = otherOptions.extensions) === null || _otherOptions$extensi === void 0 ? void 0 : _otherOptions$extensi.graphqlScalarExamples;


  if (useGraphqlScalarExamples) {
    replacement = (0, _graphqlScalars.getExampleForGraphQLScalar)(name);
    if (typeof replacement !== 'undefined') {
      wasFromGraphQLScalar = true;
    }
  }

  if (typeof replacement === 'undefined') {
    replacement = SCALAR_TO_EXAMPLE[name];
  }

  if (typeof replacement === 'undefined') {
    return;
  }

  replacement =
  !wasFromGraphQLScalar && Array.isArray(replacement) ?
  replacement[Math.floor(Math.random() * replacement.length)] :
  replacement;

  if (typeof replacement === 'string') {
    replacement = addSpecialTags(addQuoteTags(replacement));
  }

  return replacement;
}

function introspectionArgsToVariables({
  args,
  introspectionResponse,
  introspectionManipulator,
  extensions
}) {
  if (!(args && args.length)) {
    return null;
  }

  return args.reduce((acc, arg) => {
    acc[arg.name] = introspectionArgToVariable({
      arg,
      introspectionResponse,
      introspectionManipulator,
      extensions
    });
    return acc;
  }, {});
}


function introspectionArgToVariable({
  arg,
  introspectionResponse,
  introspectionManipulator,
  extensions
}) {
  if (!arg) {
    return null;
  }


  if (!(0, _utils.isUndef)(arg.example)) {
    return arg.example;
  }

  if (arg.defaultValue) {
    const {
      underlyingType,

      isArray

    } = (0, _typeHelpers.analyzeTypeIntrospection)(arg.type);

    if (typeof arg.defaultValue === 'string') {
      if (underlyingType.kind !== 'ENUM') {
        return _json.default.parse(enumToJsonFriendly(arg.defaultValue));
      }

      if (!isArray) {
        return arg.defaultValue;
      }


      return arg.defaultValue.
      substr(1, arg.defaultValue.length - 2).
      split(',').
      map((val) => val.trim());
    }
  }

  introspectionManipulator =
  introspectionManipulator ||
  new _microfiber.Microfiber(introspectionResponse);

  const underlyingTypeDefinition = introspectionManipulator.getType(
    _microfiber.Microfiber.digUnderlyingType(arg.type)
  );

  const otherOptions = {
    extensions
  };

  return generateIntrospectionReturnTypeExample(
    {
      thing: arg,
      underlyingTypeDefinition,
      originalType: arg.type
    },
    otherOptions
  );
}

function introspectionQueryOrMutationToResponse({
  field,
  introspectionResponse,
  introspectionManipulator,
  extensions
}) {
  introspectionManipulator =
  introspectionManipulator ||
  new _microfiber.Microfiber(introspectionResponse);

  const { isArray } = (0, _typeHelpers.analyzeTypeIntrospection)(field.type);
  const underlyingTypeDefinition = introspectionManipulator.getType(
    _microfiber.Microfiber.digUnderlyingType(field.type)
  );

  const otherOptions = {
    extensions
  };


  if (!underlyingTypeDefinition.fields) {
    return generateIntrospectionReturnTypeExample(
      {
        thing: field,
        underlyingTypeDefinition,
        originalType: field.type
      },
      otherOptions
    );
  }


  const exampleObject = underlyingTypeDefinition.fields.reduce((acc, field) => {
    const underlyingTypeDefinition = introspectionManipulator.getType(
      _microfiber.Microfiber.digUnderlyingType(field.type)
    );
    acc[field.name] = generateIntrospectionReturnTypeExample(
      {
        thing: field,
        underlyingTypeDefinition,
        originalType: field.type
      },
      otherOptions
    );
    return acc;
  }, {});

  return isArray ? [exampleObject] : exampleObject;
}

function generateIntrospectionReturnTypeExample(
{ thing, underlyingTypeDefinition, originalType, quoteEnum = false },
otherOptions)
{
  let example = (0, _utils.firstNonUndef)([
  thing.example,
  originalType.example,
  underlyingTypeDefinition.example]
  );
  if ((0, _utils.isUndef)(example)) {
    example =
    underlyingTypeDefinition.kind === 'ENUM' &&
    underlyingTypeDefinition.enumValues.length && (
    quoteEnum ?
    addQuoteTags(underlyingTypeDefinition.enumValues[0].name) :
    underlyingTypeDefinition.enumValues[0].name) ||
    underlyingTypeDefinition.kind === 'UNION' &&
    underlyingTypeDefinition.possibleTypes.length &&
    addSpecialTags(underlyingTypeDefinition.possibleTypes[0].name) ||
    getExampleForScalarDefinition(underlyingTypeDefinition, otherOptions);
  }

  if (typeof example !== 'undefined') {

  } else {

    example = addSpecialTags(underlyingTypeDefinition.name);
  }

  const {


    isArray

  } = (0, _typeHelpers.analyzeTypeIntrospection)(originalType);

  return isArray && !Array.isArray(example) ? [example] : example;
}

function generateIntrospectionTypeExample({
  type,
  introspectionResponse,
  introspectionManipulator,
  extensions
}) {
  introspectionManipulator =
  introspectionManipulator ||
  new _microfiber.Microfiber(introspectionResponse);

  const otherOptions = {
    extensions
  };

  const fields = type.fields || type.inputFields;

  if (!fields) {
    return generateIntrospectionReturnTypeExample(
      {
        thing: type,
        underlyingTypeDefinition: type,
        originalType: type,

        quoteEnum: true
      },
      otherOptions
    );
  }


  return fields.reduce((acc, field) => {
    const underlyingTypeDefinition = introspectionManipulator.getType(
      _microfiber.Microfiber.digUnderlyingType(field.type)
    );
    acc[field.name] = generateIntrospectionReturnTypeExample(
      {
        thing: field,
        underlyingTypeDefinition,
        originalType: field.type
      },
      otherOptions
    );
    return acc;
  }, {});
}

function printSchema(value, _root) {
  if (!value) {
    return '';
  }

  let markedDown;
  if (typeof value == 'string') {
    markedDown = _marked.marked.parse('```gql\r\n' + value + '\n```');
  } else {
    const stringified = (0, _jsonStringifyPrettyCompact.default)(value, {
      indent: 2,
      replacer: jsonReplacer
    });
    markedDown = _marked.marked.parse('```json\r\n' + stringified + '\n```');
  }




  const quoted = replaceHtmlQuotesWithQuotes(markedDown);




  return (0, _cheerio.load)(unwindTags(quoted), null, false).html();
}