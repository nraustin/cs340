import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { FactoryDAO } from "../dao/FactoryDAO";
import { DynamoAuthDAO } from "./DynamoAuthDAO";
import { DynamoFollowDAO } from "./DynamoFollowDAO";
import { DynamoS3DAO } from "./DynamoS3DAO";
import { DynamoStatusDAO } from "./DynamoStatusDAO";
import { DynamoUserDAO } from "./DynamoUserDAO";

export class DynamoFactoryDAO implements FactoryDAO {

    private readonly client;

    constructor() {
        this.client = DynamoDBDocumentClient.from(new DynamoDBClient())
    }

    createFollowDAO(): DynamoFollowDAO {
        return new DynamoFollowDAO(this.client);
    }
    createUserDAO(): DynamoUserDAO {
        return new DynamoUserDAO(this.client);
    }
    createS3DAO(): DynamoS3DAO {
        return new DynamoS3DAO();
    }
    createStatusDAO(): DynamoStatusDAO {
        return new DynamoStatusDAO(this.client);
    }
    createAuthTokenDAO(): DynamoAuthDAO {
        return new DynamoAuthDAO(this.client);
    }
    
}