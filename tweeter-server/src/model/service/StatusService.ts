import { StatusDto } from "tweeter-shared/dist/model/dto/StatusDto";
import { FactoryDAO } from "../dao/FactoryDAO";
import { FeedsRecord } from "../dao/types/FeedsRecord";
import { StoriesRecord } from "../dao/types/StoriesRecord";
import { AuthService } from "./AuthService";
import { Service } from "./Service";
import { loadItemsPage } from "./Util";

export class StatusService implements Service {
  private userDAO;
  private statusDAO;
  private authService;

  constructor(factory: FactoryDAO) {
    this.userDAO = factory.createUserDAO();
    this.statusDAO = factory.createStatusDAO();
    this.authService = new AuthService(factory);
  }

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    return loadItemsPage<StatusDto, FeedsRecord>(
      token,
      userAlias,
      pageSize,
      lastItem,
      this.authService,
      false,
      (alias) => this.userDAO.getUser(alias),
      (alias, size, lastAttribute) =>
        this.statusDAO.getPageOfFeedItems(
          alias,
          size,
          typeof lastAttribute === "number" ? lastAttribute : undefined
        ),
      (last) => last?.timestamp ?? null,
      (item) => item.author_alias
    );
  }

  public async loadMoreStoryItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    return loadItemsPage<StatusDto, StoriesRecord>(
      token,
      userAlias,
      pageSize,
      lastItem,
      this.authService,
      false,
      (alias) => this.userDAO.getUser(alias),
      (alias, size, lastAttr) =>
        this.statusDAO.getPageOfStoryItems(
          alias,
          size,
          typeof lastAttr === "number" ? lastAttr : undefined
        ),
      (last) => last?.timestamp ?? null,
      (item) => item.author_alias
    );
  }

  public async postStatus(
    token: string,
    newStatus: StatusDto,
    existingTimestamp?: number
  ): Promise<void> {
    await this.authService.validateAuthToken(token);
    const authorAlias = newStatus.user.alias;
    const story: StoriesRecord = {
      post: newStatus.post,
      author_alias: authorAlias,
      timestamp: existingTimestamp ?? Date.now()
    };
    await this.statusDAO.putStory(story);

    return;
  }
}
