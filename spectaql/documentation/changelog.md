<details>
<summary>Show changelog</summary>

This changelog lists integration-relevant changes, in chronological order.

### 2026-01-26
#### Improvements
* Add `Reservation.paymentTerms`  and `Query.paymentTerms` fields.
```graphql
query Reservations {
  reservations {
    edges {
      node {
        code
        paymentTerms {
          name
        }
      }
    }
  }
}
```

### 2026-01-06
#### Improvements
* Add `Reservation.billingClient` and `Reservation.billingContact` fields. When present, these client details will be used for invoices instead of reservation owner.
* Add `UpdateReservationInput.clientId`, `UpdateReservationInput.contactId`, `UpdateReservationInput.billingClientId` and `UpdateReservationInput.billingContactId` fields to `updateReservation` mutation
* Add simplified room availability API to query for category availability for each date. This API is similar to how rates and restrictions are already queried.
```graphql
query Availability($dateRange:DateRangeInput!) {
  settings {
    categories {
      edges {
        node {
          id
          name
          availability(filter:{date:$dateRange}) {
            date
            availability
          }
        }
      }
    }
  }
}
```

### 2025-12-01
#### Improvements
* Add `updateReservation` mutation
    *  Only `Reservation.groupName` can be updated

### 2025-09-15
#### Improvements
* Add `Client.newsletterSubscriptionDoubleOptInAt`  field. A non-null value represents that the email has been verified and is known to be valid.

### 2025-07-24
#### Documentation

* Add [Rates & Restrictions API Guide](#guides-rates-restrictions-api)

### 2025-07-23
#### Improvements
* Add `updateCategoryRestrictions` mutation

### 2025-06-11
#### Improvements
* Add `RoomSetup.countTowardsPerformance` field.
    *  Some rooms may be used for purposes other than lodgings, for example, conference rooms or car parking spaces. In such cases, when this field is `false`, the room should not be considered towards Key Performance Metrics.

### 2025-05-16
#### Improvements
* Added a new `RoomAccessQR` Room Access Key type. See [Room Access Key API Guide](#guides-using-room-access-keys) for more details.

### 2025-05-06
#### Improvements
* Add `description` field to `Category` type
```graphql
{
  settings {
    categories {
      edges {
        node {
          # By default, uses language set in `Accept-Language` header (by default, german)
          description
          
          # Or, can override to select a specific language. argument must be a 2-letter country code
          enDescription: description(language: "en")
        }
      }
    }
  }
}
```


### 2025-02-04
#### Improvements
* Added `cancelledAt` field to `Reservation` type.

### 2025-02-03
#### Improvements
* Added daily rates breakdown fields to `RoomRate` type:
    * `packPriceGross`
    * `packPriceNet`
    * `lodgingGross`
    * `lodgingNet`

#### Deprecations
* Deprecated `RoomRate.amount` field in favour of `RoomRate.packPriceGross`

### 2025-01-20
#### Improvements
* Added `bookingChannelCode` to `ReservationFilter`
* Added logical `or` clause to all filters. [See documentation](#graphql-api-filters-disjunction)

### 2024-10-14
#### Improvements
* Added `Person.stayPreferences` and `Person.mealPreferences` as a replacement for `Person.preferences`
* Added `Company.stayPreferences` as a replacement for `Company.preferences`
#### Deprecations
* Deprecated `Person.preferences` , `Company.preferences`, and `Client.preferences`.
### 2024-09-11
#### Improvements
* Mutation `updateRoomSetup`  added.
    * At the moment, the only field that can be updated is `cleaningStatus`

### 2024-09-05
#### Improvements
* Add pagination arguments for `RoomStay.dailyRates` connection

### 2024-07-17
#### Improvements

* [Webhook `room_stay.updated`](#webhooks-overview-room_stayupdated) now includes a `updated_fields` field listing which `RoomStay` fields have changed.
### 2024-03-25

#### Improvements
* [Webhook `reservation.updated`](#webhooks-overview-reservationupdated) now includes a `updated_fields` field listing which `Reservation` fields have changed.

### 2023-09-26
#### Improvements
* [Webhook `category.availability.updated` added](#webhooks-overview-categoryavailabilityupdated). Sent when availability for a category is changed.

### 2023-05-16
#### Deprecations
* Deprecate `RoomSetup.bedLinenChange` field

### 2023-03-23
#### Breaking Changes
* graphql query errors no longer include `extensions.category=graphql`


| Before                                                                                                                                                                                | After                                                                                                       |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| <pre><code>{<br>  "errors": [<br>    {<br>      "message": "Syntax Error",<br>      "extensions": {<br>        "category": "graphql"<br>      },<br>    }<br>  ]<br>}</code></pre> | <pre><code>{<br>  "errors": [<br>    {<br>      "message": "Syntax Error"<br>    }<br>  ]<br>}</code></pre> |

There is no change for other category errors. There is no change for queries that dont result in an error.

### 2023-02-13

#### Improvements

* Adds External Sales API:
    * Type `ExternalSalesProduct` added
    * Mutation `createExternalSalesProduct` added
    * Mutation `updateExternalSalesProduct` added
    * Mutation `createExternalSale` added
    * Query `externalSalesProducts` added

#### Documentation

* Added [External Sales API Guide](#guides-external-sales-api)

### 2023-02-06
#### Improvements
* Added `check_in` and `check_out` to `RoomStayFilter`. Allows to, for example, retrieve all checked in rooms that have not yet checked out.

### 2023-02-01
#### Breaking Changes
* Union `RoomAccessKey` replaced with an interface of the same name. No queries are expected to break, but tools inspecting the schema might be affected.

#### Improvements
* Query `roomAccessKeys` added to retrieve all room access keys your integration is allowed to grant/revoke to rooms
* Mutation`createRoomAccessKey` added to create a room access key - room pin or key storage _(pin,compartment)_ pair
* Mutation `addRoomAccessKey` added to assign a room access key to a room
* Mutation `removeRoomAccessKey` added to remove room access key from a room
* Mutation `deleteRoomAccessKey` added to delete a room access key
* Type `RoomAccessKeyStorage` added for reading _(pin, compartment)_ pairs. A sibling type to `RoomAccessPin`
* Added `configuration` error category, for errors that must not be visible to guests, but should be shown for hotel staff.

#### Documentation
* Added [Room Access Key API Guide](#guides-using-room-access-keys)
* Updated [graphql api errors documentation](#graphql-api-errors)

### 2023-01-23
#### Improvements
* Field `Reservation.selfcheckinStatus` added
    * Returns an enum with values `DISABLED`, `ENABLED`, `AVAILABLE`, `COMPLETED`

#### Deprecations
* Field `Reservation.selfcheckinEnabled` deprecated in favour of `Reservation.selfcheckinStatus`


### 2022-12-19
#### Improvements
* Field `RoomStay.roomAccessKey` added to allow retrieving room pin code for hotels with salto integration set up.

### 2022-11-14
#### Improvements
* Field `Reservation.totalAmount` added
* Field `Reservation.openAmount` added

### 2022-10-27

#### Breaking Changes

* `Client` type was split into `Person` and `Company` types. Most existing queries are expected to continue working, this will affect your integration if `__typename` is used.

#### Improvements

* Query `clientTitles` added - a list of all active client titles
* Query `communicationLanguages` added - a list of available communication languages, ordered by hotel's preference.
*  Mutation `addRoomStayGuest` added - allows adding an existing client as a guest to a room
* Mutation `removeRoomStayGuest` added - allows removing a client as a guest to a room
* Mutation `createClient` added - allows creating new `Person` clients.
* Mutation `updateClient` added - allows updating any existing client
* New fields to `Person`  type added - `clientTitle`, `street`, `zipcode`, `city`, `country`, `fax`, `preferences`, `nationality`, `passportNumber`, `idCardNumber`, `issuingAuthority`
* New fields to `Company`  type added - `street`, `zipcode`, `city`, `country`, `fax`, `preferences`
* Add a `@chain` directive to allow using a result from one operation as input for the next operation, within one request.
    * [See documentation](#graphql-api-extra-features-chained-operations)

#### Deprecations

* Deprecate `Person.title` field in favour of `Person.clientTitle`
* Deprecate `Person.company` field - value is always empty
* Deprecate `Company.firstname` field - value is always empty
* Deprecate`Company.lastname` field - value is always empty
* Deprecate `Company.title` field  - value is always empty
* Deprecate `Company.carPlateNumber` field - value is always empty
* Deprecate `Company.birthday` field - value is always `null`
* Deprecate `Company.birthdayGreetingsEnabled` field - value is always `false`
* Deprecate `Client.title`, `Client.firstname`, `Client.lastname`, `Client.carPlateNumber`, `Client.birthday`, `Client.birthdayGreetingsEnabled` - use  the implementation `Person` type
* Deprecate  `Client.company` - use the implementation `Company` type.

### < 2022-10-27
Changes before 2022-10-27 are not tracked.

</details>
