$$INFO
title: Specification
3RPMS implements relay-style connections for pagination. For detailed information see the [GraphQL Cursor Connections Specification
](https://relay.dev/graphql/connections.htm).
$$

GraphQL allows you to fetch only the fields you need, with no unnecessary overhead. This helps keep network responses small and fast.

However, GraphQL doesn't automatically guarantee small responses. This is especially apparent when a field contains a list. To avoid enormous response from a seemingly small query, lists, containing unbounded maximum amount of items, use pagination:

```graphql
query RoomStays($cursor: String = null) {
    reservations(first:10 after:$cursor) {
        edges {
            node {
                # reservation fields
            }
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}
```

Here, when no `$cursor` is provided, only the first 10 reservations are returned. To retrieve the next 10 reservations, the same query can be sent with `$cursor` set to value from `endCursor` field; and so on for the next 10 reservations. When there are no more results, `hasNextPage` will be set to `false`.

While the example uses reservations, it works the same for all connections.

The response to the previous example would look like this:

```json
{
  "data": {
    "reservations": {
      "edges": [
        {"node": {...}},
        {"node": {...}},
        ... 8 more results       
      ],
      "pageInfo": {
        "hasNextPage": true,
        "endCursor": "bWFkZSB5b3UgbG9vaw=="
      }
    }
  }
}
```

$$INFO
title: Best practice
Load only as many records you need. If you're using only the first result, then specify `first:1`; or any other value depending on how you use the result set.
$$

$$WARNING
title: Important
Cursors are opaque strings, and must be passed back to the server as-is. Cursors should be stored only long enough to query the next page, and should not be stored long-term. Cursors may be different for each query depending on provided arguments or other scenarios.
$$

### Defaults

When no cursor arguments are provided, by default `first:20` will be used, that is, only the first 20 items will be returned.

Unless otherwise specified on the field, maximum number of items a connection can return is 100.

### Backward pagination

In addition to previously described forward pagination, 3RPMS also supports backwards pagination using `last` and `before` arguments, and `startCursor` and `hasPreviousPage` fields.

```graphql
query RoomStays($cursor: String = null) {
    reservations(last:10 before:$cursor) {
        edges {
            node {
                # reservation fields
            }
        }
        pageInfo {
            hasPreviousPage
            startCursor
        }
    }
}
```

Here the last 10 reservations are returned. Similarly to before, to retrieve the previous 10 reservations, same query can be sent with `$cursor` set to value from `$startCursor`. When there are no previous reservations, `hasPreviousPage` will be `false`
