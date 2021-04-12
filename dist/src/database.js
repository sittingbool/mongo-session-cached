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
    constructor(config = config_1.DefaultConfig) {
        this.isConnected = false;
        this.isConnecting = false;
        this.onConnectCallbacks = [];
        this.client = new mongodb_1.MongoClient(config.mongoUrl);
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
            return this.client;
        });
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConnected)
                return this.client;
            if (this.isConnecting) {
                return new Promise((resolve, reject) => {
                    this.onConnectCallbacks.push(err => {
                        return err ? reject(err) : this.client;
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
    static normalizeRecord(org) {
        if (!org)
            return null;
        const meta = Object.assign({}, org);
        const _id = meta._id.toHexString();
        delete meta._id;
        return Object.assign(meta, { _id });
    }
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.connection.open();
            return client.db(this.config.sessionDbName).collection(this.config.sessionCollection);
        });
    }
    static setConfig(config) {
        const urlHasChanged = !sb_util_ts_1.stringIsEmpty(config.mongoUrl) && config.mongoUrl !== this.config.mongoUrl;
        Object.assign(this.config, config);
        if (urlHasChanged) {
            this.connection = new MongoConnection(this.config);
        }
    }
    static addSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.connect();
            const result = yield collection.insertOne(session);
            const _id = result.insertedId.toHexString();
            return Object.assign(session, { _id });
        });
    }
    static getSession(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.connect();
            const session = yield collection.findOne({ token });
            return this.normalizeRecord(session);
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
Database.config = config_1.DefaultConfig;
//# sourceMappingURL=database.js.map