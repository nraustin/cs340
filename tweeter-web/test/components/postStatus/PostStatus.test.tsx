import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { User, AuthToken } from "tweeter-shared";
import PostStatus from "../../../src/components/postStatus/PostStatus";
import { PostStatusPresenter } from "../../../src/presenter/PostStatusPresenter";
import { useUserInfoContext } from "../../../src/components/userInfo/UserInfoHooks";
import { instance, mock, verify } from "@typestrong/ts-mockito";

jest.mock("../../../src/components/userInfo/UserInfoHooks", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserInfoHooks"),
  __esModule: true,
  useUserInfoContext: jest.fn(),
}));

describe("Post Status Component", () => {
  const mockUser = new User("Test", "User", "@test", "img.png");
  const mockToken = new AuthToken("token", Date.now());
  beforeAll(() => {
    (useUserInfoContext as jest.Mock).mockReturnValue({
      currentUser: mockUser,
      authToken: mockToken,
    });
  });
  it("starts with the post status and clear buttons disabled", () => {
    const { postButton, clearButton } = renderPostStatusAndGetElements();
    expect(postButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("enables both the post status and clear buttons when the text field has text", async () => {
    const { user, postButton, clearButton, text } =
      renderPostStatusAndGetElements();

    await user.type(text, "p");
    expect(postButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  it("disables both buttons when the text field is cleared", async () => {
    const { user, postButton, clearButton, text } =
      renderPostStatusAndGetElements();

    await user.type(text, "p");
    expect(postButton).toBeEnabled();

    await user.clear(text);
    expect(postButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("calls the presenter's submitPost method with correct parameters when Post Status button is clicked", async () => {
    const mockPresenter = mock<PostStatusPresenter>();
    const mockPresenterInstance = instance(mockPresenter);

    const { user, postButton, text } = renderPostStatusAndGetElements(
      mockPresenterInstance
    );

    const content = "a status";
    await user.type(text, content);
    await user.click(postButton);

    verify(mockPresenter.submitPost(content, mockUser, mockToken)).once();
  });
});

beforeAll(() => {
  const mockUser = new User("Test", "User", "@test", "img.png");
  const mockToken = "token";
  (useUserInfoContext as jest.Mock).mockReturnValue({
    currentUser: mockUser,
    authToken: mockToken,
  });
});

function renderPostStatus(presenter?: PostStatusPresenter) {
  return render(
    <>
      {!!presenter ? <PostStatus presenter={presenter} /> : <PostStatus />}
    </>
  );
}

function renderPostStatusAndGetElements(presenter?: PostStatusPresenter) {
  const user = userEvent.setup();

  renderPostStatus(presenter);

  const postButton = screen.getByRole("button", { name: /Post Status/i });
  const clearButton = screen.getByRole("button", { name: /Clear/i });
  const text = screen.getByRole("textbox") as HTMLTextAreaElement;

  return { user, postButton, clearButton, text };
}
