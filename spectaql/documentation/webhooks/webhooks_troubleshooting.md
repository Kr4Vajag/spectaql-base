### Lost signing secret
Signing secret is retrievable only when first creating a webhook endpoint with 3RPMS. If you had not saved it or its compromised, a new webhook endpoint has to be created and the old one deleted.

### Lost api key
If you want to disable a webhook endpoint, but have lost the api key, return any non-2xx response status code. After a few days, the endpoint will be disabled and 3RPMS will stop sending notifications

### Stopped receiving webhooks
Endpoints that have been failing for a few days are disabled. You can check the endpoint's status via api:
```graphql
query WebhookEndpointStatus($id:ID!) {
  webhookEndpoints(filter:{id:{eq:$id}}) {
    edges {
      node { status }
    }
  }  
}
```

If its `DISABLED`, and you've resolved the issues that caused the endpoint to be disabled in the first place, it can be enabled back via api:
```graphql
# Variables:
# {
#   "input": {
#     "id": "your_webhook_endpoint_id",
#     "status": "ENABLED"
#   }
# }
mutation EnableWebhookEndpoint($input:UpdateWebhookEndpointInput!) {
  updateWebhookEndpoint(input:$input) {
    webhookEndpoint { status }
  }
}
```
