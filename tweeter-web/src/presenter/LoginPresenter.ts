import {
  AuthenticationPresenter,
  AuthenticationView,
} from "./AuthenticationPresenter";

export interface LoginView extends AuthenticationView {}

export class LoginPresenter extends AuthenticationPresenter<LoginView> {
  public constructor(view: AuthenticationView) {
    super(view);
  }
  public async doLogin(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl?: string
  ) {
    await this.doAuthenticationOperation(
      async () => this.userService.login(alias, password),
      { rememberMe, originalUrl },
      "login"
    );
  }
  public checkSubmitButtonStatus = (
    alias: string,
    password: string
  ): boolean => {
    return !alias || !password;
  };
}
