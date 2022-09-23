import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyPassport from '@fastify/passport';
import { INestApplication } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { spec, request } from 'pactum';
import { AppModule as WithRegisterModule } from '../with-register/app.module';
import { AppModule as WithoutRegisterModule } from '../without-register/app.module';

describe.each`
  AppModule                | RegisterUse
  ${WithRegisterModule}    | ${'with'}
  ${WithoutRegisterModule} | ${'without'}
`('Passport Module $RegisterUse register()', ({ AppModule }) => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = modRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    const fastifyInstance = app.getHttpAdapter().getInstance();
    await fastifyInstance.register(fastifyCookie);
    await fastifyInstance.register(fastifySession, {
      secret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxs3cr3t'
    });
    await fastifyInstance.register(fastifyPassport.initialize());
    await fastifyInstance.register(fastifyPassport.secureSession());

    await app.listen(0);
    const url = (await app.getUrl()).replace('[::1]', 'localhost');
    request.setBaseUrl(url);
  });

  describe('Authenticated flow', () => {
    it('should be able to log in and get a jwt, then hit the secret route', async () => {
      await spec()
        .post('/login')
        .withBody({ username: 'test1', password: 'test' })
        .expectStatus(201)
        .stores('token', 'token');
      await spec()
        .get('/private')
        .withHeaders('Authorization', 'Bearer $S{token}')
        .expectBody({ message: 'Hello secure world!' });
    });
  });
  describe('UnauthenticatedFlow', () => {
    it('should return a 401 for an invalid login', async () => {
      await spec()
        .post('/login')
        .withBody({ username: 'test1', password: 'not the right password' })
        .expectStatus(401);
    });
    it('should return a 401 for an invalid JWT', async () => {
      await spec()
        .get('/private')
        .withHeaders('Authorization', 'Bearer not-a-jwt')
        .expectStatus(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
