import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {DatabaseDataSource} from '../datasources';
import {Project, ProjectRelations, Task, User, ProjectUser} from '../models';
import {TaskRepository} from './task.repository';
import {UserRepository} from './user.repository';
import {ProjectUserRepository} from './project-user.repository';
export type ProjectCredentials = {
  title: string,
}
export class ProjectRepository extends DefaultCrudRepository<
  Project,
  typeof Project.prototype.id,
  ProjectRelations
> {

  public readonly tasks: HasManyRepositoryFactory<Task, typeof Project.prototype.id>;
  public readonly projectUsers: HasManyRepositoryFactory<ProjectUser, typeof Project.prototype.id>;

  constructor(
    @inject('datasources.database') dataSource: DatabaseDataSource, @repository.getter('TaskRepository') protected taskRepositoryGetter: Getter<TaskRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('ProjectUserRepository') protected projectUserRepositoryGetter: Getter<ProjectUserRepository>,
  ) {
    super(Project, dataSource);
    this.projectUsers = this.createHasManyRepositoryFactoryFor('projectUsers', projectUserRepositoryGetter,);
    this.registerInclusionResolver('projectUsers', this.projectUsers.inclusionResolver);
    this.tasks = this.createHasManyRepositoryFactoryFor('tasks', taskRepositoryGetter,);
    this.registerInclusionResolver('tasks', this.tasks.inclusionResolver);
  }
}
