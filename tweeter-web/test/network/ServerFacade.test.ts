import { ServerFacade } from "../../src/network/ServerFacade";
import {
  RegisterRequest,
  AuthResponse,
  AuthToken,
  User,
  UserDto,
  PagedItemRequest,
  FollowInfoRequest,
} from "tweeter-shared";
import "isomorphic-fetch"

describe("ServerFacade int. test", () => {
  const serverFacade = new ServerFacade();
  let registeredUser: User;
  let authToken: AuthToken;
  jest.setTimeout(10000);
  test("register a new user", async () => {
    const alias = "@allen";
    const request: RegisterRequest = {
      firstName: "Allen",
      lastName: "tweeter",
      alias: alias,
      password: "password",
      userImageBytes: new Uint8Array([8, 0, 1, 5, 5, 0]),
      imageFileExtension: "png",
    };
    const [user, token] = await serverFacade.register(request);
    registeredUser = user;
    authToken = token;

    expect(user).toBeDefined();
    expect(user.firstName).toBe("Allen");
    expect(user.lastName).toBe("Anderson");
    expect(user.alias).toBe(alias);
    expect(token).toBeDefined();
  });

  test("return a list of followers", async () => {
    const request: PagedItemRequest<UserDto> = {
      token: authToken.token,
      userAlias: registeredUser.alias,
      pageSize: 10,
      lastItem: null,
    };
    const [followers, hasMore] = await serverFacade.getMoreFollowers(request);
    expect(Array.isArray(followers)).toBe(true);
    followers.forEach((follower) => {
      expect(follower.alias).toBeDefined();
      expect(follower.firstName).toBeDefined();
      expect(follower.lastName).toBeDefined();
    });
  });

  test("return an integer representing the number of followers", async () => {
    const request: FollowInfoRequest = {
      token: authToken.token,
      user: registeredUser.dto,
    };
    const count = await serverFacade.getFollowerCount(request);
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
