import { envVariable } from 'sb-util-ts';

export interface ISessionConfig {
    mongoUrl: string;
    sessionDbName: string;
    sessionCollection: string;
    // time to live for cached objects in seconds
    defaultCacheTTl: number;
    // time to live for sessions (expiration threshold) in seconds
    sessionTTl: number;
    // time to live for tokens (expiration threshold) in seconds, after which a new token needs to be requested (refreshDate)
    tokenTTl: number;
}

export const DefaultConfig: ISessionConfig = {
    mongoUrl: <string>envVariable('MONGO_DB_URL', 'mongo://localhost:27017'),
    sessionDbName: <string>envVariable('MONGO_SESSION_DB_NAME', 'UserDb'),
    sessionCollection: <string>envVariable('MONGO_SESSION_COLLECTION', 'Sessions'),
    defaultCacheTTl: <number>envVariable('MONGO_CACHE_TTL', 3600, 'int'), // 1 hour
    sessionTTl: <number>envVariable('MONGO_CACHE_TTL', 57600, 'int'), // 16 hours
    tokenTTl: <number>envVariable('MONGO_CACHE_TTL', 7200, 'int'), // 2 hours
};
