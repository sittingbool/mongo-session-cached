"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const mongodb_1 = require("mongodb");
const sb_util_ts_1 = require("sb-util-ts");
const config_1 = require("./config");
class MongoConnection {
    constructor(client = new mongodb_1.MongoClient(config_1.DefaultConfig.mongoUrl), dbName = config_1.DefaultConfig.sessionDbName) {
        this.client = client;
        this.dbName = dbName;
        this.isConnected = false;
        this.isConnecting = false;
        this.onConnectCallbacks = [];
    }
    resolveCallbacks(err = null) {
        for (const cb of this.onConnectCallbacks) {
            cb(err);
        }
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isConnecting = true;
            try {
                yield this.client.connect();
                this.isConnected = true;
                this.resolveCallbacks();
            }
            catch (err) {
                console.error('MongoDb connection error', err);
                this.resolveCallbacks(err);
            }
            return this.client.db(this.dbName);
        });
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConnected)
                return this.client.db(this.dbName);
            if (this.isConnecting) {
                return new Promise((resolve, reject) => {
                    this.onConnectCallbacks.push(err => {
                        return err ? reject(err) : this.client.db(this.dbName);
                    });
                });
            }
            return this.connect();
        });
    }
    close(force) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.close(force);
        });
    }
}
class Database {
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.connection.open();
            return db.collection(this.collectionName);
        });
    }
    static setConfig(config) {
        const { mongoUrl, sessionDbName, sessionCollection } = config;
        if (!sb_util_ts_1.stringIsEmpty(mongoUrl) || !sb_util_ts_1.stringIsEmpty(sessionDbName)) {
            this.connection = new MongoConnection(new mongodb_1.MongoClient(mongoUrl), sessionDbName);
        }
        this.collectionName = sessionCollection || this.collectionName;
    }
    static addSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.connect();
            const result = yield collection.insertOne(session);
            const id = result.insertedId.toHexString();
            return Object.assign(session, { id });
        });
    }
    static closeConnection(force) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.connection.close(force);
        });
    }
}
exports.Database = Database;
Database.connection = new MongoConnection();
Database.collectionName = config_1.DefaultConfig.sessionCollection;
//# sourceMappingURL=database.js.map