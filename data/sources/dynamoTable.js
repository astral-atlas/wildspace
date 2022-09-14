// @flow strict

import { c } from "@lukekaalim/cast";


/*::
import type { CompositeKey } from "./table";
import type { DynamoDB } from "@aws-sdk/client-dynamodb";
import type { Cast } from "@lukekaalim/cast/main";

import { readDynamoDBItem, writeDynamoDBItem, writeValueTypes } from "./table";

export type DynamoDBTable<PK, SK, Item> = {
  get: (key: CompositeKey<PK, SK>) =>
    Promise<{ result: Item | null, version: mixed }>,
  remove: (key: CompositeKey<PK, SK>) =>
    Promise<void>,
  set: (key: CompositeKey<PK, SK>, prevVersion: mixed, nextVersion: mixed, expiresBy: null | number, item: Item) =>
    Promise<void>,
  query: (partitionKey: PK) =>
    Promise<{ results: $ReadOnlyArray<{ result: Item, version: mixed, sortKey: SK }> }>,
};
*/

export const createLiveDynamoDBTable = /*:: <I>*/(
  dynamodb/*: DynamoDB*/,
  tableName/*: string*/,

  castItem/*: Cast<I>*/,

  partitionKeyName/*: string*/,
  sortKeyName/*: string*/,
  valueKeyName/*: string*/,
  expiryKeyName/*: string*/,
  versionKeyName/*: string*/,
)/*: DynamoDBTable<string, string, I>*/ => {
  const get = async (key) => {
    const { Item } = await dynamodb.getItem({
      TableName: tableName,
      Key: {
        [partitionKeyName]: { S: key.partition },
        [sortKeyName]: { S: key.sort }
      }
    });
    if (!Item)
      return { result: null, version: null }
    const value = readDynamoDBItem(Item);
    const result = castItem(value[valueKeyName]);
    const expiresBy = c.num(value[expiryKeyName]);
    const version = value[versionKeyName];

    if (expiresBy < (Date.now() * 1000))
      return { result: null, version: null };

    return { result: (result/*: I*/), expiresBy, version }
  };
  const remove = async (key) => {
    await dynamodb.deleteItem({
      TableName: tableName,
      Key: {
        [partitionKeyName]: key.partition,
        [sortKeyName]: key.sort,
      }
    })
  }
  const set = async (key, prevVersion, nextVersion, expiresBy, item) => {
    const versionConditionProps = prevVersion === null ? {} : {
      ConditionExpression:  '#v = :v',
      ExpressionAttributeNames: { '#v': versionKeyName },
      ExpressionAttributeValues: { ':v': writeValueTypes(prevVersion) }
    };
    await dynamodb.putItem({
      TableName: tableName,
      Item: writeDynamoDBItem({
        [partitionKeyName]: key.partition,
        [sortKeyName]: key.sort,
        [valueKeyName]: item,
        [versionKeyName]: nextVersion,
        [expiryKeyName]: expiresBy
      }),
      ...versionConditionProps,
    });
  };
  const query = async (partitionKey) => {
    const { Items } = await dynamodb.query({
      TableName: tableName,
      
      FilterExpression: '#exp < :expiry_cutoff',
      KeyConditionExpression: `#pkn=:pk`,
      ExpressionAttributeNames: {
        [`#pkn`]: partitionKeyName,
        [`#exp`]: expiryKeyName,
      },
      ExpressionAttributeValues: {
        [`:pk`]: { S: partitionKey },
        [`:expiry_cutoff`]: { N: (Date.now() * 1000).toString() },
      }
    });

    const results = Items
      .map(item => readDynamoDBItem(item))
      .map(item => {
        const sortKey = c.str(item[sortKeyName]);
        const result = castItem(item[valueKeyName]);
        const version = item[versionKeyName];
        return { sortKey, result, version };
      });

    return { results };
  }

  return { get, remove, set, query };
}

export const createMemoryDynamoDBTable = ()/*: DynamoDBTable<any, any, any>*/ => {
  throw new Error();
}

export const createNamespacedDynamoDBTable = /*:: <PK, SKA, SKB, Item>*/(
  table/*: DynamoDBTable<PK, SKA, Item>*/,
  transformPartition/*: PK => PK*/,
  transformSort/*: SKB => SKA*/,
  reverseTransformSort/*: SKA => SKB*/,
)/*: DynamoDBTable<PK, SKB, Item>*/ => {
  const transformKey = key => ({
    partition: transformPartition(key.partition),
    sort: transformSort(key.sort)
  });
  return {
    get(key) {
      return table.get(transformKey(key));
    },
    set(key, prevVersion, nextVersion, expiresBy, item) {
      return table.set(transformKey(key), prevVersion, nextVersion, expiresBy, item);
    },
    remove(key) {
      return table.remove(transformKey(key));
    },
    async query(partitionKey) {
      const { results } = await table.query(partitionKey);
      const mappedResults = results.map(result => ({
        ...result,
        sortKey: reverseTransformSort(result.sortKey),
      }));
      return { results: mappedResults };
    }
  }
}