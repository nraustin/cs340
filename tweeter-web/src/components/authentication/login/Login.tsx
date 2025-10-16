import "bootstrap/dist/css/bootstrap.css";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMessageActions } from "../../toaster/MessageHooks";
import { useUserInfoActions } from "../../userInfo/UserInfoHooks";
import AuthenticationFields from "../AuthenticationFields";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import "./Login.css";
import { LoginPresenter, LoginView } from "../../../presenter/LoginPresenter";

interface Props {
  originalUrl?: string;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const observer: LoginView = {
    updateUserInfo,
    navigate,
    displayErrorMessage,
    setIsLoading,
  }

  const presenterRef = useRef<LoginPresenter | null>(null)
    if(!presenterRef.current){
      presenterRef.current = new LoginPresenter(observer);
  }

  const checkSubmitButtonStatus = (): boolean => {
    return presenterRef.current!.checkSubmitButtonStatus(alias, password);
  };

  const loginOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == "Enter" && !checkSubmitButtonStatus()) {
      doLogin();
    }
  };

  const doLogin = async () => {
    presenterRef.current?.doLogin(alias, password, rememberMe, props.originalUrl)
  };

  const inputFieldFactory = () => {
    return (
      <>
        <AuthenticationFields
          onKeyDownEvent={loginOnEnter}
          setAlias={setAlias}
          setPassword={setPassword}
          bottomClass={true}
        />
      </>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Not registered? <Link to="/register">Register</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Sign In"
      submitButtonLabel="Sign in"
      oAuthHeading="Sign in with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={checkSubmitButtonStatus}
      isLoading={isLoading}
      submit={doLogin}
    />
  );
};

export default Login;
