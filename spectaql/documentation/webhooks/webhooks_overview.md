3RPMS uses webhooks to notify your application when an event happens in a hotel.  Webhooks enable 3RPMS to push **real-time notifications to your integration**.  Webhooks are sent as a HTTPS POST request with a JSON payload. You can then use these notifications to execute actions in your integration.

**Terminology**

* Webhook - an event notification
* Webhook endpoint - your server that receives event notifications (webhooks)

### Reference

For all webhook types the payload will be a json object with the following top-level structure:


```json
{
  "id": "[A-Za-z0-9]{64}",
  "type": "room_stay.updated",
  "created_at": 2147483647,
  "webhook_endpoint_id": "[A-Za-z0-9]{64}",
  "data": ...
}
```


| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique id of this event. Multiple endpoints receiving the same event will have the same id. |
| `type` | `string` | name of the webhook |
| `created_at` | `int` | timestamp of when the event happened. May not be the same as when your integration receives this. |
| `webhook_endpoint_id` | `string` | `id` of the webhook endpoint that was created  via graphql api.<br> Can be used to identify what hotel this webhook belongs to. |
| `data` | `any` | Main body of the webhook.  See specific type's reference for more details. |

$$INFO
title: Best practice
For forwards compatibility, **allow unknown fields** at any nesting level in the payload
$$

$$INFO
title: ​
If you want to get notifications about any **additional event types** not listed here, contact 3RPMS support at office@3rpms.de describing your use case.
$$

#### `reservation.created`

Sent when a new `Reservation` is created.

==Body shape==
```json
"object": {
  "id": "[A-Za-z0-9-]{1,64}"
}
```


| Field | Type | Description |
| --- | --- | --- |
| `object.id` | `string` | Associated reservation's id. Use this to query for more data from the API |

#### `reservation.updated`

Sent when an existing `Reservation` is updated.

==Body shape==
```json
"object": {
  "id": "[A-Za-z0-9-]{1,64}"
},
"updated_fields": [...]
```


| Field | Type | Description |
| --- | --- | --- |
| `object.id` | `string` | Associated reservation's id. Use this to query for more data from the API |
| `updated_fields` | `string[]\|null` | list of `Reservation` field names *(from graphql API)* that have changed. When `updated_fields` is not present, assume that any field could have changed. <br> * This will not include `*Connection` type fields.  <br> * Fields that contain their own ID (for example, `client` or `contact`)  will only be included when a different record is referenced, for example, a change to client's first name will **not** trigger a `reservation.updated` webhook (use `client.updated` event for that), but changing reservation's referenced client to someone else will trigger a `reservation.updated` webhook.


#### `room_stay.created`

Sent when a new `RoomStay` is created.

==Body shape==
```json
"object": {
  "id": "[A-Za-z0-9-]{1,64}"
}
```


| Field | Type | Description |
| --- | --- | --- |
| `object.id` | `string` | Associated room stay's id. Use this to query for more data from the API |
| `updated_fields` | `string[]\|null` | list of `RoomStay` field names *(from graphql API)* that have changed. When `updated_fields` is not present, assume that any field could have changed. This will not include `*Connection` type fields.

#### `room_stay.updated`

Sent when an existing `RoomStay` is updated.

==Body shape==
```json
"object": {
  "id": "[A-Za-z0-9-]{1,64}"
},
"updated_fields": [...]
```


| Field | Type | Description |
| --- | --- | --- |
| `object.id` | `string` | Associated room stay's id. Use this to query for more data from the API |
| `updated_fields` | `string[]\|null` | list of `RoomStay` field names *(from graphql API)* that have changed. When `updated_fields` is not present, assume that any field could have changed. <br> * This will not include `*Connection` type fields.  <br> * Fields that contain their own ID (for example, `reservation` or `guests`)  will only be included when a different record is referenced; for example, a change to guest's first name will **not** trigger a `room_stay.updated` webhook (use `client.updated` event for that), but changing adding a new guest will trigger a `room_stay.updated` webhook.

#### `room_stay.deleted`

Sent when an existing `RoomStay` is deleted.

==Body shape==
```json
"object": {
  "id": "[A-Za-z0-9-]{1,64}"
}
```


| Field | Type | Description |
| --- | --- | --- |
| `object.id` | `string` | Associated room stay's id.

#### `client.updated`

Sent when an existing `Client` is updated.

==Body shape==
```json
"object": {
  "id": "[A-Za-z0-9-]{1,64}"
}
```


| Field | Type | Description |
| --- | --- | --- |
| `object.id` | `string` | Associated client's id. Use this to query for more data from the API |

#### `client.deleted`

Sent when an existing `Client` is deleted.

==Body shape==
```json
"object": {
  "id": "[A-Za-z0-9-]{1,64}"
}
```


| Field | Type | Description |
| --- | --- | --- |
| `object.id` | `string` | Associated client's id |

#### `room_access_key.deleted`

Sent when an existing `RoomAccessKey` is deleted.

==Body shape==
```json
"object": {
  "id": "[A-Za-z0-9-]{1,64}"
}
```


| Field | Type | Description |
| --- | --- | --- |
| `object.id` | `string` | Associated room access key's id |

#### `category.availability.updated`

Sent when room availability for a `Category` changes.

==Body shape==
```json
"object": {
  "id": "[A-Za-z0-9-]{1,64}"
},
"period": {
  "start": "YYYY-MM-DD",
  "end": "YYYY-MM-DD"
}
```


| Field | Type | Description |
| --- | --- | --- |
| `object.id` | `string` | Associated category's id |
| `period` | `object\|null` | Affected period. Will be `null` when all dates are affected.
| `period.start` | `date-string` | Start (inclusive) of the affected period. |
| `period.end` | `date-string` | End (inclusive) of the affected period.  |

### Creating a webhook
1. Identify the webhooks to receive
2. Handle requests from 3RPMS by parsing each event object and returning 2xx response status codes.
3. Register your endpoint with 3RPMS

$$WARNING
title: Webhook endpoint limit
There is a **limit of 5** active webhook endpoints per hotel per integration
$$

#### Step 1: Identify the webhooks to receive
See [Supported events](#webhooks-overview-reference) section. Each webhook endpoint can listen to multiple events.

$$INFO
title: Best practice
Create endpoints with **only events you need** for better performance.
$$

#### Step 2: Handle requests from 3RPMS

Webhooks will be sent as a POST request, with payload in the request's body

$$generic

=== "node.js"
```js
const express = require('express');
const crypto = require('crypto');
const scmp = require('scmp');
const app = express();
// If the same endpoint is used for multiple hotels, each one will have a different endpoint secret
const webhookEndpointSecret = '[your_webhook_endpoint_secret]';
app.post('/3rpms', express.raw({type: 'application/json'}), (request, response) => {
    const payloadRaw = request.body;
    const signatureHeader = request.header('3rpms-signature');
    const payload = JSON.parse(payloadRaw);
    if (!verifyHeader(signatureHeader, payloadRaw, webhookEndpointSecret)) {
        // See Security section below for `verifySignature` definition
        response.sendStatus(400);
        return;
    }
    if (payload.type === 'room_stay.created') {
        const roomStayId = payload.data.object.id;
        // Execute your actions for `room_stay.created`
    } else if (payload.type === 'room_stay.updated') {
        const roomStayId = payload.data.object.id;
        // Execute your actions for `room_stay.updated`
        //} else if ... { }
    } else {
        console.log(`Unhandled event type ${payload.type}`);
    }
    // Return a response to acknowledge receipt of the event
    response.sendStatus(204);
});
app.listen(8000, () => console.log('Running on port 8000'));
```

=== "php"
```php
$payloadRaw = file_get_contents('php://input');
$signatureHeader = $_SERVER['HTTP_3RPMS_SIGNATURE'];
if (!verifySignature($signatureHeader, $payloadRaw, '[your_webhook_endpoint_secret]')) {
    // See Security section below for `verifySignature` definition
    // If the same endpoint is used for multiple hotels, each one will have a different endpoint secret
    http_response_code(400);
    exit();
}
$payload = json_decode($payloadRaw, true, 4, JSON_THROW_ON_ERROR);
if ($payload['type'] === 'room_stay.created') {
    $roomStayId = $payload['data']['object']['id'];
    // Execute your actions for `room_stay.created`
} elseif ($payload['type'] === 'room_stay.updated') {
    $roomStayId = $payload['data']['object']['id'];
    // Execute your actions for `room_stay.updated`
//} eseif (...)
} else {
    echo 'Received unknown event type ' . $payload['type'];
}
http_response_code(200);
```
$$

$$WARNING
title: Secure connections
All endpoints are required to **use https** with a validate certificate
$$

##### Duplicate events
Webhook endpoints might occasionally receive the same webhook more than once. We advise you to guard against duplicated webhooks by making your webhook processing idempotent. One way of doing this is logging the webhooks you've processed, and then not processing already-logged events.

$$INFO
title: ​
3RPMS guarantees **at least once** delivery for webhooks
$$

##### Order of events
3RPMS does not guarantee delivery of webhooks in the order in which they are generated. For example, creating a room stay and immediately deleting it might generate the following webhooks:

1. `room_stay.created`
2. `room_stay.deleted`

It's possible you'll receive a `roomstay.deleted` webhook first, for a room stay your integration doesn't know about. Your endpoint must not expect delivery of these webhooks in this order and should handle this accordingly. Use the API to fetch any missing objects (for example, you can fetch the reservation when receiving `room_stay.created` webhook).

##### Security
3RPMS signs all webhooks by including a signature in each request's `3rpms-signature` header. This allows you to verify that the webhook was sent by 3RPMS, not by a third party.

To verify signatures, you'll need to save your endpoint's secret when registering your  webhooks endpoint in step 3. It can be retrieved only once when first registering the endpoint.

3RPMS generates a unique secret key for each endpoint. Additionally, if you use multiple endpoints, you must obtain a secret for each one you want to verify signatures on.

###### Preventing replay attacks
A replay attack is when an attacker intercepts a valid payload and its signature, then re-transmits them. To mitigate such attacks, 3RPMS includes a timestamp in the `3rpms-signature` header. Because this timestamp is part of the signed payload, it is also verified by the signature, so an attacker cannot change the timestamp without invalidating the signature. If the signature is valid but the timestamp is too old, you can have your application reject the payload. We recommend a tolerance of no more than five minutes between the timestamp and the current time.

3RPMS generates the timestamp and signature each time we send a webhook to your endpoint. If 3RPMS retries an webhook (for example, your endpoint previously replied with a non-2xx status code), then we generate a new signature and timestamp for the next delivery attempt.

###### Verify signature
The `3rpms-signature` header included in each signed webhook contains a timestamp and one or more signatures. The timestamp is prefixed by `t=`, and each signature is prefixed by a `signature=`.

```
3rpms-signature:
t=1658997155,
signature=e889ddfe87e55422a1a6493b2db846548ff2a7f22268501b519f9f4f5f70e2ff
```

3RPMS generates signatures using a hash-based message authentication code (HMAC) with SHA-256. For forwards compatibility,  your integration must support handling multiple signatures prefixed with `signature=`.

##### Step 1: Extract the timestamp and signatures from the header
Split the header, using the `,` character as the separator, to get a list of elements. Then split each element, using the `=` character as the separator, to get a `(prefix, value)` pair.

The value for the prefix `t` corresponds to the timestamp, and `signature` corresponds to the signature (or signatures). You can discard all other elements.

##### Step 2: Prepare the signed payload string
The `signed_payload` string is created by concatenating:

* The timestamp (as a string) from header
* The character `.`
* The full request POST body


##### Step 3: Determine the expected signature
Compute an HMAC with the SHA256 hash function. Use the endpoint's signing secret as the key, and use the `signed_payload` string as the message.

##### Step 4: Compare the signatures
Compare the signature (or signatures) in the header to the expected signature. For an equality match, compute the difference between the current timestamp and the received timestamp, then decide if the difference is within your tolerance.

To protect against timing attacks, use a constant-time string comparison to compare the expected signature to each of the received signatures.

###### Sample code

$$generic

=== "node.js"
```js
function verifyHeader(header, body, secret, tolerance = 5 * 60) {
    // Header contains two parts, timestamp and signature, in format `t=123,signature=abc`
    const {timestamp, signatures} = header.split(',').reduce((acc, pair) => {
        const [key, value] = pair.split('=');
        if (key === 't') acc.timestamp = value;
        else if (key === 'signature') acc.signatures.push(value);
        return acc;
    }, {
        timestamp: -1,
        // For forwards compatibility, allow multiple `signatures` to be present `signature=agfdgfdgd,signature=gkdsgde`
        signatures: [],
    });
    if (timestamp === -1) return false;
    if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > tolerance) {
        // Reject to prevent replay attacks.
        return false;
    }
    const signedPayload = timestamp + '.' + body;
    const expectedSignature = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');
    for(const signature of signatures) {
        if (scmp(Buffer.from(expectedSignature), Buffer.from(signature))) {
            return true;
        }
    }
    return false;
}
```

=== "php"
```php
function verifySignature(string $header, string $payload, string $secret, int $tolerance = 5 * 60): bool
{
    // Header contains two parts, timestamp and signatures, in format `t=123,signature=abc,signature=def`
    $timestamp = null;
    $signatures = [];
    foreach (explode(',', $header) as $item) {
        [$key, $value] = explode('=', $item, 2);
        if ($key === 't') {
            $timestamp = $value;
        } elseif ($key === 'signature') {
            $signatures[] = $value;
        }
    }
    if (abs(time() - $timestamp) > $tolerance) {
        // Difference between current time and sent time is too high.
        // Reject to prevent replay attacks.
        return false;
    }
    $signedPayload = $timestamp . '.' . $payload;
    $expectedSignature = hash_hmac('sha256', $signedPayload, $secret);
    // For forwards compatibility, support multiple `signatures` in the header. Any succeeding counts as verified
    foreach ($signatures as $signature) {
        if (hash_equals($expectedSignature, $signature)) {
            return true;
        }
    }
    return false;
}
```
$$

$$WARNING
title: Timeouts
Webhooks that take too long to deliver a response status code will be treated as failed and delivery will be attempted again.
$$

#### Step 3: Register your endpoint with 3RPMS

See graphQL docs on how to set use our api

```graphql
# Variables
# {
#   "input": {
#     "url":"https://example.com/3rpms-webhook",
#     "status":"DISABLED",
#     "events":["room_stay.created"]
#   }
# }
mutation CreateWebhookEndpoint($input:CreateWebhookEndpointInput!) {
  createWebhookEndpoint(input:$input) {
    webhookEndpoint { id }
    secret
  }
}
```

Make sure to save response's `webhookEndpoint.id` as it may be needed to identify the hotel when receiving a webhook.
$$INFO
title: Best practice
**Create new webhook endpoints in a `DISABLED` state**, and update it to `ENABLED` after persisting the signing secret. This will avoid signing errors for webhooks immediately after registering the webhook endpoint
$$

### Additional Data
A webhook notifies your integration that _something happened_ and includes only the bare minimum data to identify the affected record, 3RPMS will not know what fields your integrations needs.

After receiving a webhook, its expected that your integration will query the API for the data it needs. For example, for a `room_stay.updated` webhook, can use the `data.object.id` value to query for the room's current stay period:

```graphql
# Variables
# {
#   "id": "<value from data.object.id>"
# }
query RoomStay($id:ID!) {
  room_stays(filter:{id:{eq:$id}} first:1) {
    edges {
      node {
        id
        arrival:reservation_from
        departure:reservation_to
        # other fields needed
      }
    }
  }
}
```

### Retries
3RPMS webhooks have built-in retry methods for 3xx, 4xx, or 5xx response status codes. Any webhooks with a non-2xx respones status code will be attempted again for a few days or until a 2xx response status code is received

$$WARNING
title: Redirects
Webhook endpoint redirects will not be followed for security reasons. **3xx response status code is treated as failing** and will be re-sent.
$$

$$DANGER
title: Failing endpoints
**Endpoints will be disabled** when all sent webhooks have been failing for a few days
$$
