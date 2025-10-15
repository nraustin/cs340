import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface UserItemView {
    addItems: (newItems: User[]) => void;
    displayErrorMessage: (message: string) => void;
}

export abstract class UserItemPresenter {
    private _hasMoreItems: boolean = true;
    private _lastItem: User | null = null;
    private _view: UserItemView;
    private _userService: UserService;

    protected constructor(view: UserItemView) {
        this._view = view;
        this._userService = new UserService();
    }

    protected get view() {
        return this._view;
    }

    protected get lastItem() {
        return this._lastItem;
    }

    protected set lastItem(value: User | null) {
        this._lastItem = value;
    }

    public get hasMoreItems() {
        return this._hasMoreItems;
    }

    protected set hasMoreItems(value: boolean) {
        this._hasMoreItems = value;
    }

    reset() {
      this.lastItem = null;
      this.hasMoreItems = true;
    }

    public async getUser (
         authToken: AuthToken,
         alias: string
        ): Promise<User | null> {
         // TODO: Replace with the result of calling server
         return this._userService.getUser(authToken, alias);
    };

    public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;
}