### Prerequisites

$$WARNING
title: Important
**Please, read the <a href="https://3rpms-hotelsoftware.de/api_startguide" target="_blank">3RPMS® GENERAL API
INTEGRATION GUIDE</a> first!**
$$

### GraphQL basics and tips

Although there is a lot more about GraphQL, we hereby list the very basics you should bear in mind when starting the integration.

$$INFO
title: Bear in mind!
All HTTP calls to the server must use POST method.
$$

### Access

#### Endpoint

Production server endpoint: `https://www.3rpms.de/graphql` (please make sure you use `www.`)

Sandbox server endpoint: `https://demo.3rpms.de/graphql`

#### Authentication

All requests require an API key in the header `Authorization: Bearer <myapikey>` where

##### API key

Create an `API key` in 3RPMS® under <a href="https://www.3rpms.de//integration" target="_blank">Settings -> Integrations access</a> or ask the `administrator` of the hotel to do it if you do not have access.

Each hotel can have multiple API keys, each of which can have the following restrictions:

* API Key has `read-only` access
* API Key has `write` access
* API Key has been disabled (when you want to restrict access temporary)

$$WARNING
title: Important
Contact support if you are not sure if an integration should have `write` or `read-only` access!
$$
