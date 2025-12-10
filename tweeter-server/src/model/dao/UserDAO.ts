import { UsersRecord } from "./types/UsersRecord";

export interface UserDAO {
    putUser(user: UsersRecord, password: string): void,
    getUser(alias: string): Promise<UsersRecord | null> 
    updateCount(alias: string, attribute: string, value: number): Promise<UsersRecord>;
}