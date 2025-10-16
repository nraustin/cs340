import { AuthToken, User } from "tweeter-shared";
import { PAGE_SIZE, PagedItemView } from "./PagedItemPresenter";
import { UserItemPresenter } from "./UserItemPresenter";

export class FollowerPresenter extends UserItemPresenter {
  protected itemDescription(): string {
    return "load followers";
  }

  protected getMoreItems(
    authToken: AuthToken,
    userAlias: string
  ): Promise<[User[], boolean]> {
    return this.service.loadMoreFollowers(
      authToken,
      userAlias,
      PAGE_SIZE,
      this.lastItem
    );
  }
}
