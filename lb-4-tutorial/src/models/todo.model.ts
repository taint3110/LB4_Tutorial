import { UserWithRelations } from './user.model';
import {Entity, model, property, belongsTo} from '@loopback/repository';
import { ProjectWithRelations } from './project.model';
import { PriorityEnum, StatusEnum } from './enum';
@model()
export class Todo extends Entity {
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
    type: 'string',
    jsonSchema: {
      enum: Object.values(PriorityEnum)
    }
  })
  priority?: PriorityEnum;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(StatusEnum)
    }
  })
  status?: StatusEnum;

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
  createAt?: Date;

  @property({
    type: 'date',
    default: new Date(),
  })
  updatedAt?: Date;

  @property({
    type: 'boolean',
  })
  isDeleted?: boolean;

  @property({
    type: 'string',
  })
  projectId?: string;

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}

export interface TodoRelations {
  project?: ProjectWithRelations;
  user?: UserWithRelations;
}

export type TodoWithRelations = Todo & TodoRelations;
