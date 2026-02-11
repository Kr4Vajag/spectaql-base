"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = loadYaml;var _fs = _interopRequireDefault(require("fs"));
var _jsYaml = _interopRequireDefault(require("js-yaml"));

var _interpolation = require("./interpolation");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}

function loadYaml(path) {
  const fileContent = _fs.default.readFileSync(path, 'utf8');
  const loadedYaml = _jsYaml.default.load(fileContent);
  return (0, _interpolation.substituteEnvOnObject)(loadedYaml);
}