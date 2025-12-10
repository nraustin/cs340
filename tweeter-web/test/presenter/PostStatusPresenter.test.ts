import { anything, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import { StatusService } from "../../src/model.service/StatusService";
import { PostStatusPresenter, PostStatusView } from "../../src/presenter/PostStatusPresenter";
import { AuthToken, User } from "tweeter-shared";


describe("PostStatusPresenter", () => {
    let mockPostStatusPresenterView: PostStatusView;
    let postStatusPresenter: PostStatusPresenter;
    let mockStatusService: StatusService;

    const authToken = new AuthToken("token", Date.now());
    const user = new User("first", "last", "alias", "imageUrl");
    const post = "This is a test post";

    beforeEach(() => {
        mockPostStatusPresenterView = mock<PostStatusView>();
        const mockPostStatusPresenterViewInstance = instance(
            mockPostStatusPresenterView
        );
        when(
            mockPostStatusPresenterView.displayInfoMessage(anything(), 0)
        ).thenReturn("messageId123");

        const postStatusPresenterSpy = spy(
            new PostStatusPresenter(mockPostStatusPresenterViewInstance)
        );
        postStatusPresenter = instance(postStatusPresenterSpy);

        mockStatusService = mock<StatusService>();
        when(postStatusPresenterSpy.statusService).thenReturn(
            instance(mockStatusService)
        );
    });
    it("tells the view to display a posting status message", async () => {
        await postStatusPresenter.submitPost(post, user, authToken);
        verify(
            mockPostStatusPresenterView.displayInfoMessage("Posting status...", 0)
        ).once();
    })
    it("calls postStatus on the post status service with the correct status string and auth token", async () => {
        await postStatusPresenter.submitPost(post, user, authToken);
        verify(mockStatusService.postStatus(authToken, 
            anything()
        )).once();
    });
    it("tells the view to clear the info message that was displayed previously, clear the post input, and display a status posted message when successful", async () => {
        await postStatusPresenter.submitPost(post, user, authToken);

        verify(mockPostStatusPresenterView.deleteMessage("messageId123")).once();
        verify(mockPostStatusPresenterView.setPost("")).once();
        verify(mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)).once();

        verify(mockPostStatusPresenterView.displayErrorMessage(anything())).never();
    });
    it("tells the view to clear the info message and display an error message but does not tell it to clear the post or display a status posted message when post status fails", async () => {
        let error = new Error("An error occurred")
        when(mockStatusService.postStatus(authToken, 
            anything()
        )).thenThrow(error);

        await postStatusPresenter.submitPost(post, user, authToken);
        
        verify(mockPostStatusPresenterView.deleteMessage("messageId123")).once();
        verify(
            mockPostStatusPresenterView.displayErrorMessage(anything())
        ).once();
        verify(mockPostStatusPresenterView.setPost("")).never();
        verify(mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)).never();
    });

});