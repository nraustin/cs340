import { DynamoAuthDAO } from "../dynamodb/DynamoAuthDAO";
import { DynamoFollowDAO } from "../dynamodb/DynamoFollowDAO";
import { DynamoS3DAO } from "../dynamodb/DynamoS3DAO";
import { DynamoStatusDAO } from "../dynamodb/DynamoStatusDAO";
import { DynamoUserDAO } from "../dynamodb/DynamoUserDAO";


export interface FactoryDAO {
    createFollowDAO(): DynamoFollowDAO;
    createUserDAO(): DynamoUserDAO;
    createS3DAO(): DynamoS3DAO;
    createStatusDAO(): DynamoStatusDAO;
    createAuthTokenDAO(): DynamoAuthDAO;
}