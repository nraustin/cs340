import { FeedsRecord } from "./types/FeedsRecord";
import { StoriesRecord } from "./types/StoriesRecord";

export interface StatusDAO {
    putStory(status: StoriesRecord): Promise<void>;
    putFeed(status: FeedsRecord, alias: string): Promise<void>
    getPageOfStoryItems(alias: string,
        pageSize: number,
        lastTimestamp?: number
    ): Promise<{ items: StoriesRecord[]; hasMore: boolean}>
    getPageOfFeedItems(alias: string,
        pageSize: number,
        lastTimestamp?: number
    ): Promise<{ items: FeedsRecord[]; hasMore: boolean}>,
    deleteFeed(alias: string, timestamp: number): Promise<void>;
}