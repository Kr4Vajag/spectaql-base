"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.buildSchemas = exports.augmentData = void 0;Object.defineProperty(exports, "generateDirectiveSdl", { enumerable: true, get: function () {return _directive.generateDirectiveSdl;} });Object.defineProperty(exports, "generateOptionsSdl", { enumerable: true, get: function () {return _directive.generateOptionsSdl;} });Object.defineProperty(exports, "generateSpectaqlSdl", { enumerable: true, get: function () {return _directive.generateSpectaqlSdl;} });exports.introspectionOptionsToMicrofiberOptions = introspectionOptionsToMicrofiberOptions;exports.loadData = void 0;Object.defineProperty(exports, "parseCliOptions", { enumerable: true, get: function () {return _cli.default;} });exports.resolveOptions = resolveOptions;exports.run = void 0;var _path = _interopRequireDefault(require("path"));
var _lodash = _interopRequireDefault(require("lodash"));
var _grunt = _interopRequireDefault(require("grunt"));

var _package = _interopRequireDefault(require("../package.json"));
var _loadYaml = _interopRequireDefault(require("./lib/loadYaml"));
var _utils = require("./spectaql/utils");









var _directive = require("./spectaql/directive");





var _cli = _interopRequireDefault(require("./cli"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}

const defaultAppDir = (0, _utils.normalizePathFromRoot)('dist');
let spectaql = require(_path.default.resolve(defaultAppDir, 'spectaql/index'));
let gruntConfigFn;






const DEFAULT_THEM_NAME = 'default';
const defaultThemeDir = (0, _utils.normalizePathFromRoot)('dist/themes/default');

const BASIC_THEME_NAME = 'basic';
const basicThemeDir = (0, _utils.normalizePathFromRoot)('dist/themes/basic');

const SPECTAQL_THEME_NAME = 'spectaql';
const spectaqlThemeDir = (0, _utils.normalizePathFromRoot)('dist/themes/spectaql');





const defaults = Object.freeze({
  quiet: false,
  port: 4400,
  portLive: 4401,
  targetDir: _path.default.resolve(process.cwd(), 'public'),
  targetFile: 'index.html',
  appDir: defaultAppDir,
  gruntConfigFile: (0, _utils.normalizePathFromRoot)('dist/lib/gruntConfig.js'),
  themeDir: defaultThemeDir,
  defaultThemeDir,
  cacheDir: (0, _utils.tmpFolder)(),
  specData: {}
});



const spectaqlOptionDefaults = Object.freeze({
  oneFile: false,
  embeddable: false,
  errorOnInterpolationReferenceNotFound: true,
  displayAllServers: false,
  resolveWithOutput: true,
  embedLogo: false,
  embedFavicon: false
});

const spectaqlDirectiveDefault = Object.freeze({
  enable: true,
  directiveName: 'spectaql',
  optionsTypeName: 'SpectaQLOption',
  onlyAddIfMissing: true
});

const introspectionOptionDefaults = Object.freeze({
  dynamicExamplesProcessingModule: false,

  spectaqlDirective: Object.assign({}, spectaqlDirectiveDefault),

  removeTrailingPeriodFromDescriptions: false,


  inputValueDeprecation: false,

  fieldExpansionDepth: 1,

  metadatasReadPath: 'documentation',
  metadatasWritePath: 'documentation',

  metadatasPath: 'documentation',
  metadatas: true,

  queriesDocumentedDefault: true,
  queryDocumentedDefault: true,
  queryArgDocumentedDefault: true,

  hideQueriesWithUndocumentedReturnType: true,

  mutationsDocumentedDefault: true,
  mutationDocumentedDefault: true,
  mutationArgDocumentedDefault: true,

  hideMutationsWithUndocumentedReturnType: true,

  subscriptionsDocumentedDefault: true,
  subscriptionDocumentedDefault: true,
  subscriptionArgDocumentedDefault: true,

  hideSubscriptionsWithUndocumentedReturnType: true,

  hideUnusedTypes: true,

  objectsDocumentedDefault: true,
  objectDocumentedDefault: true,

  inputsDocumentedDefault: true,
  inputDocumentedDefault: true,

  enumsDocumentedDefault: true,
  enumDocumentedDefault: true,

  unionsDocumentedDefault: true,
  unionDocumentedDefault: true,
  hideUnionTypesOfUndocumentedType: true,

  fieldDocumentedDefault: true,
  hideFieldsOfUndocumentedType: true,

  inputFieldDocumentedDefault: true,
  hideInputFieldsOfUndocumentedType: true,

  argDocumentedDefault: true,
  hideArgsOfUndocumentedType: true
});

const extensionsOptionDefaults = Object.freeze({
  graphqlScalarExamples: true
});


const introspectionOptionsMap = Object.freeze({
  schemaFile: 'schemaFile',
  introspectionUrl: 'url',
  introspectionFile: 'introspectionFile',
  introspectionMetadataFile: 'metadataFile',
  dynamicExamplesProcessingModule: 'dynamicExamplesProcessingModule',
  headers: 'headers'
});


const introspectionOptionsToNormalize = Object.values(
  introspectionOptionsMap
).filter((key) => !['url', 'headers'].includes(key));

function resolvePaths(
options,
keys = [
'targetDir',
'appDir',
'logoFile',
'faviconFile',
'specFile',
'gruntConfigFile'])



{
  keys.forEach((key) => {
    const pth = options[key];
    if (typeof pth === 'string') {
      options[key] = (0, _utils.normalizePathFromCwd)(pth);
    }
  });
}

function introspectionOptionsToMicrofiberOptions(introspectionOptions) {
  const {
    hideUnusedTypes: removeUnusedTypes,
    hideFieldsOfUndocumentedType: removeFieldsWithMissingTypes,
    hideArgsOfUndocumentedType: removeArgsWithMissingTypes,
    hideInputFieldsOfUndocumentedType: removeInputFieldsWithMissingTypes,
    hideUnionTypesOfUndocumentedType: removePossibleTypesOfMissingTypes,

    hideQueriesWithUndocumentedReturnType: removeQueriesWithMissingTypes,

    hideMutationsWithUndocumentedReturnType: removeMutationsWithMissingTypes,

    hideSubscriptionsWithUndocumentedReturnType:
    removeSubscriptionsWithMissingTypes
  } = Object.assign({}, introspectionOptionDefaults, introspectionOptions);

  return {
    removeUnusedTypes,
    removeFieldsWithMissingTypes,
    removeArgsWithMissingTypes,
    removeInputFieldsWithMissingTypes,
    removePossibleTypesOfMissingTypes,

    removeQueriesWithMissingTypes,

    removeMutationsWithMissingTypes,

    removeSubscriptionsWithMissingTypes
  };
}

function resolveOptions(cliOptions) {

  let opts = _lodash.default.extend({}, cliOptions);

  resolvePaths(opts);

  const introspectionCliOptions = Object.entries(
    introspectionOptionsMap
  ).reduce((acc, [fromKey, toKey]) => {
    if (typeof opts[fromKey] !== 'undefined') {
      acc[toKey] = opts[fromKey];
    }

    return acc;
  }, {});

  if (opts.specFile) {

    const spec = opts.specData = (0, _loadYaml.default)(opts.specFile);

    const {
      spectaql: spectaqlYaml

    } = spec;

    if (spectaqlYaml) {

      opts = _lodash.default.defaults({}, opts, spectaqlYaml);
    }
  }

  if (!opts.themeDir || opts.themeDir === DEFAULT_THEM_NAME) {
    opts.themeDir = defaultThemeDir;
  } else if (opts.themeDir === BASIC_THEME_NAME) {
    opts.themeDir = basicThemeDir;
  } else if (opts.themeDir === SPECTAQL_THEME_NAME) {
    opts.themeDir = spectaqlThemeDir;
  } else {
    opts.themeDir = (0, _utils.normalizePathFromCwd)(opts.themeDir);
  }


  opts = _lodash.default.defaults({}, opts, defaults);


  resolvePaths(opts);


  opts.specData.introspection = _lodash.default.defaults(
    {},
    introspectionCliOptions,
    opts.specData.introspection,
    introspectionOptionDefaults
  );


  opts.specData.introspection.microfiberOptions =
  introspectionOptionsToMicrofiberOptions(opts.specData.introspection);

  opts.specData.introspection.spectaqlDirective = _lodash.default.defaults(
    opts.specData.introspection.spectaqlDirective,
    spectaqlDirectiveDefault
  );

  opts.specData.extensions = _lodash.default.defaults(
    {},
    opts.specData.extensions,
    extensionsOptionDefaults
  );


  resolvePaths(opts.specData.introspection, introspectionOptionsToNormalize);


  opts = _lodash.default.defaults({}, opts, spectaqlOptionDefaults);

  if (!opts.targetDir || opts.targetDir.endsWith('/null')) {
    opts.targetDir = (0, _utils.tmpFolder)();
  }

  if (opts.logoFile) {
    if (opts.embedLogo) {
      opts.logoData = (0, _utils.readFileAsBase64)(opts.logoFile);
    } else {

      opts.logoFileTargetName = opts.preserveLogoName ?
      _path.default.basename(opts.logoFile) :
      `logo${_path.default.extname(opts.logoFile)}`;
      opts.logoImageName = _path.default.basename(opts.logoFileTargetName);
    }
  } else if (opts.logoUrl) {

  }

  if (opts.faviconFile) {
    if (opts.embedFavicon) {
      opts.faviconData = (0, _utils.readFileAsBase64)(opts.faviconFile);
    } else {

      opts.faviconFileTargetName = opts.preserveFaviconName ?
      _path.default.basename(opts.faviconFile) :
      `favicon${_path.default.extname(opts.faviconFile)}`;
      opts.faviconImageName = _path.default.basename(opts.faviconFileTargetName);
    }
  } else if (opts.faviconUrl) {

  }


  const pathToSpectaql = _path.default.resolve(opts.appDir, 'spectaql/index');
  if (pathToSpectaql !== defaultAppDir) {
    spectaql = require(pathToSpectaql);
  }
  gruntConfigFn = require(opts.gruntConfigFile);

  return opts;
}




const run = async function (cliOptions = {}) {
  const opts = resolveOptions(cliOptions);




  const gruntConfig = gruntConfigFn(_grunt.default, opts, await loadData(opts));




  _grunt.default.initConfig(_lodash.default.merge({ pkg: _package.default }, gruntConfig));
  if (opts.quiet) {
    _grunt.default.log.writeln = function () {};
    _grunt.default.log.write = function () {};
    _grunt.default.log.header = function () {};
    _grunt.default.log.ok = function () {};
  }

  const cwd = process.cwd();
  const exists = _grunt.default.file.exists(
    _path.default.join(
      _path.default.resolve('node_modules'),
      'grunt-contrib-concat',
      'package.json'
    )
  );
  if (!exists) process.chdir(_utils.pathToRoot);

  _grunt.default.loadNpmTasks('grunt-contrib-concat');
  _grunt.default.loadNpmTasks('grunt-contrib-uglify');
  _grunt.default.loadNpmTasks('grunt-contrib-cssmin');
  _grunt.default.loadNpmTasks('grunt-contrib-watch');
  _grunt.default.loadNpmTasks('grunt-contrib-clean');
  _grunt.default.loadNpmTasks('grunt-contrib-copy');
  _grunt.default.loadNpmTasks('grunt-contrib-connect');
  _grunt.default.loadNpmTasks('grunt-sass');


  _grunt.default.loadTasks(
    (0, _utils.normalizePathFromRoot)('vendor/grunt-compile-handlebars/tasks')
  );
  _grunt.default.loadTasks((0, _utils.normalizePathFromRoot)('vendor/grunt-prettify/tasks'));
  _grunt.default.loadTasks((0, _utils.normalizePathFromRoot)('vendor/grunt-embed/tasks'));

  process.chdir(cwd);

  const pathToHtmlFile = opts.cacheDir + '/' + opts.targetFile;

  _grunt.default.registerTask(
    'predentation',
    'Remove indentation from generated <pre> tags.',
    function () {
      let html = (0, _utils.readTextFile)(pathToHtmlFile);
      html = html.replace(
        /<pre.*?><code.*?>([\s\S]*?)<\/code><\/pre>/gim,
        function (x, _y) {
          const lines = x.split('\n');
          let level = null;
          if (lines) {

            lines.forEach(function (line) {
              if (line[0] === '<') return;
              var wsp = line.search(/\S/);
              level =
              level === null || wsp < line.length && wsp < level ?
              wsp :
              level;
            });


            const regex = new RegExp('^\\s{' + level + '}');
            lines.forEach(function (line, index, lines) {
              lines[index] = line.replace(regex, '');
            });
          }
          return lines.join('\n');
        }
      );
      (0, _utils.writeTextFile)(pathToHtmlFile, html);
    }
  );

  const themeCopyTasks = ['copy:default-theme-to-cache'];

  if (opts.themeDir !== defaultThemeDir) {
    themeCopyTasks.push('copy:overlay-custom-theme-to-cache');
  }

  _grunt.default.registerTask('copy-theme-stuff', themeCopyTasks);

  _grunt.default.registerTask('clean-things', [
  'clean:css',
  'clean:js',
  'clean:html',
  'clean:views',
  'clean:helpers']
  );

  const stylesheetsTasks = [];
  if (!opts.disableCss) {
    stylesheetsTasks.push('sass:main', 'concat:css', 'cssmin:css');
  }
  _grunt.default.registerTask('stylesheets', stylesheetsTasks);

  _grunt.default.registerTask('javascripts', ['concat:js', 'uglify']);

  _grunt.default.registerTask('templates', [
  'compile-handlebars',
  'predentation',
  'prettify']
  );

  const defaultTasks = [];

  _grunt.default.registerTask('server', ['connect']);

  _grunt.default.registerTask('develop', ['server', 'watch']);


  _grunt.default.event.on('watch', async function () {
    try {
      _grunt.default.config.set(
        'compile-handlebars.compile.templateData',
        await loadData(opts)
      );
    } catch (e) {
      console.error(e);
      _grunt.default.fatal(e);
    }
  });


  const donePromise = new Promise(function (resolve, reject) {
    _grunt.default.task.options({
      error: function (e) {
        if (!opts.quiet) {
          console.warn('Task error:', e);
        }

        reject(e);
      },
      done: function () {
        if (!opts.quiet) {
          console.log('All tasks complete');
        }

        let result;
        if (opts.resolveWithOutput) {
          result = {
            html: (0, _utils.readTextFile)(pathToHtmlFile)



          };
        }
        resolve(result);
      }
    });
  });



  const copiesToTarget = ['html-to-target'];

  let doDevelop = false;
  if (opts.startServer) {
    defaultTasks.push('server');
  } else {
    defaultTasks.push('clean-things');
    defaultTasks.push('copy-theme-stuff');

    defaultTasks.push('stylesheets');


    if (!opts.oneFile) {
      copiesToTarget.unshift('css-to-target');
    }

    if (!opts.disableJs) {
      defaultTasks.push('javascripts');


      if (!opts.oneFile) {
        copiesToTarget.unshift('js-to-target');
      }
    }

    if (opts.logoFile && !opts.embedLogo) {
      copiesToTarget.unshift('logo-to-target');
    }

    if (opts.faviconFile && !opts.embedFavicon) {
      copiesToTarget.unshift('favicon-to-target');
    }

    defaultTasks.push('templates');



    if (opts.oneFile) {
      defaultTasks.push('embed');
    }

    copiesToTarget.forEach((flavor) => {
      defaultTasks.push(`copy:${flavor}`);
    });







    if (opts.developmentMode || opts.developmentModeLive) {
      doDevelop = true;
    }
  }

  _grunt.default.registerTask('default', defaultTasks);
  _grunt.default.task.run('default');

  if (doDevelop) {

    _grunt.default.task.run('develop');
  }

  _grunt.default.task.start();

  return donePromise;
};exports.run = run;

const loadData = function (options) {
  return spectaql(options);
};exports.loadData = loadData;

const buildSchemas = function (options) {
  const { buildSchemas } = spectaql;
  return buildSchemas(options);
};exports.buildSchemas = buildSchemas;

const augmentData = function (options) {
  const { augmentData } = spectaql;
  return augmentData(options);
};exports.augmentData = augmentData;