import { Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { get, getJsonSchemaRef, post, param, getModelSchemaRef, requestBody, response } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import * as _ from 'lodash';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { User, Task, Project } from '../models';
import { Credentials, TaskRepository, UserRepository, ProjectRepository } from '../repositories';
import { validateCredentials, validateTaskCredentials, validateProjectCredentials } from '../services';
import { BcryptHasher } from '../services/hash.password';
import { JWTService } from '../services/jwt-service';
import { MyUserService } from '../services/user-service';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { userRoutes } from './routes.helper'
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';


export class UserController {
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
  @post(userRoutes.createUserTask, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Admin create user task',
        content: {
          'application/json': {
            schema: getJsonSchemaRef(Task),
          },
        },
      },
    },
  })
  async createUserTask(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody() taskData: Task) {
    await validateTaskCredentials(_.pick(taskData, ['title']), this.taskRepository);
    const savedTask = await this.userRepository.tasks(id).create(taskData);
    // return _.omit(savedTask, 'password');
    return savedTask;
  }


  @authenticate("jwt")
  @authorize({ allowedRoles: ['admin'], voters: [basicAuthorization] })
  @post(userRoutes.createTask, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Admin create project',
        content: {
          'application/json': {
            schema: getJsonSchemaRef(Task),
          },
        },
      },
    },
  })
  async createTask(
    @param.path.string('id') id: typeof Task.prototype.id,
    @param.query.object('filter') filter: Filter<User>,
    @requestBody() taskData: Task) {
    await validateTaskCredentials(_.pick(taskData, ['title']), this.taskRepository);
    const savedTask = await this.projectRepository.tasks(id).create(taskData)
    return savedTask;
  }

}