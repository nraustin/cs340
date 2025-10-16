import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { MessageView, Presenter } from "./Presenter";

export interface UserInfoView extends MessageView {
  setDisplayedUser: (user: User) => void;
  setIsLoading: (loading: boolean) => void;
  setIsFollower: (follower: boolean) => void;
  setFolloweeCount: (followeeCount: number) => void;
  setFollowerCount: (followerCount: number) => void;
  navigate: (url: string) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
  private _followService: FollowService;

  public constructor(view: UserInfoView) {
    super(view);
    this._followService = new FollowService();
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    await this.doFailureReportingOperation(async () => {
      if (currentUser === displayedUser) {
        this._view.setIsFollower(false);
      } else {
        this._view.setIsFollower(
          await this._followService.getIsFollowerStatus(
            authToken!,
            currentUser!,
            displayedUser!
          )
        );
      }
    }, "determine follower status");
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    await this.doFailureReportingOperation(async () => {
      this._view.setFolloweeCount(
        await this._followService.getFolloweeCount(authToken, displayedUser)
      );
    }, "get followees count");
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    await this.doFailureReportingOperation(async () => {
      this._view.setFollowerCount(
        await this._followService.getFollowerCount(authToken, displayedUser)
      );
    }, "get followers count");
  }

  public async doFollowOperation(
    displayedUser: User,
    action: "follow" | "unfollow",
    operation: () => Promise<[number, number]>,
    follower: boolean
  ): Promise<void> {
    var userActionToast = "";
    try {
      await this.doFailureReportingOperation(async () => {
        this._view.setIsLoading(true);
        userActionToast = this._view.displayInfoMessage(
          `${action === "follow" ? "Following" : "Unfollowing"} ${
            displayedUser!.name
          }...`,
          0
        );
        const [followerCount, followeeCount] = await operation();

        this._view.setIsFollower(follower);
        this._view.setFollowerCount(followerCount);
        this._view.setFolloweeCount(followeeCount);
      }, `${action} user`);
    } finally {
      this._view.deleteMessage(userActionToast);
      this._view.setIsLoading(false);
    }
  }

  public async followDisplayedUser(
    displayedUser: User,
    authToken: AuthToken
  ): Promise<void> {
    return this.doFollowOperation(
      displayedUser,
      "follow",
      () => this._followService.follow(authToken, displayedUser),
      true
    );
  }

  public async unfollowDisplayedUser(
    displayedUser: User,
    authToken: AuthToken
  ): Promise<void> {
    return this.doFollowOperation(
      displayedUser,
      "unfollow",
      () => this._followService.unfollow(authToken, displayedUser),
      false
    );
  }

  public switchToLoggedInUser = (currentUser: User): void => {
    this._view.setDisplayedUser(currentUser!);
    this._view.navigate(`${this.getBaseUrl()}/${currentUser!.alias}`);
  };

  private getBaseUrl = (): string => {
    const segments = location.pathname.split("/@");
    return segments.length > 1 ? segments[0] : "/";
  };
}
