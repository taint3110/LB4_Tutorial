import { Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { get, getJsonSchemaRef, post, param, getModelSchemaRef, requestBody, response } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import * as _ from 'lodash';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { User, Task } from '../models';
import { Credentials, TaskRepository, UserRepository } from '../repositories';
import { validateCredentials, validateTaskCredentials } from '../services';
import { BcryptHasher } from '../services/hash.password';
import { JWTService } from '../services/jwt-service';
import { MyUserService } from '../services/user-service';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { userRoutes } from './routes.helper'
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';

export class UserTaskController {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,

    @repository(TaskRepository)
    public taskRepository : TaskRepository,

    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,

    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) { }

  @get('/users/{id}/tasks', {
    responses: {
      '200': {
        description: 'Array of User has many Task',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Task)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Task>,
  ): Promise<Task[]> {
    return this.userRepository.tasks(id).find(filter);
  }

  @post('/users/{id}/tasks', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Task)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {
            title: 'NewTaskInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) task: Omit<Task, 'id'>,
  ): Promise<Task> {
    return this.userRepository.tasks(id).create(task);
  }

}
