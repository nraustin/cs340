import { TweeterRequest } from "./TweeterRequest";

export interface PagedItemRequest<T> extends TweeterRequest{
    readonly token: string,
    readonly userAlias: string,
    readonly pageSize: number,
    readonly lastItem: T | null,
}