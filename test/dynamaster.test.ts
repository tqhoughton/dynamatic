import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Dynamatic, KeyComparison } from '../src/Dynamatic';

const tableSchema = { tableName: 'test-table', primaryKey: { hash: 'id', range: 'type' }};

describe('constructor', () => {
  test('Can create with documentClient', () => {
    const dynamatic = new Dynamatic(tableSchema, { documentClient: new DocumentClient()})
    expect(dynamatic).toBeTruthy();
  });

  test('Can create without documentClient', () => {
    const dynamatic = new Dynamatic(tableSchema);
    expect(dynamatic).toBeTruthy();
  });
})

describe('query', () => {
  test('Calls DynamoDB with valid arguments', async () => {
    const mockDynamoClient: DocumentClient = {
      query: jest.fn().mockReturnValue({
        promise: () => Promise.resolve({ Items: [] })
      })
    } as any;
    
    const dynamatic = new Dynamatic({ tableName: 'test-table', primaryKey: { hash: 'id', range: 'type' }}, { documentClient: mockDynamoClient });

    const { items } = await dynamatic.query({ keyConditions: { id: { [KeyComparison.EQUALS]: 'hi' }}});

    expect(items.length).toEqual(0);
    expect(mockDynamoClient.query).toHaveBeenCalledWith(expect.objectContaining({
      TableName: tableSchema.tableName,
      KeyConditionExpression: '#id = :hi',
      ExpressionAttributeNames: {
        '#id': 'id'
      },
      ExpressionAttributeValues: {
        ':hi': 'hi'
      }
    }));
  });
});
