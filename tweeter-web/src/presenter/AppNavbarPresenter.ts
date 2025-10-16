import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { MessageView, Presenter, View } from "./Presenter";

export interface AppNavbarView extends MessageView{
  navigate: (url: string) => void;
  clearUserInfo: () => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
  private _userService: UserService;

  public constructor(view: AppNavbarView) {
    super(view);
    this._userService = new UserService();
  }

  public async logOut(authToken: AuthToken) {
    const loggingOutToastId = this._view.displayInfoMessage(
      "Logging Out...",
      0
    );
    await this.doFailureReportingOperation(async () => {
      await this._userService.logout(authToken!);

      this._view.deleteMessage(loggingOutToastId);
      this._view.clearUserInfo();
      this._view.navigate("/login");
    }, "log out");
  }
}
