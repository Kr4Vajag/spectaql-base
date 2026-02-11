/**
 * Prefix heading IDs in HTML content.
 *
 * Examples:
 *   prefixHeadingIds('<h4 id="disjunction">Disjunction</h4>', 'GraphQL API', 'Filters')
 *   -> '<h4 id="graphql-api-filters-disjunction">Disjunction</h4>'
 */
const slugify = require('./slugify');

module.exports = function (htmlContent, ...prefixes) {
    // Convert SafeString or any object with toString to string
    if (htmlContent && typeof htmlContent === 'object' && typeof htmlContent.toString === 'function') {
        htmlContent = htmlContent.toString();
    }

    if (!htmlContent || typeof htmlContent !== 'string') {
        return htmlContent;
    }

    // Remove the last argument which is the Handlebars options object
    prefixes.pop();

    const prefixParts = prefixes.map(part => slugify(part));
    const prefixString = prefixParts.join('-');

    const headingIdPattern = /<(h[1-6])([^>]*)\sid=["']([^"']+)["']([^>]*)>/gi;

    return htmlContent.replace(headingIdPattern, (match, tag, beforeId, existingId, afterId) => {
        const newId = `${prefixString}-${existingId}`;
        return `<${tag}${beforeId} id="${newId}"${afterId}>`;
    });
};

