import { Collection as LokiCollection } from 'lokijs';
import { SessionRecord } from './types';
import { ISessionConfig } from './config';
export declare class Cache {
    protected static sessions: Collection<SessionRecord>;
    protected static namedCaches: {
        [key: string]: LokiCollection;
    };
    protected static config: ISessionConfig;
    protected static cacheForName(name: string, options?: Partial<CollectionOptions<any>>): LokiCollection;
    protected static stripLokiProperties<T>(data: T | (T & LokiObj)): T;
    static setConfig(config: Partial<ISessionConfig>): void;
    static addSession(session: SessionRecord): SessionRecord;
    static updateSessionExtension(token: string, session: SessionRecord): SessionRecord;
    static getSession(token: string, extendCacheTTL?: boolean): SessionRecord | null;
    static addToCache<T>(cacheName: string, data: T, cacheOptions?: Partial<CollectionOptions<any>>): T;
    static removeSession(token: string): number;
    static removeSessions(by: LokiQuery<SessionRecord & LokiObj>): number;
    static removeExpiredSessions(): void;
}
