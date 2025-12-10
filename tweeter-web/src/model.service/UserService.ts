import {
  AuthRequest,
  AuthToken,
  LogoutRequest,
  RegisterRequest,
  User,
  UserInfoRequest
} from "tweeter-shared";
import { ServerFacade } from "../network/ServerFacade";
import { Service } from "./Service";
import { Buffer } from "buffer";

export class UserService implements Service {
  private serverFacade = new ServerFacade();

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    const request: UserInfoRequest = {
      token: (authToken as any)._token,
      alias: alias,
    };
    return await this.serverFacade.getUser(request);
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    const request: AuthRequest = {
      alias,
      password,
    };
    return await this.serverFacade.login(request);
  }

  public async logout(authToken: AuthToken): Promise<void> {
    console.log(authToken)
    const request: LogoutRequest = {
      token: (authToken as any)._token,
    };
    console.log(request)
    await this.serverFacade.logout(request);
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    // Not neded now, but will be needed when you make the request to the server in milestone 3
    console.log(`user bytes as Unit8: ${userImageBytes}`)
    const imageStringBase64: string =
      Buffer.from(userImageBytes).toString("base64");
    console.log(`user bytes as imageStringBase64: ${imageStringBase64}`)

    const request: RegisterRequest = {
      firstName,
      lastName,
      alias,
      password,
      userImageBytes: imageStringBase64,
      imageFileExtension,
    };
    return await this.serverFacade.register(request);
  }
}
