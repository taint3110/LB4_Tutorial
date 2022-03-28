
import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {SECURITY_SCHEME_SPEC} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {JWTStrategy} from './authentication/authentication';
import {PasswordHasherBindings, TokenServiceBindings, TokenServiceConstants, UserServiceBindings} from './keys';
import {MySequence} from './sequence';
import {BcryptHasher} from './services/hash.password';
import {JWTService} from './services/jwt-service';
import {MyUserService} from './services/user-service';
import * as dotenv from 'dotenv';
import {CronComponent} from '@loopback/cron';
import * as CronJobs from './cronJob/index'

export {ApplicationConfig};
export class AuthApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {

    super(options);
    this.setupBinding();

    this.addSecuritySpec();

    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JWTStrategy)

    this.sequence(MySequence);

    this.static('/', path.join(__dirname, '../public'));
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;

    this.bootOptions = {
      controllers: {

        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    Object.entries(CronJobs).forEach(([_key, value]) => {
      const cronJob = value;
      this.add(cronJob);
    });

    this.component(CronComponent);

  }
  setupBinding(): void {
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
    this.bind(PasswordHasherBindings.ROUNDS).to(10)
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(TokenServiceConstants.TOKEN_SECRET_VALUE)
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE);
  }
  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'test application',
        version: '1.0.0',
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      security: [
        {
          jwt: [],
        },
      ],
      servers: [{url: '/'}],
    });
  }
}