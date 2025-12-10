import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  PutCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";
import { StatusDAO } from "../dao/StatusDAO";
import { FeedsRecord } from "../dao/types/FeedsRecord";
import { StoriesRecord } from "../dao/types/StoriesRecord";

export class DynamoStatusDAO implements StatusDAO {
  readonly storyTableName = "stories";
  readonly feedTableName = "feeds";
  readonly authorAliasAttr = "author_alias";
  readonly feedRecipientAliasAttr = "feed_recipient_alias";
  readonly postAttr = "post";
  readonly timestampAttr = "timestamp";

  private readonly client;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }
  async putStory(status: StoriesRecord): Promise<void> {
    const params = {
      TableName: this.storyTableName,
      Item: status,
    };
    await this.client.send(new PutCommand(params));
  }

  async putFeed(feed: FeedsRecord, alias: string): Promise<void> {
    const params = {
      TableName: this.feedTableName,
      Item: {
        ...feed,
        feed_recipient_alias: alias,
      },
    };
    await this.client.send(new PutCommand(params));
  }
  
  async deleteFeed(alias: string, timestamp: number): Promise<void> {
      const params = {
        TableName: this.feedTableName,
        Key: {
          [this.feedRecipientAliasAttr]: alias,
          [this.timestampAttr]: timestamp
        }
      }
      await this.client.send(new DeleteCommand(params))
  }

  async getPageOfStoryItems(
    alias: string,
    pageSize: number,
    lastTimestamp?: number
  ): Promise<{ items: StoriesRecord[]; hasMore: boolean }> {
    const params = {
      TableName: this.storyTableName,
      Limit: pageSize,
      KeyConditionExpression: this.authorAliasAttr + " =  :alias",
      ExpressionAttributeValues: {
        ":alias": alias,
      },
      ScanIndexForward: false,
      ExclusiveStartKey: lastTimestamp
        ? {
            [this.authorAliasAttr]: alias,
            [this.timestampAttr]: lastTimestamp,
          }
        : undefined,
    };

    const data = await this.client.send(new QueryCommand(params));
    const items = data.Items as StoriesRecord[];
    return {
      items,
      hasMore: data.LastEvaluatedKey ? true : false,
    };
  }

  async getPageOfFeedItems(
    alias: string,
    pageSize: number,
    lastTimestamp?: number
  ): Promise<{ items: FeedsRecord[]; hasMore: boolean }> {
    const params = {
      TableName: this.feedTableName,
      Limit: pageSize,
      KeyConditionExpression: this.feedRecipientAliasAttr + " =  :alias",
      ExpressionAttributeValues: {
        ":alias": alias,
      },
      ScanIndexForward: false,
      ExclusiveStartKey: lastTimestamp
        ? {
            [this.feedRecipientAliasAttr]: alias,
            [this.timestampAttr]: lastTimestamp,
          }
        : undefined,
    };

    const data = await this.client.send(new QueryCommand(params));
    const items = data.Items as FeedsRecord[];
    return {
      items,
      hasMore: data.LastEvaluatedKey ? true : false,
    };
  }
}
