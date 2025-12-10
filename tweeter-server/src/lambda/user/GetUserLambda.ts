import { SingleValueResponse, UserDto, UserInfoRequest } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoFactoryDAO } from "../../model/dynamodb/DynamoFactoryDAO";

export const handler = async (
  request: UserInfoRequest
): Promise<SingleValueResponse<UserDto>> => {
  const userService = new UserService(new DynamoFactoryDAO);
  const val = await userService.getUser(
    request.token,
    request.alias,
  );
  return {
    success: true,
    message: null,
    val: val,
  };
};
