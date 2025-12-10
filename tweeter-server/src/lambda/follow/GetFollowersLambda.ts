import { PagedItemRequest, PagedItemResponse, User, UserDto } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoFactoryDAO } from "../../model/dynamodb/DynamoFactoryDAO";

export const handler = async (request: PagedItemRequest<UserDto>): Promise<PagedItemResponse<UserDto>> => {
    const followService = new FollowService(new DynamoFactoryDAO);
    const [items, hasMore] = await followService.loadMoreFollowers(request.token, request.userAlias, request.pageSize, request.lastItem);
    return {
        success: true,
        message: null,
        items: items,
        hasMore: hasMore
    }
}