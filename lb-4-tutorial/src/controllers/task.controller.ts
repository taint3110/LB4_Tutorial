import { Filter, FilterExcludingWhere, Null, repository, Where } from '@loopback/repository';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { get, getJsonSchemaRef, post, param, getModelSchemaRef, requestBody, response, patch, put, del } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import * as _ from 'lodash';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { User, Task, Project, ProjectUser } from '../models';
import { ProjectId, TaskRepository, TaskLinkData, UserRepository, ProjectRepository, ProjectUserRepository, ProjectUserData } from '../repositories';
import { validateProjectUserData, validateTaskData, validateTaskLinkData } from '../services';
import { BcryptHasher } from '../services/hash.password';
import { JWTService } from '../services/jwt-service';
import { MyUserService } from '../services/user-service';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { taskRoutes } from './routes.helper'
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';
import { HttpErrors } from '@loopback/rest';
import { RoleEnum } from '../models/enum';
import { partial } from 'lodash';

@authenticate("jwt")
export class TaskController {
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
  ) {}

  @post(taskRoutes.createUserTask, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User create user task',
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
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @requestBody() taskData: Task) {
    await validateTaskData(_.pick(taskData, ['title']), this.taskRepository);
    const currentProjectUser = await this.projectUserRepository.findOne({
      where:{
        userId: currentUser[securityId],
        projectId: taskData.projectId
      }
    })
    if(!currentProjectUser){
      throw new HttpErrors.UnprocessableEntity('This user is not in this project');
    }

    if(currentProjectUser.role === RoleEnum.USER){
      const createdByUserTask = await this.userRepository.tasks(id).create(taskData)
      return createdByUserTask
    } 
    if(currentProjectUser.role === RoleEnum.ADMIN) {
      taskData.isCreatedByAdmin = true
      const createdByAdminTask = await this.userRepository.tasks(id).create(taskData)
      return createdByAdminTask
    }
  }

  @post(taskRoutes.getTasksInProject, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User get tasks in project',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getTasksInProject(
    @param.path.string('id') id: typeof User.prototype.id,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @requestBody() data: ProjectId
  ) {
    const foundProjectUser = await this.projectUserRepository.findOne({
      where:{
        userId: id,
        projectId: data.id
      }
    })
    const currentProjectUser = await this.projectUserRepository.findOne({
      where:{
        userId: currentUser[securityId],
        projectId: data.id
      }
    })
    if(!currentProjectUser){
      throw new HttpErrors.UnprocessableEntity('This user is not in this project');
    }
    if(!foundProjectUser){
      throw new HttpErrors.UnprocessableEntity('The tasks to read are not in this project');
    }
    if(currentProjectUser.role == RoleEnum.USER && foundProjectUser.role ==RoleEnum.ADMIN){
      throw new HttpErrors.UnprocessableEntity('User cannot read tasks of admin');
    } 
    if(currentProjectUser.role == RoleEnum.USER){
      return this.userRepository.tasks(foundProjectUser.userId).find()
    } 
    if(currentProjectUser.role == RoleEnum.ADMIN) {
      return this.projectRepository.tasks(foundProjectUser.projectId).find()
    }
    throw new HttpErrors.UnprocessableEntity('You are not currently in any project');
  }

  @post(taskRoutes.createTaskLink, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'User creates task link',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Task),
          },
        },
      },
    },
  })
  async createTaskLink(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @requestBody() taskLinkData: TaskLinkData):Promise<void> {
    await validateTaskLinkData(taskLinkData, this.taskRepository)
    const parentTask = await this.taskRepository.findById(taskLinkData.parentId)
    const currentProjectUser = await this.projectUserRepository.findOne({
      where:{
        userId: currentUser[securityId],
        projectId: parentTask.projectId
      }
    })
    if(!currentProjectUser){
      throw new HttpErrors.UnprocessableEntity('User is not in this project');
    }
    return this.taskRepository.updateById(taskLinkData.taskId, {
      parentId: taskLinkData.parentId 
    })
  }

  @patch(taskRoutes.updateTask, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User updates task',
        content: {
          'application/json': {
            schema: getJsonSchemaRef(Task),
          },
        },
      },
    },
  })
  async updateTask(
    @param.path.string('id') id: typeof Task.prototype.id,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {partial: true}),
        },
      },
    }) taskData: Task):Promise<void> {
    if(taskData.title != null){
      await validateTaskData(_.pick(taskData, ['title']), this.taskRepository);
    }
    const updatedTask = await this.userRepository.tasks(currentUser[securityId]).find({
      where:{
        id: id
      }
    })
    if(updatedTask[0] != null){
      return this.taskRepository.updateById(updatedTask[0].id, taskData) 
    }
    throw new HttpErrors[404]('This user does not have the task requested to be updated');
  }
}
