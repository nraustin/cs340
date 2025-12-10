import { TweeterRequest } from "./TweeterRequest";

export interface AuthRequest extends TweeterRequest {
    readonly alias: string,
    readonly password: string
}