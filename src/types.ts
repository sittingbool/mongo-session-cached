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
    refreshToken: string;
}

export interface SessionRecord extends SessionDataInsert {
    $loki?: number; // cache id
    _id?: string;  // mongodb id
    cacheTTL?: number;
}

export interface PublicSessionData {
    token: string;
    partitionKey?: string;

    userId: string | number;
    username: string;
    additional?: { [key: string]: unknown };

    expirationDate: number;
    refreshDate: number;
}
