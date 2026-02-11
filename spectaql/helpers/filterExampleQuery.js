/**
 * Filter the GraphQL query example to hide specified arguments and fields
 * and to set custom values to arguments in a Variables section.
 */
const exampleConfig = require('../exampleConfig');

/**
 * @param {string} queryString - The GraphQL query string
 * @param {string[]} excludeFields - Array of field names to exclude
 * @returns {string} - Filtered query string
 */
function filterQueryFields(queryString, excludeFields) {
    if (!excludeFields || excludeFields.length === 0) {
        return queryString;
    }

    const lines = queryString.split('\n');
    const filteredLines = [];
    let skipUntilClosingBrace = 0;

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const trimmedLine = line.trim();

        // Skips all nested fields for excluded fields
        if (skipUntilClosingBrace > 0) {
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;
            skipUntilClosingBrace += openBraces - closeBraces;
            continue;
        }

        const fieldMatch = trimmedLine.match(/^(\w+)(\s|{|$)/);
        if (fieldMatch) {
            const fieldName = fieldMatch[1];

            if (excludeFields.includes(fieldName)) {
                // Check if there are nested fields (which would get skipped)
                if (trimmedLine.includes('{')) {
                    const openBraces = (line.match(/{/g) || []).length;
                    const closeBraces = (line.match(/}/g) || []).length;
                    skipUntilClosingBrace = openBraces - closeBraces;
                }

                continue;
            }
        }

        filteredLines.push(line);
    }

    return filteredLines.join('\n');
}

module.exports = function filterExampleQuery(queryString, operationName) {
    const config = exampleConfig[operationName];
    if (!config) {
        return queryString;
    }

    let filteredQuery = queryString;

    const excludeArguments = config.excludeArguments;
    if (excludeArguments && excludeArguments.length > 0) {
        // Filter variable definitions in the query signature
        // Match: query OperationName($var1: Type, $var2: Type) {
        const signatureRegex = /^(\s*(?:query|mutation)\s+\w+\s*)\(([^)]*)\)/m;
        filteredQuery = filteredQuery.replace(signatureRegex, (match, prefix, argumentsString) => {
            const argumentsParts = argumentsString.split(',').map(argument => argument.trim()).filter(Boolean);
            const filteredArgs = argumentsParts.filter(argumentPart => {
                const variableNameMatch = argumentPart.match(/^\$(\w+)/);

                if (variableNameMatch) {
                    return !excludeArguments.includes(variableNameMatch[1]);
                }

                return true;
            });

            if (filteredArgs.length === 0) {
                return prefix;
            }

            return `${prefix}(\n  ${filteredArgs.join(',\n  ')}\n)`;
        });

        // Filter argument usage in the operation body
        // Match: operationName(arg1: $var1, arg2: $var2) {
        const bodyArgsRegex = new RegExp(`(${operationName}\\s*)\\(([^)]+)\\)`, 'g');
        filteredQuery = filteredQuery.replace(bodyArgsRegex, (match, prefix, argumentsString) => {
            const argumentsParts = argumentsString.split(',').map(argument => argument.trim()).filter(Boolean);
            const filteredArgs = argumentsParts.filter(argumentPart => {
                const variableNameMatch = argumentPart.match(/^(\w+):/);

                if (variableNameMatch) {
                    return !excludeArguments.includes(variableNameMatch[1]);
                }

                return true;
            });

            if (filteredArgs.length === 0) {
                return prefix;
            }

            return `${prefix}(\n    ${filteredArgs.join(',\n    ')}\n  )`;
        });
    }

    const excludeQueryFields = config.excludeQueryFields;
    if (excludeQueryFields && excludeQueryFields.length > 0) {
        filteredQuery = filterQueryFields(filteredQuery, excludeQueryFields);
    }

    return filteredQuery;
};



