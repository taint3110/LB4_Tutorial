import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {taskRoutes} from './routes.helper'
import {Task} from '../models';
import {TaskRepository} from '../repositories';

export class TaskController {
  constructor(
    @repository(TaskRepository)
    public taskRepository : TaskRepository,
  ) {}

  @post('/tasks')
  @response(200, {
    description: 'Task model instance',
    content: {'application/json': {schema: getModelSchemaRef(Task)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {
            title: 'NewTask',
            exclude: ['id'],
          }),
        },
      },
    })
    task: Omit<Task, 'id'>,
  ): Promise<Task> {
    return this.taskRepository.create(task);
  }

  @get('/tasks/{id}')
  @response(200, {
    description: 'Task model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Task, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Task, {exclude: 'where'}) filter?: FilterExcludingWhere<Task>
  ): Promise<Task> {
    return this.taskRepository.findById(id, filter);
  }

  @patch('/tasks/{id}')
  @response(204, {
    description: 'Task PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Task, {partial: true}),
        },
      },
    })
    task: Task,
  ): Promise<void> {
    await this.taskRepository.updateById(id, task);
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
