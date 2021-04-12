export interface SessionData {
    token?: string;
    partitionKey?: string;
    userId: string | number;
    username: string;
    additional?: { [key: string]: unknown };
}

export interface SessionDataInsert extends SessionData {
    token: string;
    expirationDate: number;
    refreshDate: number;
}

export interface SessionRecord extends SessionDataInsert {
    $loki?: number; // cache id
    id?: string;  // mongodb id
    cacheTTL?: number;
}
