"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("@testdeck/mocha");
const chai_1 = require("chai");
const database_1 = require("../src/database");
const test_data_1 = require("./test.data");
const sb_util_ts_1 = require("sb-util-ts");
const values_1 = require("../src/values");
const config_1 = require("../src/config");
class TestDatabase extends database_1.Database {
    static removeAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.connect();
            yield collection.deleteMany({});
        });
    }
}
let DatabaseUnitTests = class DatabaseUnitTests {
    static after() {
        return __awaiter(this, void 0, void 0, function* () {
            yield TestDatabase.removeAll();
        });
    }
    addSessionSuccessfully() {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, username } = test_data_1.TestDataSessions['user1'];
            const result = yield database_1.Database.addSession(values_1.makeSession(config_1.DefaultConfig, userId, username));
            chai_1.expect(sb_util_ts_1.mapIsEmpty(result)).to.be.false;
        });
    }
};
__decorate([
    mocha_1.test
], DatabaseUnitTests.prototype, "addSessionSuccessfully", null);
DatabaseUnitTests = __decorate([
    mocha_1.suite
], DatabaseUnitTests);
//# sourceMappingURL=database.spec.js.map