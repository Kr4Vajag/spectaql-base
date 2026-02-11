"use strict";

module.exports = (...values) => {

  const options = values.pop();

  return values.find((value) => value) || values[0];
};