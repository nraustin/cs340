import { AuthToken, User, UserDto } from "tweeter-shared";
import { FactoryDAO } from "../dao/FactoryDAO";
import { UsersRecord } from "../dao/types/UsersRecord";
import { AuthService } from "./AuthService";
import { Service } from "./Service";

export class UserService implements Service {
  private userDAO;
  private s3DAO;
  private authTokenDAO;
  private authService;

  constructor(factory: FactoryDAO) {
    this.userDAO = factory.createUserDAO();
    this.s3DAO = factory.createS3DAO();
    this.authTokenDAO = factory.createAuthTokenDAO();
    this.authService = new AuthService(factory);
  }

  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    await this.authService.validateAuthToken(token);
    const record = await this.userDAO.getUser(alias);
    if (!record) {
      return null;
    }
    const user = new User(
      record.first_name,
      record.last_name,
      record.alias,
      record.image_url
    );

    return user.dto;
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthToken]> {
    const user = await this.userDAO.getUser(alias);
    if (!user) {
      throw new Error("[Bad Request]: Alias not found");
    }
    const passwordMatch = await this.authService.comparePasswords(
      password,
      user.password
    );
    if (!passwordMatch) {
      throw new Error("[Bad Request]: Incorrect password");
    }
    const authToken = await this.authService.createAuthTokenRecord(alias);
    const newUser = new User(
      user.first_name,
      user.last_name,
      user.alias,
      user.image_url
    );
    return [newUser.dto, authToken];
  }

  public async logout(token: string): Promise<void> {
    await this.authTokenDAO.deleteToken(token, token);
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: string,
    imageFileExtension: string
  ): Promise<[UserDto, AuthToken]> {
    const fileName = `${alias}-${Date.now()}.${imageFileExtension}`;
    const imageUrl = await this.s3DAO.putImage(fileName, userImageBytes);
    const existing = await this.userDAO.getUser(alias);

    if (existing) {
      throw new Error("[Bad Request]: Alias already taken");
    }
    const hashedPassword = await this.authService.hashPassword(password);
    const userRecord: UsersRecord = {
      first_name: firstName,
      last_name: lastName,
      alias: alias,
      password: hashedPassword,
      image_url: imageUrl,
      follower_count: 0,
      followee_count: 0,
    };
    await this.userDAO.putUser(userRecord);
    const user = new User(
      userRecord.first_name,
      userRecord.last_name,
      userRecord.alias,
      userRecord.image_url
    );

    const authToken = await this.authService.createAuthTokenRecord(alias);
    return [user.dto, authToken];
  }
}
