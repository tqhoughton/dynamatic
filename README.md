# Dynamatic

A wrapper around the `DynamoDB.DocumentClient` class that makes common operations a lot easier.

## Inspiration

I pray to God you have never had to interact with the raw `AWS.DynamoDB` API in JavaScript. It makes you define all of your types explicitly rather than infer them, and is overall just not well suited for Javascript.

The `DynamoDB.DocumentClient` class is a bit better because it can infer types from the objects you pass in, but after extended development you often run into the same problems, some examples below:

  1. Constructing ExpressionAttributeName, ExpressionAttributeValue, and expressions for `query` and `update` calls
  2. Batch operations (query or scan a table, then delete or update all items returned)
  3. Typing results (must cast all results that come back from `any` to something more useful)
  4. Have to pass in `TableName` to all operations

Not to fear, this library solves these problems and more!

## What do I do if what I want to do isn't supported by Dynamatic?

You can access the DocumentClient directly by accessing the `ddb` property of the instance. Example:

```
const dynamatic = new Dynamatic({ ... });

const { Items } = await dynamatic.ddb.scan({ TableName: dynamatic.schema.tableName }).promise();
```

Your other option is to submit a PR to add the functionality you wish to see!

## Testing

Run `npm run test` in the project. The Dynamatic class has an optional parameter to pass in an existing `DocumentClient` to make testing easier.

## Todo list

  * Create update method with automatic update expression creation
  * Create batchWrite, batchDelete, and possibly batchUpdate methods
  * Add a factory function that can automatically type all results rather than having to pass them in as `<T>`
  * Get community feedback
