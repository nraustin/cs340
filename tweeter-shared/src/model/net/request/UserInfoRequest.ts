import { TweeterRequest } from "./TweeterRequest";

export interface UserInfoRequest extends TweeterRequest{
    readonly token: string,
    readonly alias: string
}