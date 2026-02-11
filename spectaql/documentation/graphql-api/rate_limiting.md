### Rate Limits

There's a limit of 200 requests per minute per IP. Exceeding this limit will block further connections for a period of 20 minutes.

###  Optimisation

#### Reducing queries

When querying for multiple records by `id` at the same time, often the queries can be combined:

| Bad Example                                                                                                                                                                                                                           | Good Example                                                                                                                                       |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| <pre><code>{<br>&emsp;room_stays(filter: {id: {eq: "&lt;room stay id 1&gt;"}}) {<br>&emsp;&emsp;...<br>&emsp;}<br>}<br><br>{<br>&emsp;room_stays(filter: {id: {eq: "&lt;room stay id 2&gt;"}}) {<br>&emsp;&emsp;...<br>&emsp;}<br>}</code></pre> | <pre><code>{<br>&emsp;room_stays(filter: {id: {in: ["&lt;room stay id 1&gt;", "&lt;room stay id 2&gt;"]}}) {<br>&emsp;&emsp;...<br>&emsp;} <br>}</code></pre> |

#### Batching queries

See [Query Batches](#graphql-api-extra-features-using-batches)
