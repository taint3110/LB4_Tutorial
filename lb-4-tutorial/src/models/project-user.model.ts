import {Entity, model, property} from '@loopback/repository';

@model()
export class ProjectUser extends Entity {
  @property({
    type: 'date',
    default: new Date(),
  })
  createdAt?: string;

  constructor(data?: Partial<ProjectUser>) {
    super(data);
  }
}

export interface ProjectUserRelations {
  // describe navigational properties here
}

export type ProjectUserWithRelations = ProjectUser & ProjectUserRelations;
