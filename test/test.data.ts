import { SessionRecord } from '../src/types';


export type TestSessionData = Partial<SessionRecord> & { tokens?: string[] };

export const TestDataSessions: {[key: string]: TestSessionData} = {
    'user1': {
        userId: 'u23r1',
        username: 'john.doe@test.com',
        tokens: []
    },
    'user2': {
        userId: 'u45r2',
        username: 'jack.miller@example.com',
        tokens: []
    },
    'user-w-additional1': {
        userId: 25,
        username: 'jim.doe@test.com',
        additional: { merchantId: 123 },
        tokens: []
    }
};
