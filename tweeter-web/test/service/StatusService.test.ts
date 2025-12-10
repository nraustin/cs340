import { StatusService } from "../../src/model.service/StatusService"
import { UserService } from "../../src/model.service/UserService";
import { AuthToken, Status, User } from "tweeter-shared";
import "isomorphic-fetch"

describe("StatusService int. test", () => {
  const statusService = new StatusService();
  const userService = new UserService();
  let authToken: AuthToken;
  let currentUser: User;
  jest.setTimeout(10000);
  beforeAll(async () => {
    const alias = "@allen";   
    const password = "password"; 
    const [user, token] = await userService.login(alias, password);
    currentUser = user;
    authToken = token;
  });

  test("return a page of statuses for a user", async () => {
    const [statuses, hasMore] = await statusService.loadMoreStoryItems(
      authToken,
      currentUser.alias,
      10,
      null 
    );
    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses.length).toBeLessThanOrEqual(10);

    const first = statuses[0];
    expect(first).toBeDefined();
    expect(first.post).toBeTruthy(); 
    expect(first.user).toBeDefined();
    expect(first.user.alias).toBe(currentUser.alias);
  });
});
