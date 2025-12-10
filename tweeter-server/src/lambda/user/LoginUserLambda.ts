import { AuthRequest, AuthResponse, FollowInfoRequest, SingleValueResponse, UserDto } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoFactoryDAO } from "../../model/dynamodb/DynamoFactoryDAO";

export const handler = async (
  request: AuthRequest
): Promise<AuthResponse> => {
  const userService = new UserService(new DynamoFactoryDAO);
  const [user, authToken] = await userService.login(
    request.alias,
    request.password
  ); 
  return {
    success: true,
    message: null,
    user: user,
    authToken: authToken
  };
};