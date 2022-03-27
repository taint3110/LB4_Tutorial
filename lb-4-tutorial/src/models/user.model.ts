import {Entity, model, property, hasMany} from '@loopback/repository';
import {Task, TaskWithRelations} from './task.model';
import { RoleEnum } from './enum';
import {ProjectUser, ProjectUserWithRelations} from './project-user.model';

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
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  isActive?: boolean;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(RoleEnum)
    }
  })
  role?: RoleEnum;

  @hasMany(() => Task, {keyTo: 'assignedTo'})
  tasks: Task[];

  @hasMany(() => ProjectUser)
  projectUsers: ProjectUser[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
 tasks: TaskWithRelations[];
 projectUsers: ProjectUserWithRelations[]
}

export type UserWithRelations = User & UserRelations;
