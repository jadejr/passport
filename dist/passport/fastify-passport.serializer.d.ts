import type { FastifyRequest } from 'fastify';
export declare abstract class FastifyPassportSerializer {
    abstract userSerializer(user: unknown, request: FastifyRequest): Promise<any>;
    abstract userDeserializer(payload: unknown, request: FastifyRequest): Promise<any>;
    constructor();
    getPassportInstance(): import("@fastify/passport").Authenticator;
}
