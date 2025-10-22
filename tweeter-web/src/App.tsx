import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Status, User } from "tweeter-shared";
import "./App.css";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import ItemScroller from "./components/mainLayout/ItemScroller";
import MainLayout from "./components/mainLayout/MainLayout";
import StatusItem from "./components/statusItem/StatusItem";
import Toaster from "./components/toaster/Toaster";
import { useUserInfoContext } from "./components/userInfo/UserInfoHooks";
import UserItem from "./components/userItem/UserItem";
import { FollowService } from "./model.service/FollowService";
import { StatusService } from "./model.service/StatusService";
import { FeedPresenter } from "./presenter/FeedPresenter";
import { FolloweePresenter } from "./presenter/FolloweePresenter";
import { FollowerPresenter } from "./presenter/FollowerPresenter";
import { PagedItemView } from "./presenter/PagedItemPresenter";
import { StoryPresenter } from "./presenter/StoryPresenter";

const App = () => {
  const { currentUser, authToken } = useUserInfoContext();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfoContext();

  function itemFactory(
    featureUrl: "/feed" | "/story"
  ): (item: Status, featurePath: string) => JSX.Element;
  function itemFactory(
    featureUrl: "/followers" | "/followees"
  ): (item: User, featurePath: string) => JSX.Element;

  function itemFactory(
    featureUrl: "/feed" | "/story" | "/followees" | "/followers"
  ) {
    if (featureUrl === "/feed" || featureUrl === "/story") {
      return (item: Status, featurePath: string) => (
        <StatusItem status={item} featurePath={featurePath} />
      );
    }
    return (item: User, featurePath: string) => (
      <UserItem user={item} featurePath={featurePath} />
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          index
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
        <Route
          path="feed/:displayedUser"
          element={
            <ItemScroller<Status, StatusService, FeedPresenter>
              key={`feed-${displayedUser!.alias}`}
              featureUrl="/feed"
              presenterFactory={(view: PagedItemView<Status>) =>
                new FeedPresenter(view)
              }
              itemComponentFactory={itemFactory("/feed")}
            />
          }
        />
        <Route
          path="story/:displayedUser"
          element={
            <ItemScroller<Status, StatusService, StoryPresenter>
              key={`story-${displayedUser!.alias}`}
              featureUrl="/story"
              presenterFactory={(view: PagedItemView<Status>) =>
                new StoryPresenter(view)
              }
              itemComponentFactory={itemFactory("/story")}
            />
          }
        />
        <Route
          path="followees/:displayedUser"
          element={
            <ItemScroller<User, FollowService, FolloweePresenter>
              key={`followees-${displayedUser!.alias}`}
              featureUrl="/followees"
              presenterFactory={(view: PagedItemView<User>) =>
                new FolloweePresenter(view)
              }
              itemComponentFactory={itemFactory("/followees")}
            />
          }
        />
        <Route
          path="followers/:displayedUser"
          element={
            <ItemScroller<User, FollowService, FollowerPresenter>
              key={`followers-${displayedUser!.alias}`}
              featureUrl="/followers"
              presenterFactory={(view: PagedItemView<User>) =>
                new FollowerPresenter(view)
              }
              itemComponentFactory={itemFactory("/followers")}
            />
          }
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route
          path="*"
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
