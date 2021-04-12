import { ISessionConfig } from './config';
import { SessionDataInsert } from './types';
export declare function newSessionToken(): string;
export declare function newRefreshToken(): string;
export interface ISessionDefaults {
    token: string;
    expirationDate: number;
    refreshDate: number;
    refreshToken: string;
}
export declare function sessionDefaults(config: ISessionConfig, token?: string): ISessionDefaults;
export declare function cacheTTl(config: ISessionConfig): number;
export declare function makeSession(config: ISessionConfig, userId: string | number, username: string, token?: string): SessionDataInsert;
