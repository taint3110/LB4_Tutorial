import { UserWithRelations, User} from './user.model';
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
    },
    default: PriorityEnum.LOW
  })
  priority?: PriorityEnum;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(StatusEnum)
    },
    default: StatusEnum.TODO
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
    default: false
  })
  isDeleted?: boolean;

  @property({
    type: 'string',
  })
  projectId?: string;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Todo, {name: 'parent'})
  parentId: string;

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}

export interface TodoRelations {
  project?: ProjectWithRelations;
  assignedTo?: UserWithRelations;
  parent?: TodoWithRelations;
}

export type TodoWithRelations = Todo & TodoRelations;
