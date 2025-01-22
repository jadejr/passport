"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastifyPassportSerializer = void 0;
const passport_1 = require("@fastify/passport");
class FastifyPassportSerializer {
    constructor() {
        const passportInstance = this.getPassportInstance();
        passportInstance.registerUserSerializer(async (user, request) => {
            return await this.userSerializer(user, request);
        });
        passportInstance.registerUserDeserializer(async (payload, request) => {
            const result = this.userDeserializer(payload, request);
            return result;
        });
    }
    getPassportInstance() {
        return passport_1.default;
    }
}
exports.FastifyPassportSerializer = FastifyPassportSerializer;
