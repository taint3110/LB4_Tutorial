import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Task,
} from '../models';
import {TaskRepository} from '../repositories';

import { authenticate } from '@loopback/authentication';
@authenticate("jwt")
export class TaskTaskController {
  constructor(
    @repository(TaskRepository) protected taskRepository: TaskRepository,
  ) { }

  @get('/tasks/{id}/tasks', {
    responses: {
      '200': {
        description: 'Array of Task has many Task',
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
    return this.taskRepository.tasks(id).find(filter);
  }

  @del('/tasks/{id}/tasks', {
    responses: {
      '200': {
        description: 'Task.Task DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Task)) where?: Where<Task>,
  ): Promise<Count> {
    return this.taskRepository.tasks(id).delete(where);
  }
}
