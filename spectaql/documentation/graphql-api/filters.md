Fields with a `filter` argument allow, as the name implies, filtering the result-set items.

### Operator reference

Some fields may support only a subset of operators.

| Operator | Description  | Example |
| --- | --- | --- |
| `lt` |  Larger than | `reservation_from: {lt: "2022-02-18"}` |
| `le`  | Larger or equal  | `reservation_from: {le: "2022-02-18"}` |
|  `eq` | Equal | `reservation_from: {eq: "2022-02-18"}` |
| `in`  | Equals to any of the values | `reservation_from: {in: ["2022-02-18", "2022-02-20"]}` |
|  `ge` | Greater or equal  | `reservation_from: {ge: "2022-02-18"}` |
| `gt` | Greater than | `reservation_from: {gt: "2022-02-18"}` |

#### Logical Operators

In addition to comparisons, the following logical operators are also supported:


| Operator | Description | Example |
| --- | --- | --- |
| not | Negates nested criteria | `not: {reservation_from: {eq: "2022-02-18"}}`  |
| or | At least one of the nested criteria must match |  `or: [{reservation_from: {eq: "2022-02-18"}}}, {reservation_from: {eq: "2022-02-25"}}}]` |

### Examples

In these example we'll be using root `room_stays` field:

```
room_stays(filter: RoomStayFilter): RoomStayConnection!
```

#### Filter one field

```graphql
{
    room_stays(
        filter: {
            id: { in: ["nQZA3P1U1", "J0lZ3H4Ml"] }
        }
    ) {
        ...
    }
}
```

Here we look up specific `RoomStay` items by `id`

#### Filter multiple fields

When multiple fields are used, they all must match.

```graphql
{
    room_stays(
        filter: {
            reservation_from: { lt: "2022-02-28" }
            reservation_to: { ge: "2022-02-18" }
        }
    ) {
        ...
    }
}
```

Here we look up `RoomStay` items that are staying between Feb 18th and Feb 28th.

#### Filter using multiple operators

Filters are not limited to using just one operator - any subset of the allowed operators can be used at the same time.

```graphql
{
    room_stays(
        filter: {
            reservation_from: {
                le: "2022-02-27"
                ge: "2022-02-21"                
            }
        }
    ) {
        ...
    }
}
```

Here we look up `RoomStay` items that arrived between Feb 21st and Feb 27th.

#### Negation

Negation is done by using the reserved `not` field.

```graphql
{
    room_stays(
        filter: {
            reservation_from: { gt: "2022-02-18" }
            not: {
                reservationStatus: { eq: CANCELLED }
            }
        }
    ) {
        ...
    }
}
```
Here we find all `RoomStay` with arrival after Feb 18th that have *not* been cancelled.

#### Disjunction

Logical Disjunction can be done by using the reserved `or` field:


```graphql
{
    room_stays(
        filter: {
            or: [
                {reservation_from: { eq: "2022-02-04" }},
                {reservation_from: { eq: "2022-02-11" }},
                {reservation_from: { eq: "2022-02-18" }},
                {reservation_from: { eq: "2022-02-25" }},
            ]
        }
    ) {
        ...
    }
}
```

Here we find all `RoomStay` items that arrive on any friday in February 2022
