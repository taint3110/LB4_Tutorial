import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Todo,
} from '../models';
import {TodoRepository} from '../repositories';

export class TodoTodoController {
  constructor(
    @repository(TodoRepository)
    public todoRepository: TodoRepository,
  ) { }

  @get('/todos/{id}/todo', {
    responses: {
      '200': {
        description: 'Todo belonging to Todo',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Todo)},
          },
        },
      },
    },
  })
  async getTodo(
    @param.path.string('id') id: typeof Todo.prototype.id,
  ): Promise<Todo> {
    return this.todoRepository.parent(id);
  }
}
