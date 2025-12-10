import { FollowCountsResponse, FollowInfoRequest } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoFactoryDAO } from "../../model/dynamodb/DynamoFactoryDAO";

export const handler = async (request: FollowInfoRequest): Promise<FollowCountsResponse> => {
    const followService = new FollowService(new DynamoFactoryDAO);
    const [followerCount, followeeCount]= await followService.follow(request.token, request.user);
    return {
        success: true,
        message: null,
        followerCount: followerCount,
        followeeCount: followeeCount
    }
}