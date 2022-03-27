import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Task, TaskWithRelations} from './task.model';
import {User} from './user.model';
import {ProjectUser, ProjectUserWithRelations} from './project-user.model';

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
  })
  isActive?: boolean;

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
    default: false,
  })
  isDeleted?: boolean;

  @hasMany(() => Task)
  tasks: Task[];

  @hasMany(() => ProjectUser)
  projectUsers: ProjectUser[];

  constructor(data?: Partial<Project>) {
    super(data);
  }
}

export interface ProjectRelations {
  projectUsers?: ProjectUserWithRelations[]
  tasks?: TaskWithRelations[]
}

export type ProjectWithRelations = Project & ProjectRelations;
