import { FollowInfoRequest, SingleValueResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoFactoryDAO } from "../../model/dynamodb/DynamoFactoryDAO";

export const handler = async (
  request: FollowInfoRequest
): Promise<SingleValueResponse<boolean>> => {
  const followService = new FollowService(new DynamoFactoryDAO);
  const val = await followService.getIsFollowerStatus(
    request.token,
    request.user,
    request.selectedUser ?? request.user
  );
  return {
    success: true,
    message: null,
    val: val,
  };
};
