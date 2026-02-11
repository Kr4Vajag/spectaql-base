"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.TMP_PREFIX = void 0;exports.absoluteURL = absoluteURL;exports.camelCase = camelCase;exports.capitalize = capitalize;exports.capitalizeFirstLetter = capitalizeFirstLetter;exports.dynamicImport = dynamicImport;exports.fileExists = fileExists;exports.fileExtensionIs = fileExtensionIs;exports.fileToObject = fileToObject;exports.firstNonUndef = firstNonUndef;exports.isUndef = isUndef;exports.join = join;exports.lowerCase = lowerCase;exports.normalizePathFromCwd = normalizePathFromCwd;exports.normalizePathFromRoot = normalizePathFromRoot;exports.pathToRoot = void 0;exports.readFileAsBase64 = readFileAsBase64;exports.readJSFile = readJSFile;exports.readJSONFile = readJSONFile;exports.readTextFile = readTextFile;exports.relative = relative;exports.snakeCase = snakeCase;exports.takeDefaultExport = takeDefaultExport;exports.tmpFolder = tmpFolder;exports.upperCase = upperCase;exports.urlBasename = urlBasename;exports.writeTextFile = writeTextFile;var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _lodash = _interopRequireDefault(require("lodash"));
var _tmp = _interopRequireDefault(require("tmp"));
var _json = _interopRequireDefault(require("json5"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}


_tmp.default.setGracefulCleanup();

const cwd = process.cwd();


const numDirsToRoot = 2;

const pathToRoot = exports.pathToRoot = _path.default.resolve(__dirname, '../'.repeat(numDirsToRoot));

const TMP_PREFIX = exports.TMP_PREFIX = 'spectaqltmp-';

function tmpFolder(options = {}) {
  const { unsafeCleanup = true, prefix = TMP_PREFIX } = options;

  return _tmp.default.dirSync({
    unsafeCleanup,
    prefix
  }).name;
}

function takeDefaultExport(mojule) {
  return mojule !== null && mojule !== void 0 && mojule.default ? mojule.default : mojule;
}

async function dynamicImport(path) {var _mojule$default, _mojule$default2, _mojule$moduleExport;
  const mojule = await import(path);


  if (
  mojule.__esModule === true && (_mojule$default =
  mojule.default) !== null && _mojule$default !== void 0 && _mojule$default.default &&
  Object.keys(mojule).length === 2)
  {
    return mojule.default;
  }





  if (
  mojule.__esModule === true && (_mojule$default2 =
  mojule.default) !== null && _mojule$default2 !== void 0 && _mojule$default2.default && (_mojule$moduleExport =
  mojule['module.exports']) !== null && _mojule$moduleExport !== void 0 && _mojule$moduleExport.default)
  {
    return mojule.default;
  }
  return mojule;
}

function normalizePathFn(pth, { start = cwd } = {}) {
  if (!_path.default.isAbsolute(pth)) {
    pth = _path.default.join(start, pth);
  }

  return _path.default.normalize(pth);
}

function normalizePathFromRoot(pth) {
  return normalizePathFn(pth, { start: pathToRoot });
}

function normalizePathFromCwd(pth) {
  return normalizePathFn(pth, { start: cwd });
}

function fileExists(pth, { normalizePath = true } = {}) {
  if (normalizePath) {
    pth = normalizePathFromCwd(pth);
  }
  return _fs.default.existsSync(pth);
}

function readTextFile(pth, options = {}) {
  let { normalizePath = true, ...optionsForReadFileSync } = options;

  optionsForReadFileSync = {
    encoding: 'utf-8',
    ...optionsForReadFileSync
  };
  if (normalizePath) {
    pth = normalizePathFromCwd(pth);
  }

  return _fs.default.readFileSync(pth, optionsForReadFileSync);
}

function writeTextFile(pth, text, _options = {}) {
  return _fs.default.writeFileSync(pth, text);
}

function fileToObject(pathToFile, options = {}) {
  let { normalizePath = true, ...otherOptions } = options;
  if (normalizePath) {
    pathToFile = normalizePathFromCwd(pathToFile);
  }
  return _path.default.extname(pathToFile) === '.js' ?
  readJSFile(pathToFile, otherOptions) :
  readJSONFile(pathToFile, otherOptions);
}

function readJSONFile(pth, options = {}) {
  let { normalizePath = true, ...optionsForReadJSONParse } = options;
  if (normalizePath) {
    pth = normalizePathFromCwd(pth);
  }
  return _json.default.parse(readTextFile(pth, optionsForReadJSONParse));
}

function readJSFile(pth, { normalizePath = true } = {}) {
  if (normalizePath) {
    pth = normalizePathFromCwd(pth);
  }
  return require(pth);
}

function readFileAsBase64(pth, { normalizePath } = {}) {
  if (normalizePath) {
    pth = normalizePathFromCwd(pth);
  }
  return Buffer.from(_fs.default.readFileSync(pth)).toString('base64');
}

function fileExtensionIs(fileNameOrPath, extensionOrExtensions) {
  if (typeof fileNameOrPath !== 'string') {
    return false;
  }
  const ext = fileNameOrPath.split('.').pop();
  if (!Array.isArray(extensionOrExtensions)) {
    extensionOrExtensions = [extensionOrExtensions];
  }

  return extensionOrExtensions.some((supportExt) => supportExt === ext);
}










function absoluteURL(str) {

  return /^.*:\/\/[^/]+\/?/.test(str);
}






function urlBasename(url) {

  return /^(.*:\/\/[^/]+\/?)/.exec(url)[1];
}






function join(..._paths) {
  const args = [].concat.apply([], arguments);
  return args.slice(1).reduce(function (url, val) {
    if (absoluteURL(url) || absoluteURL(val)) {
      return require('url').resolve(url, val);
    }
    return _path.default.posix.join(url, val);
  }, args[0]);
}







function relative(from, to) {
  var localToRemote = !absoluteURL(from) && absoluteURL(to);
  var differentDomains =
  absoluteURL(from) &&
  absoluteURL(to) &&
  urlBasename(from) !== urlBasename(to);
  if (localToRemote || differentDomains) {
    return to;
  }
  return _path.default.posix.relative(from, to);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function capitalize(string) {
  return _lodash.default.capitalize(string);
}

function camelCase(string) {
  return _lodash.default.camelCase(string);
}

function snakeCase(string) {
  return _lodash.default.snakeCase(string);
}

function upperCase(string) {
  return string.toUpperCase();
}

function lowerCase(string) {
  return string.toLowerCase();
}

function isUndef(thing) {
  return typeof thing === 'undefined';
}

function firstNonUndef(array) {
  if (!Array.isArray(array)) {
    return;
  }
  return array.find((item) => !isUndef(item));
}