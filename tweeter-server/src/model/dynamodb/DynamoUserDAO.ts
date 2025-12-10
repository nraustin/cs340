import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput
} from "@aws-sdk/lib-dynamodb";
import { UsersRecord } from "../dao/types/UsersRecord";
import { UserDAO } from "../dao/UserDAO";

export class DynamoUserDAO implements UserDAO {
  readonly tableName = "users";
  readonly firstNameAttr = "first_name";
  readonly lastNameAttr = "last_name";
  readonly aliasAttr = "alias";
  readonly passwordAttr = "password";
  readonly imageUrlAttr = "image_url";
  readonly followerCountAttr = "follower_count";
  readonly followeeCountAttr = "followee_count";

  private readonly client;

  constructor(client: DynamoDBClient) {
    this.client = client;
  }

  async putUser(user: UsersRecord): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: user,
    };
    await this.client.send(new PutCommand(params));
  }

  async getUser(alias: string): Promise<UsersRecord | null> {
    console.log("DynamoUserDAO.getUser called with alias:", alias);
    const params = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttr]: alias,
      },
    };
    console.log("DynamoUserDAO.getUser params:", JSON.stringify(params));
    const data = await this.client.send(new GetCommand(params));
    return data.Item as UsersRecord | null;
  }

  async updateCount(
    alias: string,
    attribute: string,
    value: number
  ): Promise<UsersRecord> {
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttr]: alias,
      },
      UpdateExpression: "ADD #attr :val",
      ExpressionAttributeNames: {
        "#attr": attribute,
      },
      ExpressionAttributeValues: {
        ":val": value,
      },
      ReturnValues: "ALL_NEW",
    };

    const updatedUser = await this.client.send(new UpdateCommand(params));
    const record = updatedUser.Attributes as UsersRecord;
    return record;
  }
}
