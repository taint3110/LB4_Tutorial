import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {TodoList} from './todo-list.model';
import {Todo} from './todo.model';
import {User} from './user.model';

@model()
export class Project extends Entity {
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
  title: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isInprogress?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  isCodingDone?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  isFixing?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  isDone?: boolean;

  @property({
    type: 'date',
    default: new Date(),
  })
  createAt?: string;

  @property({
    type: 'date',
    default: new Date(),
  })
  updatedAt?: string;

  @belongsTo(() => TodoList)
  todoListId: string;

  @hasMany(() => Todo)
  todos: Todo[];

  @hasMany(() => User)
  users: User[];

  constructor(data?: Partial<Project>) {
    super(data);
  }
}

export interface ProjectRelations {
  // describe navigational properties here
}

export type ProjectWithRelations = Project & ProjectRelations;
