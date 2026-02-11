The External Sales API provides the ability to integrate your POS system with 3RPMS enabling sending sales' bills to the guest's room. This helps achieve a seamless experience for guests and improves the overall efficiency for sales performed through 3rd party systems.

$$INFO
title: API Access
External Sales API requires **read/write permissions**
$$

Terminology:

* **External Sale** - A single sale attached to a room stay.
* **External Sales Product** - A sale's template. Each External Sale will reference an External Sales Product.

### Set up external sales product

Before any External Sale can be added, an External Sales Product must be set up. This will need to be referenced when adding an External Sale. The product's name can be anything, but its recommended to be your integration's name - this name will be visible in reservation's item listing.

```graphql
# Query variables:
# {
#   "createExternalSalesProduct": {
#     "name": "Retro-rant"
#   }
# }
mutation CreateExternalSalesProduct($createExternalSalesProduct: CreateExternalSalesProductInput!) {
  createExternalSalesProduct(input:$createExternalSalesProduct) {
    product { id name }
  }
}
```

Your integration should save the response's id to later use in when adding. an External Sale

$$WARNING
title: Limitation
There is a **limit of 1 External Sales Product** per integration
$$

#### Update External Sales Product

The name of an External Sales Product can be changed at any time. This name will be used only for new External Sales created, any existing External Sales will remain unchanged.

```graphql
# Query variables:
# {
#   "updateExternalSalesProduct": {
#     "id": "<id>",
#     "name": "Retro-raunt"
#   }
# }
mutation UpdateExternalSalesProduct($updateExternalSalesProduct: UpdateExternalSalesProductInput!) {
  updateExternalSalesProduct(input:$updateExternalSalesProduct) {
    product { id name }
  }
}
```

#### List External Sales Products

In case state from `createExternalSalesProduct` was not saved or was lost, it can be retrieved with `externalSalesProducts` query:

```graphql
query ExternalSalesProducts {
  externalSalesProducts {
    edges {
      node { id name }
    }
  }
}
```

### Retrieve active room list

Every new External Sale must be attached to a room stay. An example query to retrieve room stays that: (1) have checked in, and (2) have not checked out, and (3) reservation is not cancelled.

```graphql
query CheckedInRoomStays($cursor: String = null) {
  room_stays(first:20 after:$cursor filter:{ not:{ check_in:{ eq:null } } check_out:{ eq:null } }) {
    edges {
      node {
        id
        reservation { code }
        roomName
        first_guest { firstname lastname }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

External Sales can be attached to any non-cancelled rooms, your integration may use a different filter if needed.

### Add External Sale

In addition to external sales product and room stay id, there are 3 requires values - `amount`, `saleCreatedAt`, `receiptNumber`. Quantity or discount cannot be specified - `amount` is the final total.

```graphql
# Query variables:
# {
#   "createExternalSale": {
#     "productId": "<external sales product id>",
#     "roomStayId": "<room stay id>",
#     "amount": "12.34",
#     "saleCreatedAt": "2023-02-20T11:13:00+01:00",
#     "receiptNumber": "INVOICE-123"
#   }
# }
mutation CreateExternalSale($createExternalSale:CreateExternalSaleInput!) {
  createExternalSale(input: $createExternalSale) {
    created
  }
}
```

In addition, your integration can also provide optional `receiptPdfUrl`, `waiterName` and `tableName` values.

#### Cancel External Sale

External Sales cannot be updated or deleted by your integration, nor by hotel staff. Cancellation can be achieved by sending negative amount using the same mutation as above.
