import { v4 as uuidV4 } from 'uuid';
import { ISessionConfig } from './config';
import { SessionDataInsert } from './types';


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
    return config.defaultCacheTTl * 1000;
}

export function makeSession(config: ISessionConfig, userId: string | number, username: string, token?: string): SessionDataInsert {
    return Object.assign({ userId, username }, sessionDefaults(config, token));
}
