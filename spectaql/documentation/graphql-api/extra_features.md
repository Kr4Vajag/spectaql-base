### Query Fragments

You can encapsulate common data structures in `Fragments` and reuse them.

#### Without Fragments

In the following example, you will immediately notice that the data structure of `guests` and `first_guest` are identical due to the fact they both return objects of type `Person`. Scroll to the [With Fragments](#graphql-api-extra-features-with-fragments) section to see how this can be optimized.

```graphql
query RoomStays {
  room_stays(filter: { date: "2022-10-27" }, first: 2) {
    edges {
      node {
        id
        room_setup {
          name
        }
        guests {
          clientTitle {
            name
          }
          firstname
          lastname
          language
          email
          telephone
          mobile
          carPlateNumber
        }
        first_guest {
          clientTitle {
            name
          }
          firstname
          lastname
          language
          email
          telephone
          mobile
          carPlateNumber
        }
      }
    }
  }
}
```

#### With Fragments

The previously redundant `guests` and `first_guest` data structure blocks now have been encapsulated in a reusable Fragment called `Guest`, so instead of repeating the complete list of attributes, it is enough to reuse the fragment by specifying it as `...Guest`

```graphql
query RoomStays {
  room_stays(filter: { date: "2022-10-27" }, first: 2) {
    edges {
      node {
        id
        room_setup {
          name
        }
        guests {
          ...Guest
        }
        first_guest {
          ...Guest
        }
      }
    }
  }
}

fragment Guest on Person {
  clientTitle {
    name
  }
  firstname
  lastname
  language
  email
  telephone
  mobile
  carPlateNumber
}
```

### Query variables

#### A query without variables

In the following example, you will notice that a static value `"2022-02-18"` is provided for the `date` attribute:

```graphql
query RoomStays {
    room_stays(
        filter: {
            date: "2022-02-18"
        }
    ) {
        edges {
            cursor
            node {
                id
                reservation {
                    code
                }
                room_setup {
                    expectedCleaningStatus(date: "2022-02-18")
                }
            }
        }
    }
}
```

#### A query with variables

This example demonstrates how the previously static value can be turned into a `$date` variable:
```graphql
query RoomStays($date: Date!) {
    room_stays(
        filter: {
            date: $date
        }
    ) {
        edges {
            cursor
            node {
                id
                reservation {
                    code
                }
                room_setup {
                    expectedCleaningStatus(date: $date)
                }
            }
        }
    }
}
```

Now you can pass the value via `$date` variable and reuse it in the query if necessary.

### Multiple queries within one request

#### Using aliases

You can perform multiple queries within one request using GrapQL aliases. In the following example, we will call `performanceStatistics` query twice but with different `input arguments` which very much makes sense if you want to get data for `today` and `tomorrow`, for example

==Variables==
```json
{
    "today": "2022-03-01",
    "tomorrow": "2022-03-02"
}
```

==Query==
```graphql
query PerformanceStatistics($today: Date!, $tomorrow: Date!) {
  today: performanceStatistics(filter: { date: $today }) {
    ...PerformanceStatistics
  }
  tomorrow: performanceStatistics(filter: { date: $tomorrow }) {
    ...PerformanceStatistics
  }
}

fragment PerformanceStatistics on PerformanceStatistics {
  occupancy
  adr
  revPAR
}
```

#### Using batches

You can execute multiple GraphQL queries within one GraphQL request, like this:

==Query==
```json
[
    {
        "query":"query PerformanceStatistics($date: Date!) { performanceStatistics(filter: { date: $date }) { occupancy } }",
        "variables": {
            "date": "2022-02-28"
        }
    }, 
    {
        "query":"query PerformanceStatistics($date: Date!) { performanceStatistics(filter: { date: $date }) { occupancy } }",
        "variables": {
            "date": "2022-02-27"
        }
    }
]
```

### Chained Operations

The `@chain(variable: [const]String!)` directive enables passing data from one operation to the next, when sending batch operations. In the subsequent operation, the value is provided as a variable with the name specified in the directive.

This helps in cases, when a mutation depends on data returned by a previous mutation - using a `@chain` directive both mutations can be sent in one request instead of two

==Example==

An example, to create a guest and immediately reference it in the next mutation to add it to a room:

```http
POST https://www.3rpms.de/graphql
Content-Type: application/json
Authorization: <your api token>

[
  {
    "query": "mutation CreateGuest($createGuest: CreatePersonInput!) { createClient(input: {person: $createGuest}) { client { id @chain(variable:\"clientId\") } } }",
    "variables": {
      "createGuest": {
        "lastname": "Přemyslid",
        "country": "de",
        "language": "de"
      }
    }
  },
  {
    "query": "mutation AddGuestToRoom($roomStayId:ID! $clientId:ID!) { addRoomStayGuest(input:{roomStayId:$roomStayId clientId:$clientId}) { roomStay { guests { id } } } }",
    "variables": {
      "roomStayId": "<room id>"
    }
  }
]
```

Notice how the 2nd mutation `AddGuestToRoom` uses a variable `$clientId` that it does not provide - the variable comes from the previous mutation.  However, if there were more operations, `$clientId` variable would not be available in the 3rd (or subsequent) operations - `@chain` directive provides variables only for the one subsequent operation.

According to GraphQL specification, queries and mutation selections can be executed in any order. To avoid determinism issues, there's the following restrictions on using `@chain`:

* `@chain` cannot be used on a field that is a descendant of a list `[Type]`.
* Same variable name cannot be declared more than once.

In addition, to reduce accidental variable overwriting, there's also the following restrictions:

* `@chain` variable is not allowed to override a variable already sent in the request
