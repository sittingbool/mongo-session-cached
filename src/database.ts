import { MongoClient, Db, Collection } from 'mongodb';
import { stringIsEmpty } from 'sb-util-ts';
import { DefaultConfig, ISessionConfig } from './config';
import { SessionDataInsert, SessionRecord } from './types';

class MongoConnection {
    private isConnected = false;
    private isConnecting = false;
    private onConnectCallbacks: ((err) => void)[] = [];

    constructor(
        private client = new MongoClient(DefaultConfig.mongoUrl),
        private dbName: string = DefaultConfig.sessionDbName
    ) {}

    private resolveCallbacks(err: Error = null) {
        for (const cb of this.onConnectCallbacks) {
            cb(err);
        }
    }

    private async connect(): Promise<Db> {
        this.isConnecting = true;
        try {
            await this.client.connect();
            this.isConnected = true;
            this.resolveCallbacks();
        } catch (err) {
            console.error('MongoDb connection error', err);
            this.resolveCallbacks(err);
        }
        return this.client.db(this.dbName);
    }

    async open(): Promise<Db> {
        if (this.isConnected) return this.client.db(this.dbName);
        if (this.isConnecting) {
            return new Promise<Db>((resolve, reject) => {
                this.onConnectCallbacks.push(err => {
                    return err ? reject(err) : this.client.db(this.dbName);
                });
            });
        }
        return this.connect();
    }

    async close(force?: boolean): Promise<void> {
        return this.client.close(force);
    }
}


export class Database {
    protected static connection: MongoConnection = new MongoConnection();
    protected static collectionName: string = DefaultConfig.sessionCollection;

    protected static async connect(): Promise<Collection<SessionRecord>> {
        const db = await this.connection.open();
        return db.collection(this.collectionName);
    }

    static setConfig(config: Partial<ISessionConfig>): void {
        const { mongoUrl, sessionDbName, sessionCollection } = config;
        if (!stringIsEmpty(mongoUrl) || !stringIsEmpty(sessionDbName)) {
            this.connection = new MongoConnection(new MongoClient(mongoUrl), sessionDbName);
        }
        this.collectionName = sessionCollection || this.collectionName;
    }

    static async addSession(session: SessionDataInsert): Promise<SessionRecord> {
        const collection = await this.connect();
        const result = await collection.insertOne(session);
        const id = result.insertedId.toHexString();
        return Object.assign(session, { id });
    }

    static async closeConnection(force?: boolean): Promise<void> {
        return this.connection.close(force);
    }
}
