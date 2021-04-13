import { MongoClient, ObjectID, Collection, WithId, OptionalId } from 'mongodb';
import { stringIsEmpty } from 'sb-util-ts';
import { DefaultConfig, ISessionConfig } from './config';
import { SessionDataInsert, SessionRecord } from './types';

class MongoConnection {
    private isConnected = false;
    private isConnecting = false;
    private onConnectCallbacks: ((err) => void)[] = [];
    private readonly client: MongoClient;

    constructor(config: { mongoUrl: string } = DefaultConfig) {
        this.client = new MongoClient(config.mongoUrl, { useUnifiedTopology: true });
    }

    private resolveCallbacks(err: Error = null) {
        for (const cb of this.onConnectCallbacks) {
            cb(err);
        }
    }

    private async connect(): Promise<MongoClient> {
        this.isConnecting = true;
        try {
            await this.client.connect();
            this.isConnected = true;
            this.resolveCallbacks();
        } catch (err) {
            console.error('MongoDb connection error', err);
            this.resolveCallbacks(err);
        }
        return this.client;
    }

    async open(): Promise<MongoClient> {
        if (this.isConnected) return this.client;
        if (this.isConnecting) {
            return new Promise<MongoClient>((resolve, reject) => {
                this.onConnectCallbacks.push(err => {
                    return err ? reject(err) : this.client;
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
    protected static config: ISessionConfig = DefaultConfig;

    protected static normalizeRecord<T>(org: OptionalId<T>): T & { _id: string } {
        if (!org) return null;
        const meta = Object.assign({}, org);
        const _id: string = meta._id.toHexString();
        delete meta._id;
        return Object.assign(<T>meta, { _id });
    }

    protected static async connect(): Promise<Collection<SessionRecord>> {
        const client = await this.connection.open();
        return client.db(this.config.sessionDbName).collection(this.config.sessionCollection);
    }

    static setConfig(config: Partial<ISessionConfig>): void {
        const urlHasChanged = !stringIsEmpty(config.mongoUrl) && config.mongoUrl !== this.config.mongoUrl;
        Object.assign(this.config, config);
        if (urlHasChanged) {
            this.connection = new MongoConnection(this.config);
        }
    }

    static async addSession(session: SessionDataInsert): Promise<SessionRecord> {
        const collection = await this.connect();
        const result = await collection.insertOne(<OptionalId<SessionRecord>>session);
        const _id = result.insertedId.toHexString();
        return Object.assign(session, { _id });
    }

    static async getSession(token: string): Promise<SessionRecord | null> {
        const collection = await this.connect();
        const session = await collection.findOne<SessionRecord & WithId<SessionRecord>>({ token });
        return this.normalizeRecord<SessionRecord>(session);
    }

    static async updateSession(session: SessionRecord): Promise<SessionRecord> {
        const collection = await this.connect();
        const _id:ObjectID = ObjectID.createFromHexString(session._id);
        const { token, refreshToken, expirationDate, refreshDate } = session;
        await collection.updateOne(_id, { $set: { token, refreshToken, expirationDate, refreshDate } });
        return session;
    }

    static async closeConnection(force?: boolean): Promise<void> {
        return this.connection.close(force);
    }
}
