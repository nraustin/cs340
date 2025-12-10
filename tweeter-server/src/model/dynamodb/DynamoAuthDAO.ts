import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DeleteCommand,
    GetCommand,
    PutCommand
} from "@aws-sdk/lib-dynamodb";
import { AuthTokenDAO } from "../dao/AuthTokenDAO";
import { TokensRecord } from "../dao/types/TokensRecord";


export class DynamoAuthDAO implements AuthTokenDAO {
    readonly tableName = "tokens";
    readonly authTokenAttr = "auth_token";
    readonly aliasAttr = "alias";
    readonly expirationAttr = "expiration"

    private readonly client;

    constructor(client: DynamoDBClient) {
        this.client = client;
    }

    async addToken(authToken: TokensRecord): Promise<void> {
        const params = {
            TableName: this.tableName,
            Item: authToken
        }
        await this.client.send(new PutCommand(params))
    }

    async getToken(token: string): Promise<TokensRecord | null> {
        const params = {
            TableName: this.tableName,
            Key: {
                [this.authTokenAttr]: token
            }
        }
        console.log(params)
        const data = await this.client.send(new GetCommand(params))
        return data.Item ? data.Item as TokensRecord : null
    }
    
    async deleteToken(testToken: string, token: string): Promise<void> {
        const params = {
            TableName: this.tableName,
            Key: {
                [this.authTokenAttr]: token,
            }
        }
        // console.log(params)
        console.log(testToken)
        await this.client.send(new DeleteCommand(params))
    }
    
}