import { FollowInfoRequest, SingleValueResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoFactoryDAO } from "../../model/dynamodb/DynamoFactoryDAO";

export const handler = async (request: FollowInfoRequest): Promise<SingleValueResponse<number>> => {
    const followService = new FollowService(new DynamoFactoryDAO);
    const val = await followService.getFollowerCount(request.token, request.user);
    console.log("follower count", val)
    return {
        success: true,
        message: null,
        val: val
    }
}