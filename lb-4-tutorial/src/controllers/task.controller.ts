import { Filter, FilterExcludingWhere, Null, repository, Where } from '@loopback/repository';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { get, getJsonSchemaRef, post, param, getModelSchemaRef, requestBody, response, patch, put, del } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import * as _ from 'lodash';
import set from 'lodash/set';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { User, Task, Project, ProjectUser, TaskWithRelations } from '../models';
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
import { TaskLinkRequestBody } from '../type/taskLink-schema';

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
      '204': {
        description: 'User create user task',
      },
    },
  })
  async createUserTask(
    @param.path.string('id') id: typeof User.prototype.id,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {
            title: "NewTask",
            exclude: ['id', 'isCreatedByAdmin'],
          }),
        },
      },
    }) taskData: Omit<Task, 'id' | 'isCreatedByAdmin'>) {
    await validateTaskData(_.pick(taskData, ['title']), this.taskRepository);
    if(currentUser.role === RoleEnum.USER){
      const createdByUserTask = await this.userRepository.tasks(id).create(taskData)
      return createdByUserTask
    } 
    if(currentUser.role === RoleEnum.ADMIN) {
      set(taskData, 'isCreatedByAdmin', true)
      set(taskData, 'createdBy', currentUser[securityId])
      const createdByAdminTask = await this.userRepository.tasks(id).create(taskData)
      return createdByAdminTask
    }
  }

  @post(taskRoutes.createTask)
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Task model instance',
    content: {'application/json': {schema: getModelSchemaRef(Task)}},
  })
  async create(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {
            title: 'NewTask',
            exclude: ['id', 'createdAt', 'updatedAt', 'isDeleted',],
          }),
        },
      },
    })
    task: Omit<Task, 'id' | 'isCreatedByAdmin'>,
  ): Promise<Task> {
    const role: RoleEnum = currentUser?.role ?? RoleEnum.USER;
    const userId: string = currentUser?.id;
    set(task, 'isCreatedByAdmin', role === RoleEnum.ADMIN)
    set(task, 'createdBy', userId);
    return this.taskRepository.create(task);
  }

  @get(taskRoutes.getTasksInProject, {
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
    @param.path.string('userId') userId: typeof User.prototype.id,
    @param.path.string('projectId') projectId: typeof Project.prototype.id,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ) {
    const foundProjectUser = await this.projectUserRepository.findOne({
      where:{
        userId: userId,
        projectId: projectId,
      }
    })
    const currentProjectUser = await this.projectUserRepository.findOne({
      where:{
        userId: currentUser[securityId],
        projectId: projectId
      }
    })
    if(!currentProjectUser){
      throw new HttpErrors[204]('This user is not in this project');
    }
    if(!foundProjectUser){
      throw new HttpErrors[204]('The tasks to read are not in this project');
    }
    if(currentProjectUser.role === RoleEnum.USER && foundProjectUser.role ===RoleEnum.ADMIN){
      throw new HttpErrors[401]('User cannot read tasks of admin');
    } 
    if(currentProjectUser.role !== RoleEnum.ADMIN ){
      return this.userRepository.tasks(foundProjectUser.userId).find()
    } 
    if(currentProjectUser.role === RoleEnum.ADMIN) {
      return this.projectRepository.tasks(foundProjectUser.projectId).find()
    }
  }

  @get(taskRoutes.getTask)
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Task model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Task, {includeRelations: true}),
      },
    },
  })
  async findById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param.path.string('id') id: string,
    @param.filter(Task, {exclude: 'where'}) filter?: FilterExcludingWhere<Task>,
  ): Promise<Task> {
    const role: RoleEnum = currentUser.role ?? RoleEnum.USER;
    const userId: string = currentUser[securityId];
    const task: TaskWithRelations = await this.taskRepository.findById(
      id,
      filter,
    );
    if (role !== RoleEnum.ADMIN && task?.isCreatedByAdmin && task?.userId !== userId) {
      throw new HttpErrors.Unauthorized('This task can not be seen by user');
    }
    return task;
  }


  @post(taskRoutes.createTaskLink, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'User creates task link',
      },
    },
  })
  async createTaskLink(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @requestBody(TaskLinkRequestBody) taskLinkData: TaskLinkData):Promise<void> {
    await validateTaskLinkData(taskLinkData, this.taskRepository)
    const parentTask = await this.taskRepository.findById(taskLinkData.parentId)
    return this.taskRepository.updateById(taskLinkData.taskId, {
      parentId: taskLinkData.parentId 
    })
  }

  @patch(taskRoutes.updateTask, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'task PATCH success',
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
    if(taskData.title){
      await validateTaskData(_.pick(taskData, ['title']), this.taskRepository);
    }
    const updatedTask = await this.userRepository.tasks(currentUser[securityId]).find({
      where:{
        id: id
      }
    })
      return this.taskRepository.updateById(updatedTask[0].id, taskData) 

  }

  @put('/tasks/{id}')
  @response(204, {
    description: 'Task PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() task: Task,
  ): Promise<void> {
    await this.taskRepository.replaceById(id, task);
  }

  @del('/tasks/{id}')
  @response(204, {
    description: 'Task DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.taskRepository.deleteById(id);
  }
}
