import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Cache } from '../src/cache';
import { SessionRecord } from '../src/types';
import { arrayIsEmpty, IMap, mapIsEmpty } from 'sb-util-ts';
import { DefaultConfig, ISessionConfig } from '../src/config';
import { TestDataSessions, TestSessionData } from './test.data';
import { newSessionToken } from '../src/values';


class TestCache extends Cache {
    static get currentConfig(): ISessionConfig {
        return this.config;
    }

    static get sessionsCol(): Collection<SessionRecord> {
        return this.sessions;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
@suite class CacheUnitTests {

    private static testTokens: IMap<SessionRecord> = {};

    addSessionForUser(testDataKey: string, checkResult: boolean = true): TestSessionData {
        const token = newSessionToken();
        const { userId , username } = TestDataSessions[testDataKey];
        const session = TestCache.addSession(token, userId, username);

        if (checkResult) {
            const addedSession = TestCache.sessionsCol.find({ token });
            expect(mapIsEmpty(addedSession)).to.be.false;
            expect(session.token).to.be.equal(token);
        }

        return session;
    }

    @test
    alterConfig() {
        // before changed check
        expect(TestCache.currentConfig).to.eql(DefaultConfig);

        const change = { defaultCacheTTl: 1000 };
        TestCache.setConfig(change);
        expect(TestCache.currentConfig).to.eql(Object.assign(DefaultConfig, change));
    }


    @test
    addSimpleSessionCorrectly() {
        const token = newSessionToken();
        const { userId , username } = TestDataSessions['user1'];
        CacheUnitTests.testTokens[token] =
            TestCache.addSession(token, userId, username);

        const allSessions = TestCache.sessionsCol.find();
        const addedSession = allSessions.find(s => s.token === token);
        expect(mapIsEmpty(addedSession)).to.be.false;
        expect(addedSession.username).to.equal(username);
        expect(addedSession.userId).to.equal(userId);
        TestDataSessions['user1'].tokens.push(token);
    }

    @test
    addAdvancedSessionCorrectly() {
        const token = newSessionToken();
        const { userId, username, additional } = TestDataSessions['user-w-additional1'];
        CacheUnitTests.testTokens[token] =
            TestCache.addSession(token, userId, username, additional);

        const allSessions = TestCache.sessionsCol.find();
        const addedSession = allSessions.find(s => s.token === token);
        expect(mapIsEmpty(addedSession)).to.be.false;
        expect(addedSession.username).to.equal(username);
        expect(addedSession.userId).to.equal(userId);

        expect(addedSession.additional).to.eql(additional);
        TestDataSessions['user-w-additional1'].tokens.push(token);
    }

    @test
    getSessions() {
        const token1 = TestDataSessions['user1'].tokens[0];
        const token2 = TestDataSessions['user-w-additional1'].tokens[0];
        const clearCacheTTL = session => Object.assign({}, session, { cacheTTL: null });

        const session1 = TestCache.getSession(token1);
        const sessionExpect1 = CacheUnitTests.testTokens[token1];
        expect(session1.cacheTTL).to.be.above(sessionExpect1.cacheTTL);
        expect(clearCacheTTL(session1), 'comparing session 1').to.eql(clearCacheTTL(sessionExpect1));

        const session2 = TestCache.getSession(token2);
        const sessionExpect2 = CacheUnitTests.testTokens[token2];
        expect(session2.cacheTTL).to.be.above(sessionExpect2.cacheTTL);
        expect(clearCacheTTL(session2), 'comparing session 2').to.eql(clearCacheTTL(sessionExpect2));
    }

    @test
    removeSession() {
        const session = this.addSessionForUser('user2');
        const { token } = session;

        TestCache.removeSession(token);

        const addedSession = TestCache.sessionsCol.find({ token });
        expect(arrayIsEmpty(addedSession)).to.be.true;
    }

    @test
    removeExpiredSessions() {
        const sessions: TestSessionData[] = [];
        sessions.push(this.addSessionForUser('user2'));

        for(const s of sessions) {
            s.expirationDate = Date.now() - 10;
        }

        TestCache.removeExpiredSessions();

        for(const s of sessions) {
            const { token } = s;
            const addedSession = TestCache.sessionsCol.find({ token });
            expect(arrayIsEmpty(addedSession)).to.be.true;
        }
    }

    // TODO: refresh session token and find again
}
