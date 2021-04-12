import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Database } from '../src/database';
import { TestDataSessions } from './test.data';
import { mapIsEmpty } from 'sb-util-ts';
import { makeSession } from '../src/values';
import { DefaultConfig } from '../src/config';


class TestDatabase extends Database {
    static async removeAll(): Promise<void> {
        const collection = await this.connect();
        await collection.deleteMany({});
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
@suite class DatabaseUnitTests {

    static before() {
        for (const user of Object.values(TestDataSessions)) {
            user.tokens = [];
        }
    }

    static async after(): Promise<void> {
        await TestDatabase.removeAll();
    }

    @test
    async addSimpleSessionCorrectly() {
        const { userId , username } = TestDataSessions['user1'];
        const result = await Database.addSession(makeSession(DefaultConfig, userId , username ));
        expect(mapIsEmpty(result)).to.be.false;
        expect(result.token).to.be.a('string');
        expect(result.token.length).to.be.above(32);
        expect(result.username).to.equal(username);
        expect(result.userId).to.equal(userId);
        TestDataSessions['user1'].tokens.push(result.token);
    }

    @test
    async getSimpleSessionCorrectly() {
        const { userId , username } = TestDataSessions['user1'];
        const token = TestDataSessions['user1'].tokens[0];
        const result = await Database.getSession(token);
        expect(mapIsEmpty(result)).to.be.false;
        expect(result.token).to.be.a('string');
        expect(result.token.length).to.be.above(32);
        expect(result.username).to.equal(username);
        expect(result.userId).to.equal(userId);
    }
}
