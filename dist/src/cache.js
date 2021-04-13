"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const Loki = require("lokijs");
const lokijs_1 = require("lokijs");
const config_1 = require("./config");
const values_1 = require("./values");
const db = new Loki('mongo-session-cached.db', { adapter: new lokijs_1.LokiMemoryAdapter() });
class Cache {
    static cacheForName(name, options) {
        return this.namedCaches[name] || db.addCollection(name, options);
    }
    static stripLokiProperties(data) {
        if (!data)
            return data;
        const obj = Object.assign({}, data);
        delete obj.$loki;
        delete obj.meta;
        return obj;
    }
    static setConfig(config) {
        this.config = Object.assign(config_1.DefaultConfig, config);
    }
    static addSession(session) {
        const record = Object.assign({ cacheTTL: values_1.cacheTTl(this.config) }, session);
        return this.stripLokiProperties(this.sessions.insert(record));
    }
    static updateSessionExtension(token, session) {
        const record = this.sessions.findOne({ token });
        if (!record)
            return null;
        Object.assign(record, session);
        this.sessions.update(record);
        return this.stripLokiProperties(record);
    }
    static getSession(token, extendCacheTTL = true) {
        const session = this.sessions.find({ token })[0] || null;
        if (session && extendCacheTTL) {
            session.cacheTTL = values_1.cacheTTl(this.config);
        }
        return this.stripLokiProperties(session);
    }
    static addToCache(cacheName, data, cacheOptions) {
        return this.cacheForName(cacheName, cacheOptions).insert(data);
    }
    static removeSession(token) {
        return this.removeSessions({ token });
    }
    static removeSessions(by) {
        if (typeof by.$loki === 'number') {
            this.sessions.remove(by.$loki);
            return 1;
        }
        const found = this.sessions.find(by);
        if (!found.length)
            return 0;
        this.sessions.remove(found.map(i => i.$loki));
        return found.length;
    }
    static removeExpiredSessions() {
        this.sessions.removeWhere({ expirationDate: { $gte: Date.now() } });
    }
}
exports.Cache = Cache;
Cache.sessions = db.addCollection('sessions', { unique: ['token'], indices: ['token', 'username', 'userId'] });
Cache.config = config_1.DefaultConfig;
//# sourceMappingURL=cache.js.map