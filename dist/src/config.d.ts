export interface ISessionConfig {
    mongoUrl: string;
    sessionDbName: string;
    sessionCollection: string;
    defaultCacheTTl: number;
    sessionTTl: number;
    tokenTTl: number;
}
export declare const DefaultConfig: ISessionConfig;
