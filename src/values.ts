import { v4 as uuidV4 } from 'uuid';
import { ISessionConfig } from './config';
import { SessionDataInsert, SessionRecord } from './types';


// TODO: unit tests

export function newSessionToken(): string {
    return 's#' + uuidV4();
}

export function newRefreshToken(): string {
    return 'r#' + uuidV4();
}

export interface ISessionDefaults { token: string, expirationDate: number, refreshDate: number, refreshToken: string }
export function sessionDefaults(config: ISessionConfig, token?: string): ISessionDefaults {
    const refreshToken = newRefreshToken();
    const expirationDate = Date.now() + (config.sessionTTl * 1000);
    const refreshDate = Date.now() + (config.tokenTTl * 1000);
    token = token || newSessionToken();

    return { token, expirationDate, refreshDate, refreshToken };
}

export function cacheTTl(config: ISessionConfig): number {
    return Date.now() + config.defaultCacheTTl * 1000;
}

export function makeSession(config: ISessionConfig, userId: string | number, username: string, additional: { [key: string]: unknown } = null, token?: string): SessionDataInsert {
    const data: Partial<SessionDataInsert> = { userId, username };
    data.additional = additional || null;
    return <SessionDataInsert>Object.assign(data, sessionDefaults(config, token));
}

export function refreshSessionToken(config: ISessionConfig, session: SessionRecord): SessionRecord {
    session.token = newSessionToken();
    session.refreshToken = newRefreshToken();
    session.expirationDate = Date.now() + (config.sessionTTl * 1000);
    session.refreshDate = Date.now() + (config.tokenTTl * 1000);
    return session;
}
