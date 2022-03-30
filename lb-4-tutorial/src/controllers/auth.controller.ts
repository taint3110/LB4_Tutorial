import { Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { get, getJsonSchemaRef, post, param, getModelSchemaRef, requestBody, response } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import * as _ from 'lodash';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { User, Task, Project } from '../models';
import { Credentials, TaskRepository, UserRepository, ProjectRepository } from '../repositories';
import { validateCredentials, validateTaskData, validateProjectData } from '../services';
import { BcryptHasher } from '../services/hash.password';
import { JWTService } from '../services/jwt-service';
import { MyUserService } from '../services/user-service';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { authRoutes } from './routes.helper'
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';
import { CredentialsRequestBody } from '../type/credential-schema';

export class AuthController {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,
    @repository(TaskRepository)
    public taskRepository : TaskRepository,
    @repository(ProjectRepository)
    public projectRepository : ProjectRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) {}

  @post(authRoutes.signup, {
    responses: {
      '200': {
        description: 'Sign up a new user',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  async signup(@requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          title: 'NewUser',
          exclude: ['id'],
        }),
      },
    },
  }) userData: Omit<User, 'id'>) {
    await validateCredentials(_.pick(userData, ['email', 'password']), this.userRepository);
    userData.password = await this.hasher.hashPassword(userData.password)
    const savedUser = await this.userRepository.create(userData);
    return _.omit(savedUser, 'password');
  }

  @post(authRoutes.login, {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{ token: string }> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = await this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({ token: token })
  }


  @authenticate("jwt")
  @authorize({ allowedRoles: ['user'], voters: [basicAuthorization] })
  @get(authRoutes.getMe, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: 'application/json',
      },
    },
  })
  async me(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ): Promise<UserProfile> {
    return Promise.resolve(currentUser);
  }

}