import { TweeterResponse } from "./TweeterResponse";


export interface FollowCountsResponse extends TweeterResponse {
    readonly followerCount: number,
    readonly followeeCount: number
}