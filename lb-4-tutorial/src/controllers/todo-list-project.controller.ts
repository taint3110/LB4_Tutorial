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
  TodoList,
  Project,
} from '../models';
import {TodoListRepository} from '../repositories';

export class TodoListProjectController {
  constructor(
    @repository(TodoListRepository) protected todoListRepository: TodoListRepository,
  ) { }

  @get('/todo-lists/{id}/projects', {
    responses: {
      '200': {
        description: 'Array of TodoList has many Project',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Project)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Project>,
  ): Promise<Project[]> {
    return this.todoListRepository.projects(id).find(filter);
  }

  @post('/todo-lists/{id}/projects', {
    responses: {
      '200': {
        description: 'TodoList model instance',
        content: {'application/json': {schema: getModelSchemaRef(Project)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof TodoList.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Project, {
            title: 'NewProjectInTodoList',
            exclude: ['id'],
            optional: ['todoListId']
          }),
        },
      },
    }) project: Omit<Project, 'id'>,
  ): Promise<Project> {
    return this.todoListRepository.projects(id).create(project);
  }

  @patch('/todo-lists/{id}/projects', {
    responses: {
      '200': {
        description: 'TodoList.Project PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Project, {partial: true}),
        },
      },
    })
    project: Partial<Project>,
    @param.query.object('where', getWhereSchemaFor(Project)) where?: Where<Project>,
  ): Promise<Count> {
    return this.todoListRepository.projects(id).patch(project, where);
  }

  @del('/todo-lists/{id}/projects', {
    responses: {
      '200': {
        description: 'TodoList.Project DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Project)) where?: Where<Project>,
  ): Promise<Count> {
    return this.todoListRepository.projects(id).delete(where);
  }
}
