import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";
import { FollowDAO } from "../dao/FollowDAO";
import { FollowsRecord } from "../dao/types/FollowsRecord";

export class DynamoFollowDAO implements FollowDAO {
  readonly tableName = "follows";
  readonly indexName = "follows_index";
  readonly followerHandleAttr = "follower_handle";
  readonly followeeHandleAttr = "followee_handle";

  private readonly client;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  async getPageOfFollowees(
    followerAlias: string,
    pageSize: number,
    lastFolloweeAlias: string | null
  ): Promise<{ items: FollowsRecord[]; hasMore: boolean }> {
    const params = {
      TableName: this.tableName,
      Limit: pageSize,
      KeyConditionExpression: this.followerHandleAttr + " =  :fwrHandle",
      ExpressionAttributeValues: {
        ":fwrHandle": followerAlias,
      },
      ExclusiveStartKey: lastFolloweeAlias
        ? {
            [this.followerHandleAttr]: followerAlias,
            [this.followeeHandleAttr]: lastFolloweeAlias,
          }
        : undefined,
    };

    const data = await this.client.send(new QueryCommand(params));
    const items = data.Items as FollowsRecord[];
    return {
      items,
      hasMore: data.LastEvaluatedKey ? true : false,
    };
  }

  async getPageOfFollowers(
    followeeAlias: string,
    pageSize: number,
    lastFollowerAlias: string | null
  ): Promise<{ items: FollowsRecord[]; hasMore: boolean }> {
    const params = {
      IndexName: this.indexName,
      TableName: this.tableName,
      Limit: pageSize,
      KeyConditionExpression: this.followeeHandleAttr + " =  :fweHandle",
      ExpressionAttributeValues: {
        ":fweHandle": followeeAlias,
      },
      ExclusiveStartKey: lastFollowerAlias
        ? {
            [this.followeeHandleAttr]: followeeAlias,
            [this.followerHandleAttr]: lastFollowerAlias,
          }
        : undefined,
    };

    const data = await this.client.send(new QueryCommand(params));
    const items = data.Items as FollowsRecord[];
    return {
      items,
      hasMore: data.LastEvaluatedKey ? true : false,
    };
  }
  async getFollows(follows: FollowsRecord): Promise<FollowsRecord | null> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerHandleAttr]: follows.follower_handle,
        [this.followeeHandleAttr]: follows.followee_handle,
      },
    };
    const res = await this.client.send(new GetCommand(params));
    return res.Item ? (res.Item as FollowsRecord) : null;
  }

  async putFollows(follows: FollowsRecord): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: follows,
    };
    await this.client.send(new PutCommand(params));
  }

  async deleteFollows(follows: FollowsRecord): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerHandleAttr]: follows.follower_handle,
        [this.followeeHandleAttr]: follows.followee_handle,
      },
    };
    await this.client.send(new DeleteCommand(params));
  }
}
