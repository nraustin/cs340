import { TokensRecord } from "./types/TokensRecord";

export interface AuthTokenDAO {
    addToken(authToken: TokensRecord): Promise<void>;
    getToken(token: string): Promise<TokensRecord | null>
    deleteToken(testToken: string, token: string): Promise<void>
}
