/**
 * Filter the variables JSON example to hide specified arguments or override values.
 */
const exampleConfig = require('../exampleConfig');

module.exports = function filterExampleVariables(variables, operationName) {
    const config = exampleConfig[operationName];
    if (!config) {
        return variables;
    }

    const excludeArguments = config.excludeArguments || [];
    const overrideArguments = config.overrideArguments || {};
    const filteredVariables = {};

    for (const key of Object.keys(variables)) {
        if (!excludeArguments.includes(key)) {
            if (Object.prototype.hasOwnProperty.call(overrideArguments, key)) {
                filteredVariables[key] = overrideArguments[key];
            } else {
                filteredVariables[key] = variables[key];
            }
        }
    }

    return filteredVariables;
};


