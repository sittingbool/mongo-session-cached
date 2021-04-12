import * as Loki from 'lokijs';
import { LokiMemoryAdapter, Collection as LokiCollection } from 'lokijs';
import { SessionRecord } from './types';
import { DefaultConfig, ISessionConfig } from './config';

const db = new Loki('mongo-session-cached.db', { adapter: new LokiMemoryAdapter() });

export class Cache {
    protected static sessions = db.addCollection<SessionRecord>('sessions', { unique: ['token'], indices: ['token', 'username', 'userId'] });
    protected static namedCaches: {[key: string]: LokiCollection }
    protected static config = DefaultConfig;

    protected static cacheForName(name: string, options?: Partial<CollectionOptions<any>>): LokiCollection {
        return this.namedCaches[name] || db.addCollection(name, options);
    }

    protected static stripLokiProperties<T>(data: T | (T & LokiObj)): T {
        const obj = <T & LokiObj>Object.assign({}, data);
        delete obj.$loki;
        delete obj.meta;
        return obj;
    }

    static setConfig(config: Partial<ISessionConfig>): void {
        this.config = Object.assign(DefaultConfig, config);
    }

    static addSession(token: string, userId: string | number, username: string, additionalData: { [key: string]: unknown } = null): SessionRecord {
        const cacheTTL = Date.now() + (this.config.defaultCacheTTl * 1000);
        const expirationDate = Date.now() + (this.config.sessionTTl * 1000);
        const refreshDate = Date.now() + (this.config.tokenTTl * 1000);
        const data: SessionRecord = { token, userId, username, expirationDate, refreshDate, cacheTTL, additional: additionalData };
        return this.stripLokiProperties<SessionRecord>(this.sessions.insert(data));
    }

    static extendSession(oldToken: string, newToken: string): SessionRecord | null {
        const session = this.sessions.find({ token: oldToken })[0] || null;
        if (!session) return null;
        const { userId, username, additional } = session;
        this.sessions.remove(session);
        return this.addSession(newToken, userId, username, additional);
    }

    static getSession(token: string, extendCacheTTL: boolean = true): SessionRecord | null {
        const session = this.sessions.find({ token })[0] || null;
        if (session && extendCacheTTL) {
            session.cacheTTL = Date.now() + (this.config.defaultCacheTTl * 1000);
        }
        return this.stripLokiProperties<SessionRecord>(session);
    }

    // TODO: cache other data
    static addToCache<T>(cacheName: string, data: T, cacheOptions?: Partial<CollectionOptions<any>>): T {
        return this.cacheForName(cacheName, cacheOptions).insert(data);
    }

    static removeSession(token: string): number {
        return this.removeSessions({ token });
    }

    static removeSessions(by: LokiQuery<SessionRecord & LokiObj>): number {
        if (typeof by.$loki === 'number') {
            this.sessions.remove(by.$loki);
            return 1;
        }
        const found = this.sessions.find(by);
        if (!found.length) return 0;
        this.sessions.remove(found.map(i => i.$loki));
        return found.length;
    }

    static removeExpiredSessions(): void {
        this.sessions.removeWhere({ expirationDate: { $gte: Date.now() } });
    }
}
