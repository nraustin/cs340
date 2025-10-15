import { useContext, useRef } from "react"
import { UserInfoActions, UserInfoActionsContext, UserInfoContext } from "./UserInfoContexts";
import { useMessageActions } from "../toaster/MessageHooks";
import { useNavigate } from "react-router-dom";
import { UserInfoHooksPresenter, UserInfoHooksView } from "../../presenter/UserInfoHooksPresenter";

export const useUserInfoActions = (): UserInfoActions => {
    return useContext(UserInfoActionsContext);
}

export const useUserInfoContext = () => {
    return useContext(UserInfoContext);
}

export const useUserNavigation = (featurePath: string) => {
    const { displayErrorMessage } = useMessageActions();
    const { displayedUser, authToken } = useUserInfoContext();
    const { setDisplayedUser } = useUserInfoActions();
    const navigate = useNavigate();

    const observer: UserInfoHooksView = {
        setDisplayedUser: setDisplayedUser,
        navigate: navigate,
        displayErrorMessage: displayErrorMessage,
    }

    const presenterRef = useRef<UserInfoHooksPresenter | null>(null)
    if(!presenterRef.current){
        presenterRef.current = new UserInfoHooksPresenter(observer);
    }
    
    const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
        event.preventDefault();
        const alias = extractAlias(event.target.toString());

        presenterRef.current!.navigateToUser(alias, displayedUser!, authToken!, featurePath)
    };

    const extractAlias = (value: string): string => {
        const index = value.indexOf("@");
        return value.substring(index);
    };
    
    return { navigateToUser, extractAlias };
}