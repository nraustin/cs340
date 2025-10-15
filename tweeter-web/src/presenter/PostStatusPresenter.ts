import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";


export interface PostStatusView {
    displayInfoMessage: (message: string, duration: number) => string;
    displayErrorMessage: (message: string) => void;
    deleteMessage: (message: string) => void;
    setPost: (message: string) => void;
    setIsLoading: (isLoading: boolean) => void;
}

export class PostStatusPresenter {
    private _view: PostStatusView;
    private _statusService: StatusService;

    public constructor(view: PostStatusView) {
        this._view = view;
        this._statusService = new StatusService();
    }

    public async submitPost (post: string, 
                             currentUser: User, 
                             authToken: AuthToken) {
    
        var postingStatusToastId = "";
    
        try {
          this._view.setIsLoading(true);
          postingStatusToastId = this._view.displayInfoMessage(
            "Posting status...",
            0
          );
    
          const status = new Status(post, currentUser!, Date.now());
    
          await this._statusService.postStatus(authToken!, status);
    
          this._view.setPost("");
          this._view.displayInfoMessage("Status posted!", 2000);
        } catch (error) {
            this._view.displayErrorMessage(
                `Failed to post the status because of exception: ${error}`
            );
        } finally {
            this._view.deleteMessage(postingStatusToastId);
            this._view.setIsLoading(false);
        }
      };

    public checkButtonStatus = (post: string, authToken: AuthToken, currentUser: User): boolean => {
        return !post.trim() || !authToken || !currentUser;
    };

}