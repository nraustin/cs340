import {
  AuthRequest,
  AuthResponse,
  AuthToken,
  FollowCountsResponse,
  FollowInfoRequest,
  LogoutRequest,
  PagedItemRequest,
  PagedItemResponse,
  PostStatusRequest,
  RegisterRequest,
  SingleValueResponse,
  Status,
  TweeterRequest,
  TweeterResponse,
  User,
  UserDto,
  UserInfoRequest,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";
import { StatusDto } from "tweeter-shared/dist/model/dto/StatusDto";
import { Buffer } from "buffer";

export class ServerFacade {
  private SERVER_URL =
    "https://precebjgyl.execute-api.us-west-2.amazonaws.com/dev";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  private async callServer<
    REQ extends TweeterRequest,
    RES extends TweeterResponse
  >(request: REQ, endpoint: string): Promise<RES> {
    const response = await this.clientCommunicator.doPost<REQ, RES>(
      request,
      endpoint
    );
    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
    return response;
  }

  private async getPagedItems<T, K>(
    request: PagedItemRequest<T>,
    endpoint: string,
    fromDto: (dto: T) => K,
    itemType: string
  ): Promise<[K[], boolean]> {
    const response = await this.callServer<
      PagedItemRequest<T>,
      PagedItemResponse<T>
    >(request, endpoint);

    const items: K[] | null =
      response.success && response.items
        ? response.items.map((dto) => fromDto(dto))
        : null;

    if (items == null) {
      throw new Error(`No f${itemType} found`);
    } else {
      return [items, response.hasMore];
    }
  }

  public async getMoreFollowees(
    request: PagedItemRequest<UserDto>
  ): Promise<[User[], boolean]> {
    return this.getPagedItems<UserDto, User>(
      request,
      "/followee/list",
      (dto) => User.fromDto(dto) as User,
      "followees"
    );
  }

  public async getMoreFollowers(
    request: PagedItemRequest<UserDto>
  ): Promise<[User[], boolean]> {
    return this.getPagedItems<UserDto, User>(
      request,
      "/follower/list",
      (dto) => User.fromDto(dto) as User,
      "followers"
    );
  }

  public async getMoreStoryItems(
    request: PagedItemRequest<StatusDto>
  ): Promise<[Status[], boolean]> {
    return this.getPagedItems<StatusDto, Status>(
      request,
      "/story/list",
      (dto) => Status.fromDto(dto) as Status,
      "story items"
    );
  }

  public async getMoreFeedItems(
    request: PagedItemRequest<StatusDto>
  ): Promise<[Status[], boolean]> {
    return this.getPagedItems<StatusDto, Status>(
      request,
      "/feed/list",
      (dto) => Status.fromDto(dto) as Status,
      "feed items"
    );
  }

  public async postStatus(request: PostStatusRequest): Promise<void> {
    await this.callServer<PostStatusRequest, TweeterResponse>(request, "/post");
  }

  public async getIsFollower(request: FollowInfoRequest): Promise<boolean> {
    const response = await this.callServer<
      FollowInfoRequest,
      SingleValueResponse<boolean>
    >(request, "/follower/isFollower");
    return response.val!;
  }

  public async getFollowerCount(request: FollowInfoRequest): Promise<number> {
    const response = await this.callServer<
      FollowInfoRequest,
      SingleValueResponse<number>
    >(request, "/follower/followerCount");
    return response.val!;
  }

  public async getFolloweeCount(request: FollowInfoRequest): Promise<number> {
    const response = await this.callServer<
      FollowInfoRequest,
      SingleValueResponse<number>
    >(request, "/followee/followeeCount");
    return response.val!;
  }

  public async follow(
    request: FollowInfoRequest
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response = await this.callServer<
      FollowInfoRequest,
      FollowCountsResponse
    >(request, "/follow/followUser");

    return [response.followerCount, response.followeeCount];
  }

  public async unfollow(
    request: FollowInfoRequest
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response = await this.callServer<
      FollowInfoRequest,
      FollowCountsResponse
    >(request, "/follow/unfollowUser");

    return [response.followerCount, response.followeeCount];
  }

  public async getUser(request: UserInfoRequest): Promise<User | null> {
    const response = await this.callServer<
      UserInfoRequest,
      SingleValueResponse<UserDto | null>
    >(request, "/user/getUser");
    if (!response.val) {
      return null;
    }
    return User.fromDto(response.val) as User;
  }

  public async login(request: AuthRequest): Promise<[User, AuthToken]> {
    const response = await this.callServer<AuthRequest, AuthResponse>(
      request,
      "/user/login"
    );
    const user = User.fromDto(response.user as UserDto) as User;
    if (user === null) {
      throw new Error("Invalid alias or password");
    }
    return [user, response.authToken];
  }

  public async logout(request: LogoutRequest): Promise<void> {
    console.log(request)
    await this.callServer<LogoutRequest, TweeterResponse>(
      request,
      "/user/logout"
    );
  }

  public async register(request: RegisterRequest): Promise<[User, AuthToken]> {
    const convertedRequest = {
      ...request,
      userImageBytes: request.userImageBytes
    };
    const response = await this.callServer<
      typeof convertedRequest,
      AuthResponse
    >(convertedRequest, "/user/register");
    const user = User.fromDto(response.user as UserDto) as User;
    if (user === null) {
      throw new Error("Invalid registration");
    }
    return [user, response.authToken];
  }
}
