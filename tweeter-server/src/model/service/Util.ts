import { Status, User, UserDto } from "tweeter-shared";
import { StatusDto } from "tweeter-shared/dist/model/dto/StatusDto";
import { AuthService } from "./AuthService";
import { UsersRecord } from "../dao/types/UsersRecord";
import { StoriesRecord } from "../dao/types/StoriesRecord";
import { FeedsRecord } from "../dao/types/FeedsRecord";
import { DynamoStatusDAO } from "../dynamodb/DynamoStatusDAO";

export async function loadItemsPage<D extends UserDto | StatusDto, R>(
  token: string,
  userAlias: string,
  pageSize: number,
  lastItem: D | null,
  authService: AuthService,
  userItem: boolean,
  getUser: (alias: string) => Promise<UsersRecord | null>,
  pageLoader: (
    alias: string,
    size: number,
    lastAttribute: number | string | null
  ) => Promise<{ items: R[]; hasMore: boolean }>,
  getLastAttribute: (lastItem: D | null) => number | string | null,
  getUserAlias: (item: R) => string
): Promise<[D[], boolean]> {
  await authService.validateAuthToken(token);

  const lastAttribute = getLastAttribute(lastItem);
  const data = await pageLoader(userAlias, pageSize, lastAttribute);

  const users = data.items.map((item) => getUser(getUserAlias(item)));
  const records = await Promise.all(users);

  const dtos: D[] = [];
  for (let i = 0; i < data.items.length; i++) {
    const record = records[i];
    if (!record) {
      continue;
    }
    const user = new User(
      record.first_name,
      record.last_name,
      record.alias,
      record.image_url
    );

    if (userItem) {
      dtos.push(user.dto as D);
    } else {
      // Not so great typing logic, needs to be refactored prob
      const item = data.items[i] as StoriesRecord | FeedsRecord;
      const status = new Status(item.post, user, item.timestamp);
      dtos.push(status.dto as D);
    }
  }

  return [dtos, data.hasMore];
}

export async function deleteOldFeedItems(
    feedRecipientAlias: string,
    authorAlias: string,
    statusDAO: DynamoStatusDAO
  ): Promise<void> {
    let lastTimestamp: number | undefined = undefined;

    while (true) {
      const { items, hasMore } = await statusDAO.getPageOfFeedItems(
        feedRecipientAlias,
        25,               
        lastTimestamp
      );

      if (items.length === 0) break;
      const toDelete = (items as FeedsRecord[]).filter(
        (item) => item.author_alias === authorAlias
      );
      console.log("in delete old feed func", toDelete);
      await Promise.all(
        toDelete.map((item) =>
          statusDAO.deleteFeed(feedRecipientAlias, item.timestamp)
        )
      );

      if (!hasMore) break;
      lastTimestamp = items[items.length -1].timestamp;
    }
  }

// No mas
export async function getFakeData<T, K>(
  lastItem: T | null,
  pageSize: number,
  opts: {
    fromDto: (dto: T | null) => K | null;
    operation: (key: K | null, size: number) => [K[], boolean];
    toDto: (item: K) => T;
  }
): Promise<[T[], boolean]> {
  const key = opts.fromDto(lastItem);
  const [items, hasMore] = opts.operation(key, pageSize);
  const dtos = items.map(opts.toDto);
  return [dtos, hasMore];
}
