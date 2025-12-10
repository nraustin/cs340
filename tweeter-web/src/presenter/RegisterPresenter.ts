import { Buffer } from "buffer";
import {
  AuthenticationPresenter,
  AuthenticationView,
} from "./AuthenticationPresenter";

export interface RegisterView extends AuthenticationView {
  setImageUrl: (url: string) => void;
  setImageFileExtension: (url: string) => void;
}

export class RegisterPresenter extends AuthenticationPresenter<RegisterView>{
  private _imageBytes: Uint8Array = new Uint8Array();
  private _imageUrl = "";
  private _imageFileExtension = "";

  public constructor(view: RegisterView) {
    super(view);
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
        console.log("within handleImage", imageStringBase64)

        // Remove unnecessary file metadata from the start of the string.
        const imageStringBase64BufferContents =
          imageStringBase64.split("base64,")[1];

        const bytes: Uint8Array = Buffer.from(
          imageStringBase64BufferContents,
          "base64"
        );

        this._imageBytes = bytes
      };
      reader.readAsDataURL(file);

      // Set image file extension (and move to a separate method)
      const fileExtension = this.getFileExtension(file);
      if (fileExtension) {
        this._imageFileExtension = fileExtension
        this._view.setImageFileExtension(fileExtension);
      }
    } else {
      this._view.setImageUrl("");
      this._imageBytes = new Uint8Array();
    }
  };

  public async doRegister(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    rememberMe: boolean
  ) {
    await this.doAuthenticationOperation(
      async () =>
        this.userService.register(
          firstName,
          lastName,
          alias,
          password,
          this._imageBytes,
          this._imageFileExtension
        ),
      { rememberMe },
      "register"
    );
  }

  public checkSubmitButtonStatus = (
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageUrl: string,
    imageFileExtension: string
  ): boolean => {
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
