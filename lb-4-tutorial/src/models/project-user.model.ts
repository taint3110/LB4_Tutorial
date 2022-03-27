import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Project, ProjectWithRelations} from './project.model';
import {User} from './user.model';
import { RoleEnum } from './enum';
import { UserWithRelations } from '@loopback/authentication-jwt';
@model()
export class ProjectUser extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(RoleEnum)
    },
    required: true,
    default: RoleEnum.USER
  })
  role?: RoleEnum;

  @property({
    type: 'date',
    default: new Date(),
  })
  createdAt?: string;

  @property({
    type: 'date',
    default: new Date(),
  })
  updatedAt?: string;
  @belongsTo(() => Project)
  projectId: string;

  @belongsTo(() => User)
  userId: string;

  constructor(data?: Partial<ProjectUser>) {
    super(data);
  }
}

export interface ProjectUserRelations {
  project?: ProjectWithRelations;
  user?: UserWithRelations;
}

export type ProjectUserWithRelations = ProjectUser & ProjectUserRelations;
