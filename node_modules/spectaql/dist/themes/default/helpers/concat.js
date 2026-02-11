"use strict";var _stripTrailing = _interopRequireDefault(require("./stripTrailing"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}











module.exports = function (...strings) {
  let joiner = '';
  let filterFalsy = false;
  let fixDoublePeriods = true;
  let altJoiner;
  let altJoinerRegex;

  if (typeof strings[strings.length - 1] === 'object') {
    const options = strings.pop();
    joiner = options.hash.joiner || joiner;
    filterFalsy = options.hash.filterFalsy === true;
    altJoiner = options.hash.altJoiner;
    altJoinerRegex = options.hash.altJoinerRegex;
  }

  if (filterFalsy) {
    strings = strings.filter((s) => s);
  }

  if (!strings.length) {
    return '';
  }

  if (typeof altJoiner !== 'undefined' && altJoinerRegex) {
    altJoinerRegex = new RegExp(`${altJoinerRegex}$`);
    let lastString = strings.shift();
    let result = lastString;
    for (const string of strings) {
      if (altJoinerRegex.test(lastString)) {
        result = result + altJoiner + string;
      } else {
        result = result + joiner + string;
      }
      lastString = string;
    }

    return result;
  }




  if (fixDoublePeriods && joiner.startsWith('.') && strings.length > 1) {
    strings = strings.map((string, idx, strings) =>
    idx === strings.length - 1 ? string : (0, _stripTrailing.default)(string, '.', {})
    );
  }

  return strings.join(joiner);
};