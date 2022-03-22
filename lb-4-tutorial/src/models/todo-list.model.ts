import {Entity, model, property, hasMany} from '@loopback/repository';
import {Todo} from './todo.model';
import {Project} from './project.model';

@model()
export class TodoList extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  title?: string;

  @property({
    type: 'string',
  })
  color?: string;

  @property({
    type: 'string',
  })
  createdBy?: string;

  @property({
    type: 'Date',
    default: new Date()
  })
  createdAt?: Date;

  @property({
    type: 'boolean',
  })
  isDeleted?: boolean;

  @hasMany(() => Project)
  projects: Project[];

  constructor(data?: Partial<TodoList>) {
    super(data);
  }
}

export interface TodoListRelations {
  // describe navigational properties here
}

export type TodoListWithRelations = TodoList & TodoListRelations;
