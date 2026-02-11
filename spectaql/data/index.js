/**
 *  Inspired from SpectaQL default theme data index file
 */

const { Microfiber: IntrospectionManipulator } = require('microfiber')
const fieldExpansionDepthConfig = require('../fieldExpansionDepthConfig')

// Client-side (executable) directive locations - https://spec.graphql.org/draft/#ExecutableDirectiveLocation
const clientSideLocations = new Set([
    'QUERY',
    'MUTATION',
    'FIELD',
    'FRAGMENT_DEFINITION',
    'FRAGMENT_SPREAD',
    'INLINE_FRAGMENT',
    'VARIABLE_DEFINITION'
])

function addCustomFieldExpansionDepthData(item, customDepth) {
    if (typeof customDepth === 'undefined') {
        return item
    }

    // Store the custom depth directly on the item to access it later
    item._customFieldExpansionDepth = customDepth

    return item
}

function isClientSideDirective(directive) {
    return directive.locations && directive.locations.some(location => clientSideLocations.has(location))
}

function filterClientSideLocations(locations) {
    return locations.filter(location => clientSideLocations.has(location))
}

module.exports = ({
    introspectionResponse,
    graphQLSchema: _graphQLSchema,
    allOptions,
    introspectionOptions,
}) => {
    const introspectionManipulator = new IntrospectionManipulator(
        introspectionResponse,
        introspectionOptions?.microfiberOptions
    )

    // Remove deprecated fields from all types
    const allTypes = introspectionManipulator.getAllTypes()
    allTypes.forEach(type => {
        if (type.fields) {
            type.fields.forEach(field => {
                if (field.isDeprecated) {
                    introspectionManipulator.removeField({
                        typeName: type.name,
                        fieldName: field.name
                    })
                }
            })
        }
        if (type.inputFields) {
            type.inputFields.forEach(field => {
                if (field.isDeprecated) {
                    introspectionManipulator.removeField({
                        typeName: type.name,
                        fieldName: field.name
                    })
                }
            })
        }
    })

    const queryType = introspectionManipulator.getQueryType()
    const mutationType = introspectionManipulator.getMutationType()

    const queryItems = queryType.fields.map((query) => {
        const customDepth = fieldExpansionDepthConfig.queries[query.name]
        return addCustomFieldExpansionDepthData({...query, isQuery: true}, customDepth)
    })

    const mutationItems = mutationType.fields.map((mutation) => {
        const customDepth = fieldExpansionDepthConfig.mutations[mutation.name]
        return addCustomFieldExpansionDepthData({...mutation, isMutation: true}, customDepth)
    })

    const otherTypes = introspectionManipulator.getAllTypes({
        includeQuery: false,
        includeMutation: false,
        includeSubscription: false,
    })
    const objectTypes = otherTypes.filter(type => type.kind === 'OBJECT')
    const inputObjectTypes = otherTypes.filter(type => type.kind === 'INPUT_OBJECT')
    const interfaceTypes = otherTypes.filter(type => type.kind === 'INTERFACE')
    const enumTypes = otherTypes.filter(type => type.kind === 'ENUM')
    const unionTypes = otherTypes.filter(type => type.kind === 'UNION')
    const scalarTypes = otherTypes.filter(type => type.kind === 'SCALAR')

    const directives = introspectionResponse.__schema.directives

    const originalIntrospection = allOptions.introspection || {}
    let currentProcessingItem = null

    // Use a Proxy to adjust fieldExpansionDepth dynamically when it's accessed
    allOptions.introspection = new Proxy(originalIntrospection, {
        get(target, prop) {
            if (prop === 'fieldExpansionDepth' && currentProcessingItem && typeof currentProcessingItem._customFieldExpansionDepth !== 'undefined') {
                return currentProcessingItem._customFieldExpansionDepth
            }

            return target[prop]
        }
    })

    const addCustomFieldExpansionDepthHandler = (items) => {
        return items.map(item => {
            if (typeof item._customFieldExpansionDepth === 'undefined') {
                return item
            }

            // Use a Proxy to detect when this item is being processed
            return new Proxy(item, {
                get(target, prop) {
                    // When 'isQuery' or 'isMutation' is accessed, we know this item is being processed
                    if (prop === 'isQuery' || prop === 'isMutation') {
                        currentProcessingItem = target
                    }

                    return target[prop]
                }
            })
        })
    }

    return [
        {
            name: 'Operations',
            hideInContent: true,
            items: [
                {
                    name: 'Queries',
                    makeNavSection: true,
                    makeContentSection: true,
                    items: addCustomFieldExpansionDepthHandler(queryItems),
                },
                {
                    name: 'Mutations',
                    makeNavSection: true,
                    makeContentSection: true,
                    items: addCustomFieldExpansionDepthHandler(mutationItems),
                }
            ],
        },
        {
            name: 'Types',
            hideInContent: true,
            items: [
                {
                    name: 'Objects',
                    makeNavSection: true,
                    makeContentSection: true,
                    items: objectTypes.map((type) => ({
                        ...type,
                        isType: true,
                    })),
                },
                {
                    name: 'Input objects',
                    makeNavSection: true,
                    makeContentSection: true,
                    items: inputObjectTypes.map((type) => ({
                        ...type,
                        isType: true,
                    })),
                },
                {
                    name: 'Interfaces',
                    makeNavSection: true,
                    makeContentSection: true,
                    items: interfaceTypes.map((type) => ({
                        ...type,
                        isType: true,
                    })),
                },
                {
                    name: 'Enums',
                    makeNavSection: true,
                    makeContentSection: true,
                    items: enumTypes.map((type) => ({
                        ...type,
                        isType: true,
                    })),
                },
                {
                    name: 'Unions',
                    makeNavSection: true,
                    makeContentSection: true,
                    items: unionTypes.map((type) => ({
                        ...type,
                        isType: true,
                    })),
                },
                {
                    name: 'Scalars',
                    makeNavSection: true,
                    makeContentSection: true,
                    items: scalarTypes.map((type) => ({
                        ...type,
                        isType: true,
                    })),
                },
            ].filter(group => group.items.length > 0),
        },
        {
            name: 'Directives',
            makeContentSection: true,
            items:
                directives
                    .filter(isClientSideDirective)
                    .map((directive) => {
                        const clientLocations = filterClientSideLocations(directive.locations)
                        return {
                            ...directive,
                            isType: true,
                            kind: 'OBJECT',
                            fields: directive.args,
                            description: (directive.description || '') +
                                (clientLocations.length > 0 ?
                                    '\n\n**Locations:** ' + clientLocations.join(', ') : '')
                        }
                    }),
        }
    ].filter(Boolean)
}
