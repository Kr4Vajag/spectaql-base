"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _get = _interopRequireDefault(require("lodash/get"));
var _sortBy = _interopRequireDefault(require("lodash/sortBy"));
var _microfiber = require("microfiber");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}var _default =

({
  introspectionResponse,
  graphQLSchema: _graphQLSchema,
  allOptions: _allOptions,
  introspectionOptions
}) => {
  const introspectionManipulator = new _microfiber.Microfiber(
    introspectionResponse,
    introspectionOptions === null || introspectionOptions === void 0 ? void 0 : introspectionOptions.microfiberOptions
  );
  const queryType = introspectionManipulator.getQueryType();
  const mutationType = introspectionManipulator.getMutationType();
  const subscriptionType = introspectionManipulator.getSubscriptionType();
  const otherTypes = introspectionManipulator.getAllTypes({
    includeQuery: false,
    includeMutation: false,
    includeSubscription: false
  });

  const hasQueries = (0, _get.default)(queryType, 'fields.length');
  const hasMutations = (0, _get.default)(mutationType, 'fields.length');
  const hasQueriesOrMutations = hasQueries || hasMutations;
  const hasSubscriptions = (0, _get.default)(subscriptionType, 'fields.length');
  const hasOtherTypes = (0, _get.default)(otherTypes, 'length');

  return [
  hasQueriesOrMutations ?
  {
    name: 'Operations',
    hideInContent: true,
    items: [
    hasQueries ?
    {
      name: 'Queries',
      makeNavSection: true,
      makeContentSection: true,
      items: (0, _sortBy.default)(
        queryType.fields.map((query) => ({
          ...query,
          isQuery: true
        })),
        'name'
      )
    } :
    null,
    hasMutations ?
    {
      name: 'Mutations',
      makeNavSection: true,
      makeContentSection: true,
      items: (0, _sortBy.default)(
        mutationType.fields.map((query) => ({
          ...query,
          isMutation: true
        })),
        'name'
      )
    } :
    null,
    hasSubscriptions ?
    {
      name: 'Subscriptions',
      makeNavSection: true,
      makeContentSection: true,
      items: (0, _sortBy.default)(
        subscriptionType.fields.map((type) => ({
          ...type,
          isSubscription: true
        })),
        'name'
      )
    } :
    null]

  } :
  null,
  hasOtherTypes ?
  {
    name: 'Types',
    makeContentSection: true,
    items: (0, _sortBy.default)(
      otherTypes.map((type) => ({
        ...type,
        isType: true
      })),
      'name'
    )
  } :
  null].
  filter(Boolean);
};exports.default = _default;