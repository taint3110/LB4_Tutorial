import { Filter, FilterExcludingWhere, Null, repository, Where } from '@loopback/repository';
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
import { taskRoutes, userRoutes } from './routes.helper'
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';
import { HttpErrors } from '@loopback/rest';
@authenticate("jwt")
export class ProjectUserUserController {
  constructor(
    @repository(ProjectUserRepository)
    public projectUserRepository: ProjectUserRepository,
    @repository(UserRepository)
    public userRepository : UserRepository,
    @repository(ProjectRepository)
    public projectRepository : ProjectRepository,

    @repository(TaskRepository)
    public taskRepository : TaskRepository,

    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,

    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) { }

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
    @param.path.string('id') id: typeof ProjectUser.prototype.id,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @requestBody() taskData: Task) {
    const projectUser = await this.projectUserRepository.findById(id)
    taskData.projectId = id
    await validateTaskCredentials(_.pick(taskData, ['title']), this.taskRepository);
    const currentProjectUser = await this.projectUserRepository.findOne({
      where:{
        userId: currentUser[securityId],
        projectId: projectUser.projectId
      }
    })
    if(currentProjectUser == null){
      throw new HttpErrors.UnprocessableEntity('This user is not in this project');
    }
    if(currentProjectUser.role == "user" && projectUser.role == "admin"){
      throw new HttpErrors.Forbidden("User cannot create task for admin")
    } 
    if(currentProjectUser.role == "user"){
      const createdByUserTask = await this.userRepository.tasks(projectUser.userId).create(taskData)
      return createdByUserTask
    } 
    if(currentProjectUser.role == "admin") {
      taskData.isCreatedByAdmin = true
      const createdByAdminTask = await this.userRepository.tasks(projectUser.userId).create(taskData)
      return createdByAdminTask
    }
  }

  @get(taskRoutes.getTasksInProject, {
    responses: {
      '200': {
        description: 'User belonging to ProjectUser',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getTasksInProject(
    @param.path.string('id') id: typeof ProjectUser.prototype.id,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ) {
    const foundProjectUser = await this.projectUserRepository.findById(id)
    const currentProjectUser = await this.projectUserRepository.findOne({
      where:{
        userId: currentUser[securityId],
        projectId: foundProjectUser.projectId
      }
    })
    if(currentProjectUser == null){
      throw new HttpErrors.UnprocessableEntity('This user is not in this project');
    }
    if(foundProjectUser == null){
      throw new HttpErrors.UnprocessableEntity('There is no projectUser found');
    }
    if(currentProjectUser.role == "user" && foundProjectUser.role =="admin"){
      throw new HttpErrors.UnprocessableEntity('User cannot read tasks of admin');
    } 
    if(currentProjectUser.role == "user"){
      return this.userRepository.tasks(foundProjectUser.userId).find()
    } 
    if(currentProjectUser.role == "admin") {
      return this.projectRepository.tasks(foundProjectUser.projectId).find()
    }
    throw new HttpErrors.UnprocessableEntity('You are not currently in any project');
  }
}
