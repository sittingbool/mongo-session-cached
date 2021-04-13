import * as Loki from 'lokijs';
import { LokiMemoryAdapter, Collection as LokiCollection } from 'lokijs';
import { SessionRecord } from './types';
import { DefaultConfig, ISessionConfig } from './config';
import { cacheTTl } from './values';

const db = new Loki('mongo-session-cached.db', { adapter: new LokiMemoryAdapter() });

export class Cache {
    protected static sessions = db.addCollection<SessionRecord>('sessions', { unique: ['token'], indices: ['token', 'username', 'userId'] });
    protected static namedCaches: {[key: string]: LokiCollection }
    protected static config = DefaultConfig;

    protected static cacheForName(name: string, options?: Partial<CollectionOptions<any>>): LokiCollection {
        return this.namedCaches[name] || db.addCollection(name, options);
    }

    protected static stripLokiProperties<T>(data: T | (T & LokiObj)): T {
        if (!data) return data;
        const obj = <T & LokiObj>Object.assign({}, data);
        delete obj.$loki;
        delete obj.meta;
        return obj;
    }

    static setConfig(config: Partial<ISessionConfig>): void {
        this.config = Object.assign(DefaultConfig, config);
    }

    static addSession(session: SessionRecord): SessionRecord {
        const record = Object.assign({ cacheTTL: cacheTTl(this.config) }, session);
        return this.stripLokiProperties<SessionRecord>(this.sessions.insert(record));
    }

    static updateSessionExtension(token: string, session: SessionRecord): SessionRecord {
        const record = <SessionRecord>this.sessions.findOne({ token });
        if (!record) return null;
        Object.assign(record, session);
        this.sessions.update(record);
        return this.stripLokiProperties<SessionRecord>(record);
    }

    static getSession(token: string, extendCacheTTL: boolean = true): SessionRecord | null {
        const session = this.sessions.find({ token })[0] || null;
        if (session && extendCacheTTL) {
            session.cacheTTL = cacheTTl(this.config);
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
