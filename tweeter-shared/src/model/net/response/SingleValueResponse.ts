import { TweeterResponse } from "./TweeterResponse";

export interface SingleValueResponse<T> extends TweeterResponse {
    readonly val: T | null;
}