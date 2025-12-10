import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { DynamoFactoryDAO } from "../../model/dynamodb/DynamoFactoryDAO";

const client = new SQSClient();
const queue = "https://sqs.us-west-2.amazonaws.com/833145261281/feed_process_queue";

export const handler = async (event: any): Promise<void> => {
  const followDAO = new DynamoFactoryDAO().createFollowDAO();
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    let lastFollowerAlias: string | null = null;
    // let totalFollowers = 0;
    // let page = 0;
    while (true) {
      const { items, hasMore } = await followDAO.getPageOfFollowers(
        body.author_alias,
        25,
        lastFollowerAlias
      );
      const count = items ? items.length : 0;
      if (!items || items.length == 0) {
        break;
      }

    //   totalFollowers += count;
    //   page++;

      const followerAliases = items.map(
        (follower) => follower.follower_handle as string
      );
      const params = {
        QueueUrl: queue,
        MessageBody: JSON.stringify({
          author_alias: body.author_alias,
          post: body.post,
          timestamp: body.timestamp,
          follower_aliases: followerAliases,
        }),
      };
      await client.send(new SendMessageCommand(params));
      if (!hasMore) {
        break;
      }
      lastFollowerAlias = items[items.length - 1].follower_handle;
    }
    //  console.log(
    //   `PostProcessLambda total followers fetched ${totalFollowers}`
    // );
  }
};
