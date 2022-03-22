import { Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { get, getJsonSchemaRef, post, param, getModelSchemaRef, requestBody, response } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import * as _ from 'lodash';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { User, Todo, TodoList } from '../models';
import { Credentials, UserRepository, TodoListRepository } from '../repositories';
import { validateCredentials } from '../services';
import { BcryptHasher } from '../services/hash.password';
import { JWTService } from '../services/jwt-service';
import { MyUserService } from '../services/user-service';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { userRoutes, adminRoutes } from './routes.helper'
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';


export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,

    @repository(TodoListRepository)
    public todoListRepository : TodoListRepository,

    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,

    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) {}

  @post(userRoutes.signup, {
    responses: {
      '200': {
        description: 'Sign up',
        content: {
          schema: getJsonSchemaRef(User)
        }
      }
    }
  })
  async signup(@requestBody() userData: User) {
    await validateCredentials(_.pick(userData, ['email', 'password']), this.userRepository);
    userData.password = await this.hasher.hashPassword(userData.password)
    const savedUser = await this.userRepository.create(userData);
    return _.omit(savedUser, 'password');
  }

  @post(userRoutes.login, {
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
    @requestBody() credentials: Credentials,
  ): Promise<{ token: string }> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = await this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({ token: token })
  }


  @authenticate("jwt")
  @authorize({ allowedRoles: ['user'], voters: [basicAuthorization] })
  @get(userRoutes.getMe, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: getJsonSchemaRef(User),
          },
        },
      },
    },
  })
  async me(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ): Promise<UserProfile> {
    return Promise.resolve(currentUser);
  }

  @authenticate("jwt")
  @authorize({ allowedRoles: ['admin'], voters: [basicAuthorization] })
  @post(adminRoutes.createTodoList, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Create todoList',
        content: {
          schema: getJsonSchemaRef(TodoList)
        }
      }
    },
  })
  async createTodoList(
    @requestBody() todoListData: TodoList,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ) {
    //await validateCredentials(_.pick(todoListData, ['title']), this.todoListRepository);
    todoListData.createdBy = currentUser[securityId]
    const savedTodoList = await this.todoListRepository.create(todoListData);
    return _.omit(savedTodoList, 'isDeleted');
  }

}