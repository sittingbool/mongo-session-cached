"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CacheUnitTests_1;
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("@testdeck/mocha");
const chai_1 = require("chai");
const cache_1 = require("../src/cache");
const sb_util_ts_1 = require("sb-util-ts");
const config_1 = require("../src/config");
const test_data_1 = require("./test.data");
const values_1 = require("../src/values");
class TestCache extends cache_1.Cache {
    static get currentConfig() {
        return this.config;
    }
    static get sessionsCol() {
        return this.sessions;
    }
}
let CacheUnitTests = CacheUnitTests_1 = class CacheUnitTests {
    addSessionForUser(testDataKey, checkResult = true) {
        const token = values_1.newSessionToken();
        const { userId, username, additional } = test_data_1.TestDataSessions[testDataKey];
        const sessionData = values_1.makeSession(TestCache.currentConfig, userId, username, additional, token);
        const session = TestCache.addSession(sessionData);
        if (checkResult) {
            const addedSession = TestCache.sessionsCol.find({ token });
            chai_1.expect(sb_util_ts_1.mapIsEmpty(addedSession)).to.be.false;
            chai_1.expect(session.token).to.be.equal(token);
        }
        return session;
    }
    alterConfig() {
        chai_1.expect(TestCache.currentConfig).to.eql(config_1.DefaultConfig);
        const change = { defaultCacheTTl: 1000 };
        TestCache.setConfig(change);
        chai_1.expect(TestCache.currentConfig).to.eql(Object.assign(config_1.DefaultConfig, change));
    }
    addSimpleSessionCorrectly() {
        const token = values_1.newSessionToken();
        const { userId, username } = test_data_1.TestDataSessions['user1'];
        const session = values_1.makeSession(TestCache.currentConfig, userId, username, null, token);
        CacheUnitTests_1.testTokens[token] =
            TestCache.addSession(session);
        const allSessions = TestCache.sessionsCol.find();
        const addedSession = allSessions.find(s => s.token === token);
        chai_1.expect(sb_util_ts_1.mapIsEmpty(addedSession)).to.be.false;
        chai_1.expect(addedSession.username).to.equal(username);
        chai_1.expect(addedSession.userId).to.equal(userId);
        test_data_1.TestDataSessions['user1'].tokens.push(token);
    }
    addAdvancedSessionCorrectly() {
        const token = values_1.newSessionToken();
        const { userId, username, additional } = test_data_1.TestDataSessions['user-w-additional1'];
        const session = values_1.makeSession(TestCache.currentConfig, userId, username, additional, token);
        CacheUnitTests_1.testTokens[token] =
            TestCache.addSession(session);
        const allSessions = TestCache.sessionsCol.find();
        const addedSession = allSessions.find(s => s.token === token);
        chai_1.expect(sb_util_ts_1.mapIsEmpty(addedSession)).to.be.false;
        chai_1.expect(addedSession.username).to.equal(username);
        chai_1.expect(addedSession.userId).to.equal(userId);
        chai_1.expect(addedSession.additional).to.eql(additional);
        test_data_1.TestDataSessions['user-w-additional1'].tokens.push(token);
    }
    getSessions() {
        const token1 = test_data_1.TestDataSessions['user1'].tokens[0];
        const token2 = test_data_1.TestDataSessions['user-w-additional1'].tokens[0];
        const clearCacheTTL = session => Object.assign({}, session, { cacheTTL: null });
        const session1 = TestCache.getSession(token1);
        const sessionExpect1 = CacheUnitTests_1.testTokens[token1];
        chai_1.expect(session1.cacheTTL).to.be.above(sessionExpect1.cacheTTL);
        chai_1.expect(clearCacheTTL(session1), 'comparing session 1').to.eql(clearCacheTTL(sessionExpect1));
        const session2 = TestCache.getSession(token2);
        const sessionExpect2 = CacheUnitTests_1.testTokens[token2];
        chai_1.expect(session2.cacheTTL).to.be.above(sessionExpect2.cacheTTL);
        chai_1.expect(clearCacheTTL(session2), 'comparing session 2').to.eql(clearCacheTTL(sessionExpect2));
    }
    removeSession() {
        const session = this.addSessionForUser('user2');
        const { token } = session;
        TestCache.removeSession(token);
        const addedSession = TestCache.sessionsCol.find({ token });
        chai_1.expect(sb_util_ts_1.arrayIsEmpty(addedSession)).to.be.true;
    }
    removeExpiredSessions() {
        const sessions = [];
        sessions.push(this.addSessionForUser('user2'));
        for (const s of sessions) {
            s.expirationDate = Date.now() - 10;
        }
        TestCache.removeExpiredSessions();
        for (const s of sessions) {
            const { token } = s;
            const addedSession = TestCache.sessionsCol.find({ token });
            chai_1.expect(sb_util_ts_1.arrayIsEmpty(addedSession)).to.be.true;
        }
    }
};
CacheUnitTests.testTokens = {};
__decorate([
    mocha_1.test
], CacheUnitTests.prototype, "alterConfig", null);
__decorate([
    mocha_1.test
], CacheUnitTests.prototype, "addSimpleSessionCorrectly", null);
__decorate([
    mocha_1.test
], CacheUnitTests.prototype, "addAdvancedSessionCorrectly", null);
__decorate([
    mocha_1.test
], CacheUnitTests.prototype, "getSessions", null);
__decorate([
    mocha_1.test
], CacheUnitTests.prototype, "removeSession", null);
__decorate([
    mocha_1.test
], CacheUnitTests.prototype, "removeExpiredSessions", null);
CacheUnitTests = CacheUnitTests_1 = __decorate([
    mocha_1.suite
], CacheUnitTests);
//# sourceMappingURL=cache.spec.js.map