import { ISessionConfig } from './config';
import { PublicSessionData, SessionRecord } from './types';
export declare class SessionManager {
    protected config: ISessionConfig;
    constructor(config?: ISessionConfig);
    protected forwardConfig(): void;
    protected publicSession(session: SessionRecord): PublicSessionData;
    static setConfig(config: Partial<ISessionConfig>): void;
    setConfig(config: Partial<ISessionConfig>): void;
    newSession(userId: string | number, username: string, additional?: {
        [key: string]: unknown;
    }, token?: string): Promise<PublicSessionData>;
    refreshSession(sessionToken: string, refreshToken: string): Promise<PublicSessionData | null>;
    getSession(token: string): Promise<PublicSessionData>;
}
