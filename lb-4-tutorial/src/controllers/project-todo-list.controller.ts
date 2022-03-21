import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Project,
  TodoList,
} from '../models';
import {ProjectRepository} from '../repositories';

export class ProjectTodoListController {
  constructor(
    @repository(ProjectRepository)
    public projectRepository: ProjectRepository,
  ) { }

  @get('/projects/{id}/todo-list', {
    responses: {
      '200': {
        description: 'TodoList belonging to Project',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(TodoList)},
          },
        },
      },
    },
  })
  async getTodoList(
    @param.path.string('id') id: typeof Project.prototype.id,
  ): Promise<TodoList> {
    return this.projectRepository.todoList(id);
  }
}
