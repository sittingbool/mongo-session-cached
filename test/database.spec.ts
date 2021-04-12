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

    static async after(): Promise<void> {
        await TestDatabase.removeAll();
    }

    @test
    async addSessionSuccessfully() {
        const { userId , username } = TestDataSessions['user1'];
        const result = await Database.addSession(makeSession(DefaultConfig, userId , username ));
        expect(mapIsEmpty(result)).to.be.false;
    }
}
