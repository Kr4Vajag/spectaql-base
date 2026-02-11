This guide explains how to read and update category-level rates and restrictions.
### Reading Rates and Restrictions
Rates and Restrictions are scoped to a category and a specific date. While category filter can be skipped, a date range for rates and restrictions is mandatory. Rates can be ready by using the `Category.defaultPrices` field, for example to read rates for all of July 2025:

```graphql
# Variables
# {
#   "dateRange": {
#     "start": "2025-07-01",
#     "end": "2025-07-31"
#   }
# }
query RatesAndRestrictions($dateRange:DateRangeInput!) {
  settings {
    categories {
      edges {
        node {
          ...MyCategoryData
        }
      }
    }
  }
}

fragment MyCategoryData on Category {
  id
  defaultPrices(filter:{date:$dateRange} first:31) {
    edges {
      node {
        date
        amount
      }
    }
  }
}
```

Similarly, restrictions can be read by using `Category.restrictions` field:
```graphql
fragment MyCategoryData on Category {
  id
  restrictions(filter:{date:$dateRange} first:31) {
    edges {
      node {
        date
        stopSell
        minStay
        maxStay
        closedToArrival
        closedToDeparture
        guarantee
        cancellation
        breakfastIncluded
      }
    }
  }
}
```

$$INFO
title: Best Practice
`defaultPrices` and `restrictions` fields are `*Connection` types.  Like all `*Connection` types, they support cursor pagination and are limited to at most 100 results per page. However, as each date appears only once, its more convenient to **use multiple date ranges to read more data.** instead of cursor arguments.
$$


| Field | Description |
| --- | --- |
| `stopSell` | When active, category is not bookable |
| `minStay` | Minimum Length of Stay. Value is between `1` and `99` (inclusive) |
| `maxStay` | Maximum Length of Stay. `NULL` represents a no limit on maximum stay |
| `closedToArrival` | When active, arriving on this day is not allowed |
| `closedToDeparture` | When active, departing on this day is not allowed |
| `guarantee` |When active, a guarantee is required  to stay on this date|
| `cancellation` | The amount of days whilst possible to cancel prior to arrival without penalties. `NULL` is non cancellable, `0` is a standard policy as defined in booking portals. |
| `breakfastIncluded` | Whether breakfast is included in price or not.  |

$$WARNING
title: Channel Manager Limitations
Not all restrictions are supported by all Channel Managers. Some hotels might chose to not use all restrictions because of this.
$$


#### Occupancy-Based Pricing

Some categories might have different rates based on how many people are staying in the room. For example, a standard rate might be set up for 2 people, with a cheaper rate if room is booked by 1 person. If your integration also wants to query occupancy based prices, the query can be augmented to include this data as well:

```graphql
fragment MyCategoryData on Category {
  id
  standardOccupancy
  defaultPrices(filter:{date:$dateRange} first:31) {
    edges {
      node {
        date
        amount
        occupancies {
          occupancy
          amount
        }
      }
    }
  }
}
```

top-level `amount` refers to rate used by standard occupancy (`standardOccupancy` field), while `occupancies.occupancy` field refers to rate used by each occupancy other than standard occupancy.

`occupancies` field will be empty when a category does not use occupancy based pricing, so if your integration needs these rates, it's safe to include the fields for all categories.

### Updating Rates and Restrictions
$$INFO
title: API Access
Updating rates and restrictions requires **read/write permissions**
$$

Rates can be updated by using the `updateCategoryPrices` mutation. It requires:

* Category ID
* Date Range (inclusive)
* Amount

```graphql
# Variables:
# { 
#   "updates": [
#     {category: "<category id>", dateRange: {start: "2025-07-07", end: "2025-07-11"}, amount: "123.45"},
#     {category: "<category id>", dateRange: {start: "2025-07-14", end: "2025-07-18"}, amount: "111.99"},
#   ],
# }
#
mutation UpdatePrice($updates:[CategoryPriceInput!]!) {
    updateCategoryPrices(input:{prices: $updates}) {
        __typename
    }
}
```

Similarly, restrictions can be updated by using `updateCategoryRestrictions` mutation. It requires:

* Category ID
* Date Range (inclusive)
* Changeset - any subset of restriction fields. Non-provided fields will not be updated.

```graphql
# Variables:
# {
#   "restrictions": [
#     {
#       "category": "<category id>",
#       "dateRange": {
#         "start": "2025-07-01",
#         "end": "2025-07-31"
#       },
#       "stopSell": true,
#       "minStay": 4,
#       "maxStay": 5,
#       "closedToArrival": true,
#       "closedToDeparture": true,
#       "guarantee": true,
#       "cancellation": 2,
#       "breakfastIncluded": true
#     }
#   ]
# }
mutation UpdateRestrictions($restrictions: [CategoryRestrictionInput!]!) {
    updateCategoryRestrictions(input:{restrictions:$restrictions}) { __typename }
}
```

$$DANGER
title: Update Limit
**At most 1000 updates** can be sent in one mutation. 1 update is a category and date pair. For example, updating 1 category for July is 31 updates. To update more than 1000 days, multiple requests must be sent.
$$

#### Occupancy-Based Pricing

Occupancy-based pricing by default is derived from the standard rate. Updating these rates is optional. However, if the default behaviour is not suitable, your integration may still provide a different rate for each occupancy by providing an additional `occupancy` value:

```json
{ 
  "updates": [
    {category: "<category id>", dateRange: {start: "2023-09-13", end: "2023-09-13"}, occupancy: 2, amount: "123.45"},
  ],
}
```

To reset back to using a derived rate for an occupancy, the amount value can be `NULL`:
```json
{ 
  "updates": [
    {category: "<category id>", dateRange: {start: "2023-09-13", end: "2023-09-13"}, occupancy: 2, amount: null},
  ],
}
```

$$WARNING
title: No Duplicates
Avoid sending multiple updates for the same `(date,category,?occupancy)` tuple in one request. We provide **no guarantee on the order in which updates processed.**
$$
