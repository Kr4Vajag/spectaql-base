/**
 * Configuration for customizing which arguments and fields will be hidden, and setting arguments examples custom values
 * in the Example sections of queries and mutations. This only affects the Example section (Query, Variables, Response).
 * The Arguments table and field definitions will still show all items.
 *
 * Format:
 * 'operationName': {
 *     excludeQueryFields: ['field1', 'field2', ...],    // Hide these fields from Query example
 *     excludeArguments: ['arg1', 'arg2', ...],               // Hide these args from Variables section
 *     overrideArguments: { arg1: value, ... },               // Override example values for specific args in Variables section
 *     excludeResponseFields: ['field1', 'field2', ...], // Hide these fields from Response example
 * }
 *
 * Example:
 * room_stays: {
 *     excludeQueryFields: ['first_guest', 'maidNotes', 'totalCount'],
 *     excludeArguments: ['last', 'before'],
 *     overrideArguments: { first: 15 },
 *     excludeResponseFields: ['totalCount'],
 * }
 */
module.exports = {};
