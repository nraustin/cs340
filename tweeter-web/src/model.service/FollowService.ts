import {
  FollowInfoRequest,
  PagedItemRequest,
  User,
  UserDto
} from "tweeter-shared";
import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { ServerFacade } from "../network/ServerFacade";
import { Service } from "./Service";

export class FollowService implements Service {
  private serverFacade = new ServerFacade();

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request: PagedItemRequest<UserDto> = {
      token: (authToken as any)._token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };
    return await this.serverFacade.getMoreFollowees(request);
  }

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request: PagedItemRequest<UserDto> = {
      token: (authToken as any)._token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };
    return await this.serverFacade.getMoreFollowers(request);
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    const request: FollowInfoRequest = {
      token: (authToken as any)._token,
      user: user.dto,
      selectedUser: selectedUser ? selectedUser.dto : undefined,
    };
    return await this.serverFacade.getIsFollower(request);
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    const request: FollowInfoRequest = {
      token: (authToken as any)._token,
      user: user.dto,
    };
    return await this.serverFacade.getFolloweeCount(request);
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    const request: FollowInfoRequest = {
      token: (authToken as any)._token,
      user: user.dto,
    };
    return await this.serverFacade.getFollowerCount(request);
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const request: FollowInfoRequest = {
      token: (authToken as any)._token,
      user: userToFollow.dto,
    };
    return await this.serverFacade.follow(request);
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const request: FollowInfoRequest = {
      token: (authToken as any)._token,
      user: userToUnfollow.dto,
    };
    return await this.serverFacade.unfollow(request);
  }
}
