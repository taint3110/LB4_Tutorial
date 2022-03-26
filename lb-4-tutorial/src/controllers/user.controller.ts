import { Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { get, getJsonSchemaRef, post, param, getModelSchemaRef, requestBody, response } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import * as _ from 'lodash';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { User, Todo, Project } from '../models';
import { Credentials, TodoRepository, UserRepository, ProjectRepository } from '../repositories';
import { validateCredentials, validateTodoCredentials, validateProjectCredentials } from '../services';
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
    @repository(TodoRepository)
    public todoRepository : TodoRepository,
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
  @post(userRoutes.createUserTodo, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Admin create user todo',
        content: {
          'application/json': {
            schema: getJsonSchemaRef(Todo),
          },
        },
      },
    },
  })
  async createUserTodo(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody() todoData: Todo) {
    
    await validateTodoCredentials(_.pick(todoData, ['title']), this.todoRepository);
    const savedTodo = await this.userRepository.todos(id).create(todoData);
    // return _.omit(savedTodo, 'password');
    return savedTodo;
  }

  @authenticate("jwt")
  @authorize({ allowedRoles: ['admin'], voters: [basicAuthorization] })
  @post(userRoutes.createProject, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Admin create project',
        content: {
          'application/json': {
            schema: getJsonSchemaRef(Project),
          },
        },
      },
    },
  })
  async createProject(
    @requestBody() projectData: Project) {
    await validateProjectCredentials(_.pick(projectData, ['title']), this.projectRepository);
    const savedProject = await this.projectRepository.create(projectData)
    return savedProject;
  }

  @authenticate("jwt")
  @authorize({ allowedRoles: ['admin'], voters: [basicAuthorization] })
  @post(userRoutes.createTodo, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Admin create project',
        content: {
          'application/json': {
            schema: getJsonSchemaRef(Todo),
          },
        },
      },
    },
  })
  async createTodo(
    @param.path.string('id') id: typeof Todo.prototype.id,
    @requestBody() todoData: Todo) {
    await validateTodoCredentials(_.pick(todoData, ['title']), this.todoRepository);
    const savedTodo = await this.projectRepository.todos(id).create(todoData)
    return savedTodo;
  }

}