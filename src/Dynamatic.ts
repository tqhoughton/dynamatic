import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

export type KeyValue = string | number;

export interface Index {
  hash: string;
  range?: string;
}

export interface TableSchema {
  tableName: string;
  primaryKey: Index;
  // each key is the name of the index
  globalSecondaryIndexes?: Record<string, Index>;
}

export interface QueryOptions {
  // only provide indexName if querying by GSI
  indexName?: string;
  keyConditions: Record<string, KeyConditions>;
  // exclusive start key
  start?: Record<string, any>;
  limit?: number;
}

export enum KeyComparison {
  EQUALS = '='
}

export type KeyConditions = Record<KeyComparison, KeyValue>;

const KEY_PREFIX = '#'
const VALUE_PREFIX = ':'

export class Dynamatic {
  public ddb: DynamoDBDocument;

  constructor(protected schema: TableSchema, options?: DynamoDBClientConfig & { documentClient?: DynamoDBDocument }) {
    this.ddb = options?.documentClient || DynamoDBDocument.from(new DynamoDBClient(options));
  }

  buildKeyConditionExpression(keysMap: Record<string, KeyConditions>) {
    const keys = Object.entries(keysMap);
    return keys.map(([keyName, comparison]) => {
      const keyCondition = Object.keys(comparison)[0];
      return `${KEY_PREFIX}${keyName} ${keyCondition} ${VALUE_PREFIX}${keyName}`;
    }).join(' AND ')
  }

  buildExpressionAttributeNames(keysMap: Record<string, KeyConditions>) {
    return Object.keys(keysMap).reduce((expressionAttributeNames, keyName) => {
      return {
        ...expressionAttributeNames,
        [`${KEY_PREFIX}${keyName}`]: keyName
      };
    }, {});
  }

  buildExpressionAttributeValues(keysMap: Record<string, KeyConditions>) {
    return Object.entries(keysMap).reduce((expressionAttributeNames, [keyName, comparison]) => {
      const value = Object.values(comparison)[0];
      return {
        ...expressionAttributeNames,
        [`${VALUE_PREFIX}${keyName}`]: value
      };
    }, {});
  }

  async query({ indexName, start, limit, keyConditions }: QueryOptions) {
    const response = await this.ddb.query({
      ...indexName && { IndexName: indexName },
      TableName: this.schema.tableName,
      ExclusiveStartKey: start,
      Limit: limit,
      KeyConditionExpression: this.buildKeyConditionExpression(keyConditions),
      ExpressionAttributeNames: this.buildExpressionAttributeNames(keyConditions),
      ExpressionAttributeValues: this.buildExpressionAttributeValues(keyConditions)
    });

    return {
      items: response.Items,
      lastEvaluatedKey: response.LastEvaluatedKey,
      scannedCount: response.ScannedCount,
      consumedCapacity: response.ConsumedCapacity,
      count: response.Count
    };
  }

  async get<T=any>(key: Record<string, KeyValue>): Promise<T | null> {
    const { Item } = await this.ddb.get({
      TableName: this.schema.tableName,
      Key: key
    });

    return Item ? Item as T : null;
  }

  async put<T=any>(item: T): Promise<void> {
    await this.ddb.put({
      TableName: this.schema.tableName,
      Item: item
    });
  }

  async delete(key: Record<string, KeyValue>): Promise<void> {
    await this.ddb.delete({
      TableName: this.schema.tableName,
      Key: key
    });
  }
  // TODO: add update and batch operations
}
