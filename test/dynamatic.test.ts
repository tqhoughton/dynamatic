import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { Dynamatic, KeyComparison } from '../src/Dynamatic';

const tableSchema = { tableName: 'test-table', primaryKey: { hash: 'id', range: 'type' }};

describe('constructor', () => {
  test('Can create with dynamoDBDocument', () => {
    const dynamatic = new Dynamatic(tableSchema, {
      documentClient: DynamoDBDocument.from(new DynamoDBClient({})
    )});

    expect(dynamatic).toBeTruthy();
  });

  test('Can create without dynamoDBDocument', () => {
    const dynamatic = new Dynamatic(tableSchema);

    expect(dynamatic).toBeTruthy();
  });
})

describe('query', () => {
  test('Calls DynamoDB with valid arguments', async () => {
    const mockDynamoClient: DynamoDBDocument = {
      query: jest.fn().mockResolvedValue({
        Items: []
      })
    } as any;
    
    const dynamatic = new Dynamatic(tableSchema, { documentClient: mockDynamoClient });

    const { items } = await dynamatic.query({ keyConditions: { id: { [KeyComparison.EQUALS]: 'hi' }}});

    expect(items.length).toEqual(0);
    expect(mockDynamoClient.query).toHaveBeenCalledWith(expect.objectContaining({
      TableName: tableSchema.tableName,
      KeyConditionExpression: '#id = :id',
      ExpressionAttributeNames: {
        '#id': 'id'
      },
      ExpressionAttributeValues: {
        ':id': 'hi'
      }
    }));
  });

  test('Can pass in indexName', async () => {
    const mockDynamoClient: DynamoDBDocument = {
      query: jest.fn().mockResolvedValue({
        Items: []
      })
    } as any;
    
    const dynamatic = new Dynamatic(tableSchema, { documentClient: mockDynamoClient });

    const { items } = await dynamatic.query({ indexName: 'my-secondary-index', keyConditions: { id: { [KeyComparison.EQUALS]: 'hi' }}});

    expect(items.length).toEqual(0);
    expect(mockDynamoClient.query).toHaveBeenCalledWith(expect.objectContaining({
      IndexName: 'my-secondary-index',
      TableName: tableSchema.tableName,
      KeyConditionExpression: '#id = :id',
      ExpressionAttributeNames: {
        '#id': 'id'
      },
      ExpressionAttributeValues: {
        ':id': 'hi'
      }
    }));
  });
});

describe('get', () => {
  test('calls DynamoDB with tableName and key', async () => {
    const mockDynamoClient: DynamoDBDocument = {
      get: jest.fn().mockResolvedValue({})
    } as any;

    const dynamatic = new Dynamatic(tableSchema, { documentClient: mockDynamoClient });

    await dynamatic.get({ id: 'foo', type: 'bar' });

    expect(mockDynamoClient.get).toHaveBeenCalledWith({
      TableName: tableSchema.tableName,
      Key: {
        id: 'foo',
        type: 'bar'
      }
    });
  });

  test('returns null if item does not exist', async () => {
    const mockDynamoClient: DynamoDBDocument = {
      get: jest.fn().mockResolvedValue({})
    } as any;

    const dynamatic = new Dynamatic(tableSchema, { documentClient: mockDynamoClient });

    const item = await dynamatic.get({ id: 'foo', type: 'bar' });

    expect(item).toBeNull();
  });

  test('returns item if it does not exist', async () => {
    const item = { id: 'foo', type: 'bar' };

    const mockDynamoClient: DynamoDBDocument = {
      get: jest.fn().mockResolvedValue({ Item: item })
    } as any;

    const dynamatic = new Dynamatic(tableSchema, { documentClient: mockDynamoClient });

    const result = await dynamatic.get({ id: 'foo', type: 'bar' });

    expect(result).toEqual(item);
  });
});

describe('put', () => {
  test('Calls DynamoDB with tableName and item', async () => {
    const mockDynamoClient: DynamoDBDocument = {
      put: jest.fn().mockResolvedValue(undefined)
    } as any;
  
    const dynamatic = new Dynamatic(tableSchema, { documentClient: mockDynamoClient });
  
    await dynamatic.put({ id: 'foo', type: 'bar' });

    expect(mockDynamoClient.put).toHaveBeenCalledWith({
      TableName: tableSchema.tableName,
      Item: {
        id: 'foo',
        type: 'bar'
      }
    });
  })
});

describe('delete', () => {
  test('Calls DynamoDB with tableName and key', async () => {
    const mockDynamoClient: DynamoDBDocument = {
      delete: jest.fn().mockResolvedValue(undefined)
    } as any;
  
    const dynamatic = new Dynamatic(tableSchema, { documentClient: mockDynamoClient });
  
    await dynamatic.delete({ id: 'foo', type: 'bar' });

    expect(mockDynamoClient.delete).toHaveBeenCalledWith({
      TableName: tableSchema.tableName,
      Key: {
        id: 'foo',
        type: 'bar'
      }
    });
  })
});
