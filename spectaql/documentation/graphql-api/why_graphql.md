### Advantages of GraphQL

Here are several advantages of GraphQL protocol relevant to API clients integrating with a GraphQL endpoint.

###### 1.  Speed

GraphQL is faster than other communication APIs because it facilitates you to cut down your request query by choosing only the specific fields you want to query.

###### 2. No over-fetching and under-fetching problems

The main advantage of GraphQl over REST is that REST responses contain too much data or sometimes not enough data, which creates the need for another request. GraphQL solves this problem by fetching only the exact and specific data in a single request.

###### 3. Hierarchical Structure

GraphQL follows a hierarchical structure where relationships between objects are defined in a graphical structure. Here, every object type represents a component, and every related field from an object type to another object type represents a component wrapping another component.

###### 4. Defines a data shape

When we request GraphQL queries to the server, the server returns the response in a simple, secure, and predictable shape. So, it facilitates you to write a specific query according to your requirement. This makes GraphQL really easy to learn and use.

### Examples

Let's say, you want to get `room stays` with `arrival`, `departure` dates, and a list of arriving guest names

#### GraphQL

$$generic

=== "Request"
With GraphQL there would be just one request and it would look like this:

    ```graphql
    query ArrivingPrimaryGuests($date: Date!) {
      room_stays(
        filter: { reservation_from: { gt: $date } }
      ) {
        edges {
          node {
            id
            arrival: reservation_from
            departure: reservation_to
            first_guest {
              firstname
              lastname
            }
          }
        }
      }
    }
    ```

=== "Response"
In response you would get a structured resultset with the information you requested only:

    ```js
    {
      "data": {
        "room_stays": {
          "edges": [
            {
              "node": {
                "id": 1,
                "arrival": "2022-02-21",
                "departure": "2022-02-28",
                "first_guest": {
                  "firstname": "Matt",
                  "lastname": "Luis"
                }
              }
            },
            {
              "node": {
                "id": 2,
                "arrival": "2022-02-22",
                "departure": "2022-02-26",
                "guests": {
                  "firstname": "Linda",
                  "lastname": "Webber"
                }
              }
            }
          ]
        }
      }
    }
    ```
$$
