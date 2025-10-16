import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";

export interface UserInfoHooksView extends View {
  setDisplayedUser: (displayedUser: User) => void;
  navigate: (url: string) => void;
}

export class UserInfoHooksPresenter extends Presenter<UserInfoHooksView> {
  private _userService: UserService;

  public constructor(view: UserInfoHooksView) {
    super(view);
    this._userService = new UserService();
  }

  public async navigateToUser(
    alias: string,
    displayedUser: User,
    authToken: AuthToken,
    featurePath: string
  ): Promise<void> {
    this.doFailureReportingOperation(async () => {
      const toUser = await this._userService.getUser(authToken!, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          this._view.setDisplayedUser(toUser);
          this._view.navigate(`${featurePath}/${toUser.alias}`);
        }
      }
    }, "get user");
  }
}
