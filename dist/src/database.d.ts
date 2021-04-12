import { MongoClient, Collection } from 'mongodb';
import { ISessionConfig } from './config';
import { SessionDataInsert, SessionRecord } from './types';
declare class MongoConnection {
    private isConnected;
    private isConnecting;
    private onConnectCallbacks;
    private readonly client;
    constructor(config?: {
        mongoUrl: string;
    });
    private resolveCallbacks;
    private connect;
    open(): Promise<MongoClient>;
    close(force?: boolean): Promise<void>;
}
export declare class Database {
    protected static connection: MongoConnection;
    protected static config: ISessionConfig;
    protected static connect(): Promise<Collection<SessionRecord>>;
    static setConfig(config: Partial<ISessionConfig>): void;
    static addSession(session: SessionDataInsert): Promise<SessionRecord>;
    static closeConnection(force?: boolean): Promise<void>;
}
export {};
