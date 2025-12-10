import { instance, mock, verify, when } from "@typestrong/ts-mockito";
import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../../src/model.service/StatusService";
import { UserService } from "../../src/model.service/UserService";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../src/presenter/PostStatusPresenter";
import "isomorphic-fetch"

describe("Post status 4b", () => {
  jest.setTimeout(20000);
  it("1) logs in, 2) posts a status, 3) checks success, and 4) checks its presence on the user's story", async () => {
    const userService = new UserService();
    const alias = "@donald1";
    const password = "password";
    // 1
    const [currentUser, authToken]: [User, AuthToken] = await userService.login(
      alias,
      password
    );

    const viewMock = mock<PostStatusView>();
    when(viewMock.displayInfoMessage("Posting status...", 0)).thenReturn(
      "toasted-once"
    );
    when(viewMock.displayInfoMessage("Status posted!", 2000)).thenReturn(
      "toasted-twice"
    );
    const view = instance(viewMock);

    const presenter = new PostStatusPresenter(view);
    const postText = `I'll do it again, goofy ${Date.now()}`;
    // 2
    await presenter.submitPost(postText, currentUser, authToken);

    // 3
    verify(viewMock.displayInfoMessage("Posting status...", 0)).once();
    verify(viewMock.displayInfoMessage("Status posted!", 2000)).once();
    verify(viewMock.setIsLoading(true)).once();
    verify(viewMock.setIsLoading(false)).once();
    verify(viewMock.setPost("")).once();

    const statusService = new StatusService();
    const pageSize = 10;
    const lastItem: Status | null = null;

    // 4
    const [storyItems, hasMore]: [Status[], boolean] =
      await statusService.loadMoreStoryItems(
        authToken,
        currentUser.alias,
        pageSize,
        lastItem
      );

    const status = storyItems.find((story) => story.post === postText);
    expect(status!.user.alias).toBe(currentUser.alias);
    expect(status!.user.firstName).toBe(currentUser.firstName);
    expect(status!.user.lastName).toBe(currentUser.lastName);
  });
});
