"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSessionToken = exports.makeSession = exports.cacheTTl = exports.sessionDefaults = exports.newRefreshToken = exports.newSessionToken = void 0;
const uuid_1 = require("uuid");
function newSessionToken() {
    return 's#' + uuid_1.v4();
}
exports.newSessionToken = newSessionToken;
function newRefreshToken() {
    return 'r#' + uuid_1.v4();
}
exports.newRefreshToken = newRefreshToken;
function sessionDefaults(config, token) {
    const refreshToken = newRefreshToken();
    const expirationDate = Date.now() + (config.sessionTTl * 1000);
    const refreshDate = Date.now() + (config.tokenTTl * 1000);
    token = token || newSessionToken();
    return { token, expirationDate, refreshDate, refreshToken };
}
exports.sessionDefaults = sessionDefaults;
function cacheTTl(config) {
    return Date.now() + config.defaultCacheTTl * 1000;
}
exports.cacheTTl = cacheTTl;
function makeSession(config, userId, username, additional = null, token) {
    const data = { userId, username };
    data.additional = additional || null;
    return Object.assign(data, sessionDefaults(config, token));
}
exports.makeSession = makeSession;
function refreshSessionToken(config, session) {
    session.token = newSessionToken();
    session.refreshToken = newRefreshToken();
    session.expirationDate = Date.now() + (config.sessionTTl * 1000);
    session.refreshDate = Date.now() + (config.tokenTTl * 1000);
    return session;
}
exports.refreshSessionToken = refreshSessionToken;
//# sourceMappingURL=values.js.map