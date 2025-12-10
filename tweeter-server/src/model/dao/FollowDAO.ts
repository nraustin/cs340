import { FollowsRecord } from "./types/FollowsRecord";

export interface FollowDAO {
  getPageOfFollowees(
    followerAlias: string,
    pageSize: number,
    lastFolloweeAlias: string | null
  ): Promise<{ items: FollowsRecord[]; hasMore: boolean }>;
  getPageOfFollowers(
    followeeAlias: string,
    pageSize: number,
    lastFollowerAlias: string | null
  ): Promise<{ items: FollowsRecord[]; hasMore: boolean}>;
  getFollows(follows: FollowsRecord): Promise<FollowsRecord | null>;
  putFollows(follows: FollowsRecord): Promise<void>;
  deleteFollows(follows: FollowsRecord): Promise<void>;
}
