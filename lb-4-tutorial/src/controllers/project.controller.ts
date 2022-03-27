import { Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { get, getJsonSchemaRef, post, param, getModelSchemaRef, requestBody, response, patch, put, del } from '@loopback/rest';
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
@authenticate("jwt")
export class ProjectController {
  constructor(
    @repository(ProjectRepository)
    public projectRepository : ProjectRepository,
    @repository(UserRepository)
    public userRepository : UserRepository,
    @repository(TaskRepository)
    public taskRepository : TaskRepository,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) {}

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

  @get('/projects')
  @response(200, {
    description: 'Array of Project model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Project, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Project) filter?: Filter<Project>,
  ): Promise<Project[]> {
    return this.projectRepository.find(filter);
  }


  @get('/projects/{id}')
  @response(200, {
    description: 'Project model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Project, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Project, {exclude: 'where'}) filter?: FilterExcludingWhere<Project>
  ): Promise<Project> {
    return this.projectRepository.findById(id, filter);
  }

  @patch('/projects/{id}')
  @response(204, {
    description: 'Project PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Project, {partial: true}),
        },
      },
    })
    project: Project,
  ): Promise<void> {
    await this.projectRepository.updateById(id, project);
  }

  @put('/projects/{id}')
  @response(204, {
    description: 'Project PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() project: Project,
  ): Promise<void> {
    await this.projectRepository.replaceById(id, project);
  }

  @del('/projects/{id}')
  @response(204, {
    description: 'Project DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.projectRepository.deleteById(id);
  }
}
