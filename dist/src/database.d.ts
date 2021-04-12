import { MongoClient, Db, Collection } from 'mongodb';
import { ISessionConfig } from './config';
import { SessionDataInsert, SessionRecord } from './types';
declare class MongoConnection {
    private client;
    private dbName;
    private isConnected;
    private isConnecting;
    private onConnectCallbacks;
    constructor(client?: MongoClient, dbName?: string);
    private resolveCallbacks;
    private connect;
    open(): Promise<Db>;
    close(force?: boolean): Promise<void>;
}
export declare class Database {
    protected static connection: MongoConnection;
    protected static collectionName: string;
    protected static connect(): Promise<Collection<SessionRecord>>;
    static setConfig(config: Partial<ISessionConfig>): void;
    static addSession(session: SessionDataInsert): Promise<SessionRecord>;
    static closeConnection(force?: boolean): Promise<void>;
}
export {};
