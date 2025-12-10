import { User, UserDto } from "tweeter-shared";
import { FactoryDAO } from "../dao/FactoryDAO";
import { FollowsRecord } from "../dao/types/FollowsRecord";
import { AuthService } from "./AuthService";
import { Service } from "./Service";
import { deleteOldFeedItems, loadItemsPage } from "./Util";

export class FollowService implements Service {
  private followDAO;
  private authTokenDAO;
  private userDAO;
  private statusDAO;
  private authService;

  constructor(factory: FactoryDAO) {
    this.authTokenDAO = factory.createAuthTokenDAO();
    this.followDAO = factory.createFollowDAO();
    this.userDAO = factory.createUserDAO();
    this.statusDAO = factory.createStatusDAO();
    this.authService = new AuthService(factory);
  }

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    return loadItemsPage<UserDto, FollowsRecord>(
      token,
      userAlias,
      pageSize,
      lastItem,
      this.authService,
      true,
      (alias) => this.userDAO.getUser(alias),
      (alias, size, lastAttribute) =>
        this.followDAO.getPageOfFollowees(
          alias,
          size,
          typeof lastAttribute === "string" ? lastAttribute : null
        ),
      (last) => last?.alias || null,
      (item) => item.followee_handle
    );
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    return loadItemsPage<UserDto, FollowsRecord>(
      token,
      userAlias,
      pageSize,
      lastItem,
      this.authService,
      true,
      (alias) => this.userDAO.getUser(alias),
      (alias, size, lastAttr) =>
        this.followDAO.getPageOfFollowers(
          alias,
          size,
          typeof lastAttr === "string" ? lastAttr : null
        ),
      (last) => last?.alias ?? null,
      (item) => item.follower_handle
    );
  }

  public async getIsFollowerStatus(
    token: string,
    user: UserDto,
    selectedUser: UserDto
  ): Promise<boolean> {
    await this.authService.validateAuthToken(token);

    const res = await this.followDAO.getFollows({
      follower_handle: user.alias,
      followee_handle: selectedUser.alias,
    });
    return res !== null;
  }

  public async getFolloweeCount(token: string, user: UserDto): Promise<number> {
    await this.authService.validateAuthToken(token);
    const record = await this.userDAO.getUser(user.alias);
    return record!.followee_count;
  }

  public async getFollowerCount(token: string, user: UserDto): Promise<number> {
    await this.authService.validateAuthToken(token);
    const record = await this.userDAO.getUser(user.alias);
    return record!.follower_count;
  }

  public async follow(
    token: string,
    userToFollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    await this.authService.validateAuthToken(token);
    const authToken = await this.authTokenDAO.getToken(token);
    const follower = await this.userDAO.updateCount(
      authToken!.alias,
      "followee_count",
      1
    );
    const followee = await this.userDAO.updateCount(
      userToFollow.alias,
      "follower_count",
      1
    );

    await this.followDAO.putFollows({
      follower_handle: follower.alias,
      followee_handle: followee.alias,
    });

    return [followee.follower_count, followee.followee_count];
  }

  public async unfollow(
    token: string,
    userToUnfollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    await this.authService.validateAuthToken(token);
    const authToken = await this.authTokenDAO.getToken(token);
    const follower = await this.userDAO.updateCount(
      authToken!.alias,
      "followee_count",
      -1
    );
    const followee = await this.userDAO.updateCount(
      userToUnfollow.alias,
      "follower_count",
      -1
    );

    await this.followDAO.deleteFollows({
      follower_handle: follower.alias,
      followee_handle: followee.alias,
    });

    // await deleteOldFeedItems(follower.alias, followee.alias, this.statusDAO)

    return [followee.follower_count, followee.followee_count];
  }
}
