import { DefaultConfig, ISessionConfig } from './config';
import { Database } from './database';
import { Cache } from './cache';
import { PublicSessionData, SessionRecord } from './types';
import { makeSession, refreshSessionToken } from './values';

export class SessionManager {
    constructor(protected config: ISessionConfig = DefaultConfig) {
        this.forwardConfig();
    }

    protected forwardConfig(): void {
        Database.setConfig(this.config);
        Cache.setConfig(this.config);
    }

    protected publicSession(session: SessionRecord): PublicSessionData {
        const { token, userId, username, additional, partitionKey, expirationDate, refreshDate } = session;
        return { token, userId, username, additional, partitionKey, expirationDate, refreshDate };
    }

    static setConfig(config: Partial<ISessionConfig>): void {
        Object.assign(DefaultConfig, config);
    }

    setConfig(config: Partial<ISessionConfig>): void {
        Object.assign(this.config, config);
        this.forwardConfig();
    }

    async newSession(userId: string | number, username: string, additional:{[key: string]: unknown} = null, token?: string): Promise<PublicSessionData> {
        const session = makeSession(this.config, userId, username, additional, token);
        const record = await Database.addSession(session);
        Cache.addSession(record);
        return this.publicSession(record);
    }

    async refreshSession(sessionToken: string, refreshToken: string): Promise<PublicSessionData | null> {
        const record = await Database.getSession(sessionToken);
        if (!record) return null;
        if (refreshToken !== record.refreshToken) {
            throw new Error('TokenMissMatchError'); // TODO: constants for this
        }
        if (record.expirationDate < Date.now()) {
            throw new Error('ExpirationError'); // TODO: constants for this
        }
        refreshSessionToken(this.config, record);
        await Database.updateSession(record);

        const cacheRecord = Cache.getSession(sessionToken, true);
        if (cacheRecord) {
            Cache.updateSessionExtension(sessionToken, record);
        }
        return this.publicSession(record);
    }

    async getSession(token: string): Promise<PublicSessionData> {
        let inCache = true;
        let record = Cache.getSession(token);

        if (!record) {
            inCache = false;
            record = await Database.getSession(token);
        }

        if (record.refreshDate < Date.now()) throw new Error('NeedsRefresh');
        if (record.expirationDate < Date.now()) throw new Error('ExpirationError');

        if (!inCache) {
            Cache.addSession(record);
        }

        return this.publicSession(record);
    }

    // TODO: remove session by token
    // TODO: remove session by username
    // TODO: remove session by userId

    // TODO: automatically (setInterval) remove expired session
}
