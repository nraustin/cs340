import { LogoutRequest, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoFactoryDAO } from "../../model/dynamodb/DynamoFactoryDAO";

export const handler = async (
  request: LogoutRequest
): Promise<TweeterResponse> => {
  const userService = new UserService(new DynamoFactoryDAO);
 console.log("LogoutRequest raw:", JSON.stringify(request, null, 2));
  console.log("request.token:", request.token);
  await userService.logout(request.token);
  return {
        success: true,
        message: null,
    }
};