import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";


export interface LoginView {
    updateUserInfo: (currentUser: User, 
                       displayedUser: User, 
                       authToken: AuthToken, 
                       rememberMe: boolean) => void;
    navigate: (url: string) => void;
    displayErrorMessage: (message: string) => void;
    setIsLoading: (isLoading: boolean) => void;
}

export class LoginPresenter {
    private _view: LoginView;
    private _userService: UserService;

    public constructor(view: LoginView){
        this._view = view;
        this._userService = new UserService();
    }

    public async doLogin(alias: string, 
                         password: string,  
                         rememberMe: boolean,
                         originalUrl?: string,) {
        try{
            this._view.setIsLoading(true);
            const [user, authToken] = await this._userService.login(alias, password);
            this._view.updateUserInfo(user, user, authToken, rememberMe);

        if (!!originalUrl) {
            this._view.navigate(originalUrl);
        } else {
            this._view.navigate(`/feed/${user.alias}`);
        }
        } catch (error) {
            this._view.displayErrorMessage(
                `Failed to log user in because of exception: ${error}`
        );
        } finally {
        this._view.setIsLoading(false);
        }
    };

    public checkSubmitButtonStatus = (alias: string, password: string): boolean => {
        return !alias || !password;
    };

}