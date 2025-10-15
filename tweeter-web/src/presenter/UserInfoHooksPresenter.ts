import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface UserInfoHooksView {
    setDisplayedUser: (displayedUser: User) => void,
    navigate: (url: string) => void,
    displayErrorMessage: (message: string) => void
}


export class UserInfoHooksPresenter {
    private _view: UserInfoHooksView;
    private _userService: UserService;

    public constructor(view: UserInfoHooksView){
        this._view = view;
        this._userService = new UserService();
    }

    public async navigateToUser (alias: string, 
                                 displayedUser: User, 
                                 authToken: AuthToken,
                                 featurePath: string): Promise<void> {
        try {
            const toUser = await this._userService.getUser(authToken!, alias);

            if (toUser) {
                if (!toUser.equals(displayedUser!)) {
                    this._view.setDisplayedUser(toUser);
                    this._view.navigate(`${featurePath}/${toUser.alias}`);
                }
            }
        } catch (error) {
            this._view.displayErrorMessage(
            `Failed to get user because of exception: ${error}`
            );
        }
    };
}