"use strict";var _url = _interopRequireDefault(require("url"));
var _path = _interopRequireDefault(require("path"));
var _buildSchemas = _interopRequireDefault(require("./build-schemas"));
var _augmenters = require("./augmenters");
var _data = _interopRequireDefault(require("../themes/default/data"));
var _utils = require("./utils");
var _preProcess = _interopRequireDefault(require("./pre-process"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}

async function run(opts) {
  const {
    logoImageName,
    logoData,
    logoUrl,
    faviconImageName,
    faviconData,
    faviconUrl,
    specData: spec,
    themeDir
  } = opts;

  const {
    introspection: introspectionOptions,
    introspection: { url: introspectionUrl, queryNameStrategy },
    extensions = {},
    servers = [],
    info = {}
  } = spec;

  const server =
  servers.find((server) => server.production === true) || servers[0];

  const headers = server !== null && server !== void 0 && server.headers ?
  server.headers.
  map((header) => {
    const { name, example, comment } = header;
    if (name && example) {
      return [comment ? `# ${comment}` : '', `${name}: ${example}`].
      filter(Boolean).
      join('\n');
    }
  }).
  filter(Boolean).
  join('\n') :
  false;



  const urlToParse = info['x-url'] || (server || {}).url || introspectionUrl;

  if (!urlToParse) {
    throw new Error(
      'Please provide either: introspection.url OR servers.url OR info.x-url'
    );
  }

  const { protocol, host, pathname } = _url.default.parse(urlToParse);

  const { introspectionResponse, graphQLSchema } = (0, _buildSchemas.default)(opts);


  const customDataArrangerSuffixThatExists = [
  'data/index.js',
  'data/index.mjs',
  'data.js',
  'data.mjs'].
  find((pathSuffix) => {
    return (0, _utils.fileExists)(_path.default.normalize(`${themeDir}/${pathSuffix}`));
  });

  let arrangeData = (0, _utils.takeDefaultExport)(_data.default);
  if (customDataArrangerSuffixThatExists) {
    try {
      const arrangeDataModule = await (0, _utils.dynamicImport)(
        _url.default.pathToFileURL(
          _path.default.normalize(`${themeDir}/${customDataArrangerSuffixThatExists}`)
        )
      );
      arrangeData = (0, _utils.takeDefaultExport)(arrangeDataModule);
    } catch (err) {
      console.error(err);
      if (
      err instanceof SyntaxError &&
      err.message.includes('Cannot use import statement outside a module'))
      {
        const messages = [
        '***',
        'It appears your theme code is written in ESM but not indicated as such.'];

        if (!customDataArrangerSuffixThatExists.endsWith('.mjs')) {
          messages.push(
            'You can try renaming your file with an "mjs" extension, or setting "type"="module" in your package.json'
          );
        } else {
          messages.push('Try setting "type"="module" in your package.json');
        }

        messages.push('***');
        messages.forEach((msg) => console.error(msg));
      }
      throw err;
    }
  }

  const items = arrangeData({
    introspectionResponse,
    graphQLSchema,
    allOptions: spec,
    introspectionOptions
  });


  (0, _preProcess.default)({
    items,
    introspectionResponse,
    graphQLSchema,
    extensions,
    queryNameStrategy,
    allOptions: opts
  });

  const data = {
    allOptions: opts,
    logoImageName,
    logoUrl,
    logoData,
    faviconImageName,
    faviconData,
    faviconUrl,
    info,
    server,
    headers,
    servers,
    host,
    url: urlToParse,
    schemes: [protocol.slice(0, -1)],
    basePath: pathname,
    items
  };

  return data;
}


module.exports = run;
module.exports.run = run;
module.exports.buildSchemas = _buildSchemas.default;
module.exports.augmentData = _augmenters.augmentData;