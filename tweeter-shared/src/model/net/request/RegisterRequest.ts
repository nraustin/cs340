import { AuthRequest } from "./AuthRequest";

export interface RegisterRequest extends AuthRequest {
    readonly firstName: string,
    readonly lastName: string,
    readonly userImageBytes: string,
    readonly imageFileExtension: string
}