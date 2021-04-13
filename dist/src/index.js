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
exports.SessionManager = void 0;
const config_1 = require("./config");
const database_1 = require("./database");
const cache_1 = require("./cache");
const values_1 = require("./values");
class SessionManager {
    constructor(config = config_1.DefaultConfig) {
        this.config = config;
        this.forwardConfig();
    }
    forwardConfig() {
        database_1.Database.setConfig(this.config);
        cache_1.Cache.setConfig(this.config);
    }
    publicSession(session) {
        const { token, userId, username, additional, partitionKey, expirationDate, refreshDate } = session;
        return { token, userId, username, additional, partitionKey, expirationDate, refreshDate };
    }
    static setConfig(config) {
        Object.assign(config_1.DefaultConfig, config);
    }
    setConfig(config) {
        Object.assign(this.config, config);
        this.forwardConfig();
    }
    newSession(userId, username, additional = null, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = values_1.makeSession(this.config, userId, username, additional, token);
            const record = yield database_1.Database.addSession(session);
            cache_1.Cache.addSession(record);
            return this.publicSession(record);
        });
    }
    refreshSession(sessionToken, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield database_1.Database.getSession(sessionToken);
            if (!record)
                return null;
            if (refreshToken !== record.refreshToken) {
                throw new Error('TokenMissMatchError');
            }
            if (record.expirationDate < Date.now()) {
                throw new Error('ExpirationError');
            }
            values_1.refreshSessionToken(this.config, record);
            yield database_1.Database.updateSession(record);
            const cacheRecord = cache_1.Cache.getSession(sessionToken, true);
            if (cacheRecord) {
                cache_1.Cache.updateSessionExtension(sessionToken, record);
            }
            return this.publicSession(record);
        });
    }
    getSession(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let inCache = true;
            let record = cache_1.Cache.getSession(token);
            if (!record) {
                inCache = false;
                record = yield database_1.Database.getSession(token);
            }
            if (record.refreshDate < Date.now())
                throw new Error('NeedsRefresh');
            if (record.expirationDate < Date.now())
                throw new Error('ExpirationError');
            if (!inCache) {
                cache_1.Cache.addSession(record);
            }
            return this.publicSession(record);
        });
    }
}
exports.SessionManager = SessionManager;
//# sourceMappingURL=index.js.map