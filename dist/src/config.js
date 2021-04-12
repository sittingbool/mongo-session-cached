"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultConfig = void 0;
const sb_util_ts_1 = require("sb-util-ts");
exports.DefaultConfig = {
    mongoUrl: sb_util_ts_1.envVariable('MONGO_DB_URL', 'mongo://localhost:27017'),
    sessionDbName: sb_util_ts_1.envVariable('MONGO_SESSION_DB_NAME', 'UserDb'),
    sessionCollection: sb_util_ts_1.envVariable('MONGO_SESSION_COLLECTION', 'Sessions'),
    defaultCacheTTl: sb_util_ts_1.envVariable('MONGO_CACHE_TTL', 3600, 'int'),
    sessionTTl: sb_util_ts_1.envVariable('MONGO_CACHE_TTL', 57600, 'int'),
    tokenTTl: sb_util_ts_1.envVariable('MONGO_CACHE_TTL', 7200, 'int'),
};
//# sourceMappingURL=config.js.map