import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";

export interface AuthenticationView extends View {
  navigate: (url: string) => void;
  updateUserInfo: (
    currentUsere: any,
    displayedUser: any,
    authToken: any,
    rememberMe: boolean
  ) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export abstract class AuthenticationPresenter<V extends AuthenticationView> extends Presenter<V> {
  private _userService = new UserService();

  protected get userService() {
    return this._userService;
  }

  protected async doAuthenticationOperation(
    operation: () => Promise<[User, AuthToken]>,
    options: { rememberMe: boolean; originalUrl?: string },
    operationDescription: string
  ) {
    await this.doFailureReportingOperation(async () => {
      this._view.setIsLoading(true);
      try {
        const [user, authToken] = await operation();
        this._view.updateUserInfo(user, user, authToken, options.rememberMe);

        if (!!options.originalUrl) {
          this._view.navigate(options.originalUrl);
        } else {
          this._view.navigate(`/feed/${user.alias}`);
        }
      } finally {
        this._view.setIsLoading(false);
      }
    }, operationDescription);
  }
}
