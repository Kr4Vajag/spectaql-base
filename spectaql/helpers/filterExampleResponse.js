/**
 * Filter the response JSON example to hide specified fields.
 */
const exampleConfig = require('../exampleConfig');

function filterFields(object, excludeFields) {
    if (Array.isArray(object)) {
        return object.map(item => filterFields(item, excludeFields));
    }

    const filtered = {};
    for (const key of Object.keys(object)) {
        if (excludeFields.includes(key)) {
            continue;
        }

        const value = object[key];
        if (value && typeof value === 'object') {
            filtered[key] = filterFields(value, excludeFields);
        } else {
            filtered[key] = value;
        }
    }

    return filtered;
}

module.exports = function filterExampleResponse(responseData, operationName) {
    const config = exampleConfig[operationName];
    if (!config || !config.excludeResponseFields || config.excludeResponseFields.length === 0) {
        return responseData;
    }

    return filterFields(responseData, config.excludeResponseFields);
};

