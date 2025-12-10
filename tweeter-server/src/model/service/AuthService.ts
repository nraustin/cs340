import bcrypt from "bcryptjs";
import { AuthToken } from "tweeter-shared";
import { FactoryDAO } from "../dao/FactoryDAO";

export class AuthService {
  private authDAO;
  
  constructor(factory: FactoryDAO){
    this.authDAO = factory.createAuthTokenDAO()
  }

  public async createAuthTokenRecord(alias: string): Promise<AuthToken> {
    const authToken = AuthToken.Generate();
    const timestamp = Math.floor(Date.now() / 1000);
    const expiration = timestamp + 3600;

    await this.authDAO.addToken({
      auth_token: authToken.token,
      alias: alias,
      expiration: expiration,
    });
    return authToken;
  }

  async hashPassword(password: string) {
    const hashedPassword = await bcrypt.hash(password, 5);
    return hashedPassword;
  }

  async comparePasswords(password: string, hashedPassword: string) {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  }

  async validateAuthToken(token: string): Promise<void> {
    const record = await this.authDAO.getToken(token);
    if (!record) {
      throw new Error("[Bad Request]: Invalid auth token");
    }
    const now = Math.floor(Date.now() / 1000);
    if (record.expiration <= now) {
      if (this.authDAO.deleteToken) {
        await this.authDAO.deleteToken("test", token);
      }
      throw new Error("[Bad Request]: Auth token has expired");
    }
    return;
  }
}
