import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";


export interface UserInfoView {
    displayInfoMessage: (message: string, duration: number) => string;
    displayErrorMessage: (message: string) => void;
    deleteMessage: (message: string) => void;
    setDisplayedUser: (user: User) => void;
    setIsLoading: (loading: boolean) => void;
    setIsFollower: (follower: boolean) => void;
    setFolloweeCount: (followeeCount: number) => void;
    setFollowerCount: (followerCount: number) => void;
    navigate: (url: string) => void;
}


export class UserInfoPresenter {
    private _view: UserInfoView;
    private _followService: FollowService;  

    public constructor(view: UserInfoView) {
        this._view = view
        this._followService = new FollowService();
    }

    public async setIsFollowerStatus (
                authToken: AuthToken,
                currentUser: User,
                displayedUser: User
            ) {
        try {
          if (currentUser === displayedUser) {
            this._view.setIsFollower(false);
          } else {
            this._view.setIsFollower(await this._followService.getIsFollowerStatus(authToken!, currentUser!, displayedUser!));
          }
        } catch (error) {
          this._view.displayErrorMessage(
            `Failed to determine follower status because of exception: ${error}`
          );
        }
    };


    public async setNumbFollowees (authToken: AuthToken, displayedUser: User) {
        try {
            this._view.setFolloweeCount(await this._followService.getFolloweeCount(authToken, displayedUser));
        } catch (error) {
            this._view.displayErrorMessage(
                `Failed to get followees count because of exception: ${error}`
            );
        }
    };


    public async setNumbFollowers (authToken: AuthToken, displayedUser: User) {
        try {
        this._view.setFollowerCount(await this._followService.getFollowerCount(authToken, displayedUser));
        } catch (error) {
        this._view.displayErrorMessage(
            `Failed to get followers count because of exception: ${error}`
        );
        }
    };


    public async followDisplayedUser (displayedUser: User, authToken: AuthToken): Promise<void> {
        var followingUserToast = "";

        try {
            this._view.setIsLoading(true);
            followingUserToast = this._view.displayInfoMessage(
                `Following ${displayedUser!.name}...`,
                0
            );

            const [followerCount, followeeCount] = await this._followService.follow(
                authToken!,
                displayedUser!
            );

            this._view.setIsFollower(true);
            this._view.setFollowerCount(followerCount);
            this._view.setFolloweeCount(followeeCount);
        } catch (error) {
            this._view.displayErrorMessage(
                `Failed to follow user because of exception: ${error}`
            );
        } finally {
            this._view.deleteMessage(followingUserToast);
            this._view.setIsLoading(false);
        }
    };


     public async unfollowDisplayedUser (displayedUser: User, authToken: AuthToken): Promise<void> {
        var unfollowingUserToast = "";

        try {
            this._view.setIsLoading(true);
            unfollowingUserToast = this._view.displayInfoMessage(
                `Unfollowing ${displayedUser!.name}...`,
                0
            );

            const [followerCount, followeeCount] = await this._followService.unfollow(
                authToken!,
                displayedUser!
            );

            this._view.setIsFollower(false);
            this._view.setFollowerCount(followerCount);
            this._view.setFolloweeCount(followeeCount);
        } catch (error) {
            this._view.displayErrorMessage(
                `Failed to unfollow user because of exception: ${error}`
            );
        } finally {
            this._view.deleteMessage(unfollowingUserToast);
            this._view.setIsLoading(false);
        }
    };


    public switchToLoggedInUser = (currentUser: User): void => {
        this._view.setDisplayedUser(currentUser!);
        this._view.navigate(`${this.getBaseUrl()}/${currentUser!.alias}`);
    };

    private getBaseUrl = (): string => {
        const segments = location.pathname.split("/@");
        return segments.length > 1 ? segments[0] : "/";
    };

    


}