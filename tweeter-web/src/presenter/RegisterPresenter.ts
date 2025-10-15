import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Buffer } from "buffer";


export interface RegisterView {
    updateUserInfo: (currentUser: User, 
                       displayedUser: User, 
                       authToken: AuthToken, 
                       rememberMe: boolean) => void;
    navigate: (url: string) => void;
    setImageUrl: (url: string) => void;
    setImageFileExtension: (url: string) => void;
    displayErrorMessage: (message: string) => void;
    setIsLoading: (isLoading: boolean) => void;
}

export class RegisterPresenter {
    private _view: RegisterView;
    private _userService: UserService;
    private _imageBytes: Uint8Array = new Uint8Array();
    private _imageUrl = "";
    private _imageFileExtension = "";

    public constructor(view: RegisterView){
        this._view = view;
        this._userService = new UserService();
    }

    public get imageUrl() {
        return this._imageUrl;
    }

    public get imageFileExtension() {
        return this._imageFileExtension;
    }

    private getFileExtension = (file: File): string | undefined => {
        return file.name.split(".").pop();
    };

    public handleImageFile = (file: File | undefined) => {
        if (file) {
          this._view.setImageUrl(URL.createObjectURL(file));
    
          const reader = new FileReader();
          reader.onload = (event: ProgressEvent<FileReader>) => {
            const imageStringBase64 = event.target?.result as string;
    
            // Remove unnecessary file metadata from the start of the string.
            const imageStringBase64BufferContents =
              imageStringBase64.split("base64,")[1];
    
            const bytes: Uint8Array = Buffer.from(
              imageStringBase64BufferContents,
              "base64"
            );
    
            this._imageBytes = bytes;
          };
          reader.readAsDataURL(file);
    
          // Set image file extension (and move to a separate method)
          const fileExtension = this.getFileExtension(file);
          if (fileExtension) {
            this._view.setImageFileExtension(fileExtension);
          }
        } else {
          this._view.setImageUrl("");
          this._imageBytes = new Uint8Array();
        }
      };


    public async doRegister (firstName: string,
                             lastName: string,
                             alias: string,
                             password: string,
                             rememberMe: boolean,) {
        try {
            this._view.setIsLoading(true);

            const [user, authToken] = await this._userService.register(
                firstName,
                lastName,
                alias,
                password,
                this._imageBytes,
                this._imageFileExtension
            );

            this._view.updateUserInfo(user, user, authToken, rememberMe);
            this._view.navigate(`/feed/${user.alias}`);
        } catch (error) {
            this._view.displayErrorMessage(
                `Failed to register user because of exception: ${error}`
        );
        } finally {
            this._view.setIsLoading(false);
        }
    };

    public checkSubmitButtonStatus = (firstName: string,
                                      lastName: string,
                                      alias: string,
                                      password: string,
                                      imageUrl: string,
                                      imageFileExtension: string): boolean => {
      return (
        !firstName ||
        !lastName ||
        !alias ||
        !password ||
        !imageUrl ||
        !imageFileExtension
      );
    };
    

}