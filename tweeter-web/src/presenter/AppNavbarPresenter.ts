import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface AppNavbarView {
    displayInfoMessage: (message: string, duration: number) => string;
    deleteMessage: (message: string) => void;
    displayErrorMessage: (message: string) => void;
    navigate: (url: string) => void;
    clearUserInfo: () => void;
}

export class AppNavbarPresenter {
    private _view: AppNavbarView;
    private _userService: UserService;

    public constructor(view: AppNavbarView){
        this._view = view;
        this._userService = new UserService();
    }

    public async logOut (authToken: AuthToken) {
        const loggingOutToastId = this._view.displayInfoMessage("Logging Out...", 0);

        try {
            await this._userService.logout(authToken!);

            this._view.deleteMessage(loggingOutToastId);
            this._view.clearUserInfo();
            this._view.navigate("/login");
        } catch (error) {
            this._view.displayErrorMessage(
                `Failed to log user out because of exception: ${error}`
            );
        }
    };
}