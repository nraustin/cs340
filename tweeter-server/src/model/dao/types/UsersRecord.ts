export interface UsersRecord {
    readonly first_name: string;
    readonly last_name: string;
    readonly alias: string;
    readonly password: string;
    readonly image_url: string;
    readonly follower_count: number;
    readonly followee_count: number;
}