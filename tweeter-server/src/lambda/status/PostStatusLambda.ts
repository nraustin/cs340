import { PostStatusRequest, TweeterResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { DynamoFactoryDAO } from "../../model/dynamodb/DynamoFactoryDAO";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const client = new SQSClient();
const queue =
  "https://sqs.us-west-2.amazonaws.com/833145261281/post_status_queue";

export const handler = async (
  request: PostStatusRequest
): Promise<TweeterResponse> => {
  const timestamp = Date.now();
  const statusService = new StatusService(new DynamoFactoryDAO());
  await statusService.postStatus(request.token, request.status, timestamp);

  const params = {
    QueueUrl: queue,
    MessageBody: JSON.stringify({
      author_alias: request.status.user.alias,
      post: request.status.post,
      timestamp,
    }),
  };
  await client.send(new SendMessageCommand(params));
  
  return {
    success: true,
    message: null,
  };
};
