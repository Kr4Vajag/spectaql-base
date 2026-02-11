"use strict";module.exports = (...values) => {

  const _options = values.pop();
  return values.length && values.every((value) => value);
};