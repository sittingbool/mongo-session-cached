import { SessionRecord } from '../src/types';
export declare type TestSessionData = Partial<SessionRecord> & {
    tokens?: string[];
};
export declare const TestDataSessions: {
    [key: string]: TestSessionData;
};
