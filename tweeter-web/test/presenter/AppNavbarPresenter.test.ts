import {
    anything,
    instance,
    mock,
    spy,
    verify,
    when
} from "@typestrong/ts-mockito";
import { AuthToken } from "tweeter-shared";
import { UserService } from "../../src/model.service/UserService";
import {
    AppNavbarPresenter,
    AppNavbarView,
} from "../../src/presenter/AppNavbarPresenter";

describe("AppNavbarPresenter", () => {
  let mockAppNavbarPresenterView: AppNavbarView;
  let appNavbarPresenter: AppNavbarPresenter;
  let mockUserService: UserService;

  const authToken = new AuthToken("token", Date.now());

  beforeEach(() => {
    mockAppNavbarPresenterView = mock<AppNavbarView>();
    const mockAppNavbarPresenterViewInstance = instance(
      mockAppNavbarPresenterView
    );
    when(
      mockAppNavbarPresenterView.displayInfoMessage(anything(), 0)
    ).thenReturn("messageId123");

    const appNavbarPresenterSpy = spy(
      new AppNavbarPresenter(mockAppNavbarPresenterViewInstance)
    );
    appNavbarPresenter = instance(appNavbarPresenterSpy);

    mockUserService = mock<UserService>();
    when(appNavbarPresenterSpy.userService).thenReturn(
      instance(mockUserService)
    );
  });
  it("tells the view to display a logging out message", async () => {
    await appNavbarPresenter.logOut(authToken);
    verify(
      mockAppNavbarPresenterView.displayInfoMessage("Logging Out...", 0)
    ).once();
  });
  it("calls logout on the user service with the correct auth token", async () => {
    await appNavbarPresenter.logOut(authToken);
    verify(mockUserService.logout(authToken)).once();
  });
  it("tells the view to clear the info message that was displayed previously, clear the user info, and navigate to the login page when successful", async () => {
    await appNavbarPresenter.logOut(authToken);
    verify(mockAppNavbarPresenterView.deleteMessage("messageId123")).once();
    verify(mockAppNavbarPresenterView.clearUserInfo()).once();
    verify(mockAppNavbarPresenterView.navigate("/login")).once();

    verify(mockAppNavbarPresenterView.displayErrorMessage(anything())).never();
  });
  it("tells the view to display an error message and does not tell it to clear the info message, clear the user info or navigate to the login page when logout fails", async () => {
    let error = new Error("An error occurred");
    when(mockUserService.logout(anything())).thenThrow(error);

    await appNavbarPresenter.logOut(authToken);

    verify(mockAppNavbarPresenterView.deleteMessage(anything())).never();
    verify(
      mockAppNavbarPresenterView.displayErrorMessage(
        `Failed to log out because of exception: ${error}`
      )
    ).once();
    verify(mockAppNavbarPresenterView.clearUserInfo()).never();
    verify(mockAppNavbarPresenterView.navigate("/login")).never();
  });
});
