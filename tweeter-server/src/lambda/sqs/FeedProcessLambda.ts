import { FeedsRecord } from "../../model/dao/types/FeedsRecord";
import { DynamoFactoryDAO } from "../../model/dynamodb/DynamoFactoryDAO";

export const handler = async (event: any): Promise<void> => {
  const statusDAO = new DynamoFactoryDAO().createStatusDAO();
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    for (const followerAlias of body.follower_aliases) {
      const feedRecord: FeedsRecord = {
        post: body.post,
        author_alias: body.author_alias,
        feed_recipient_alias: followerAlias,
        timestamp: body.timestamp,
      };

      await statusDAO.putFeed(feedRecord, followerAlias);
    }
  }
};
