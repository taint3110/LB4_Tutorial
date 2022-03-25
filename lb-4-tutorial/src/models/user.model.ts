import {Entity, model, property, hasMany} from '@loopback/repository';
import {Todo, TodoWithRelations} from './todo.model';
import { RoleEnum } from './enum';
@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: false,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    default: "Male",
  })
  gender?: string;

  @property({
    type: 'date',
    default: new Date(),
  })
  createdAt?: Date;

  @property({
    type: 'date',
    default: new Date(),
  })
  updatedAt?: Date;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(RoleEnum)
    }
  })
  role?: RoleEnum;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  isActive?: boolean;

  @hasMany(() => Todo)
  todos: Todo[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
 todos: TodoWithRelations[];
}

export type UserWithRelations = User & UserRelations;
