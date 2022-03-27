import { Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { get, getJsonSchemaRef, post, param, getModelSchemaRef, requestBody, response, patch, put, del } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import * as _ from 'lodash';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { User, Task, Project, ProjectUser } from '../models';
import { Credentials, TaskRepository, UserRepository, ProjectRepository, ProjectUserRepository, ProjectUserCredentials } from '../repositories';
import { validateProjectUserCredentials, validateTaskCredentials, validateProjectCredentials } from '../services';
import { BcryptHasher } from '../services/hash.password';
import { JWTService } from '../services/jwt-service';
import { MyUserService } from '../services/user-service';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { projectRoutes } from './routes.helper'
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';

@authenticate("jwt")
@authorize({ allowedRoles: ['admin'], voters: [basicAuthorization] })
export class ProjectProjectUserController {
  constructor(
    
    @repository(UserRepository)
    public userRepository : UserRepository,
    @repository(TaskRepository)
    public taskRepository : TaskRepository,
    @repository(ProjectRepository)
    public projectRepository : ProjectRepository,
    @repository(ProjectUserRepository)
    public projectUserRepository : ProjectUserRepository,
    @repository(ProjectRepository)
    public hasher: BcryptHasher,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) { }
  
  @get(projectRoutes.getProjectUser, {
    responses: {
      '200': {
        description: 'Array of Project has many ProjectUser',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ProjectUser)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<ProjectUser>,
  ): Promise<ProjectUser[]> {
    return this.projectRepository.projectUsers(id).find(filter);
  }

  @post(projectRoutes.createProjectUser, {
    responses: {
      '200': {
        description: 'Project model instance',
        content: {'application/json': {schema: getModelSchemaRef(ProjectUser)}},
      },
    },
  })
  async createProjectUser(
    @param.path.string('id') id: typeof Project.prototype.id,
    @requestBody() projectUser: ProjectUserCredentials
  ): Promise<ProjectUser> {
    await validateProjectUserCredentials(_.pick(projectUser, ['userId', 'projectId']), this.projectUserRepository, this.projectRepository);
    return this.projectRepository.projectUsers(id).create(projectUser);
  }

}
