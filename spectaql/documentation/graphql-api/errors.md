GraphQL requests cannot be fully executed in some cases - malformed query, insufficient access, or validation errors. For schema and query errors, refer to GraphQL's specification https://spec.graphql.org/June2018/#sec-Errors. This section will cover only errors not part of the graphql specification.
$$WARNING
title: Atomic mutations
**All mutations succeed, or none succeed.** When sending multiple mutations in one request, and any one of them results in an error, all other mutations should be considered failed as well.  In such cases, retrieved `data` is only informative and should be discarded.
$$

### Error Structure
In case of an error, a top-level `error` field will be returned by 3RPMS and will contain one or more errors. Each error will always have, at minimum, a `message` field.

In addition to graphql errors, 3RPMS will return the following errors:

* **Configuration Errors** - Errors that require hotel staff, or 3RPMS support intervention to resolve and will fail with any provided input. For example, some functionality has not been enabled for the hotel.
* **Validation Errors** - Errors that user is expected to be able to recover from by inputting different data. For example, value outside of expected range or some record not found.
* **Auth Errors** -  Api token is not provided or is incorrect

#### Configuration
Configuration errors will have the `extension.category` field set to `"configuration"`.

Configuration errors **must not be shown to hotel guests**, but may be shown to hotel staff and can be logged by your integration. These errors can be resolved only by hotel staff in 3RPMS system, or by contacting 3RPMS support. For example, some functionality has not been enabled for the hotel.

```json
{
  "errors": [
    {
      "message": "This hotel has not beet set up to support Room Access Key api",
      "extensions": {
        "category": "configuration"
      },
    }
  ]
}
```

#### Validation
Validation errors always will have the `extensions.category` field set to `"validation"`.

Validation errors are meant to be resolvable by end-users, for example, by modifying the form in your application, and attempting again. **These errors are safe to show to hotel guests**, and usually can be recovered from.

$$WARNING
title: Forwards Compatibility
Validation messages can change, and additional validations may be added at any time. These messages must not be used in comparisons.
$$


##### Argument errors

For errors related to input arguments, `extensions.argumentPath` field will contain a path to the field that caused an error (similar to `path` in GraphQL schema errors).

==Request==

```
query AvailableRooms {
    inventory(filter: {
        period: {
            start:"2022-09-08"
            end:"2022-09-08"
        }
        categories:["a", "b", "c"]
    }) {
        # ...
    }
}
```

In this example, `filter` has invalid data -  a requested category ("c") does not exist.

==Response==

```
{
  "errors": [
    {
      "message": "Sorry, Property Category not found",
      "extensions": {
        "argumentPath": [
          "filter",
          "categories",
          2
        ],
        "category": "validation"
      },
      "path": [
        "inventory"
      ],
    }
  ]
}
```

`extensions.argumentPath` can be followed to find the field that caused an error.

##### Non-argument errors
For validation errors that cannot be attributed to any specific input input argument, `extensions.argumentPath` *will not* be added

==Request==

In this example, provided data is correct, but room cannot be updated for other reasons.

```graphql
mutation CheckIn {
    updateRoomStay(input:{id:"119157" check_in:"2022-09-08T16:00:00+00:00"}) {
        roomStay {
            check_in
            check_out
        }
    }
}
```

==Response==
```
{
  "errors": [
    {
      "message": "This reservation was cancelled",
      "extensions": {
        "category": "validation"
      },
      "path": [
        "updateRoomStay"
      ]
    }
  ]
}
```

##### Validation message language
By default, validation error messages are in German. To see errors in English, add a `Accept-Language`  header to each graphql request:
```
Accept-Language: en
```

Besides german `de` and english `en` no other language is supported at the moment.

#### Auth

`"category": "auth"` errors will be returned in the following cases:

* Missing api token (`Authorization: Bearer api_...` header)
* Api token incorrect
    * Token might have been disabled, or rotated
* Running a mutation with read-only permissions.

This error **must not be shown to end-guests**, but might be relevant for hotel staff.

==Response==
```json
{
  "errors": [
    {
      "message": "Operation \"query\" not allowed",
      "extensions": {
        "category": "auth"
      }
    }
  ]
}
```

#### GraphQL Error
When a malformed query, non-existent field or other graphql-specific error is returned, there will be **no `extensions.category` field**:

```json
{
  “errors”: [
    {
      “message”: “Syntax Error”
    }
  ]
}
```

GraphQL errors must not be shown to end-guests or hotel staff. These errors may require a change in your integration.
