import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {DatabaseDataSource} from '../datasources';
import {User, UserRelations, Task, ProjectUser} from '../models';
import {TaskRepository} from './task.repository';
import {ProjectUserRepository} from './project-user.repository';

export type Credentials = {
  email: string;
  password: string;
}
export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly tasks: HasManyRepositoryFactory<Task, typeof User.prototype.id>;

  public readonly projectUsers: HasManyRepositoryFactory<ProjectUser, typeof User.prototype.id>;

  constructor(
    @inject('datasources.database') dataSource: DatabaseDataSource, @repository.getter('TaskRepository') protected taskRepositoryGetter: Getter<TaskRepository>, @repository.getter('ProjectUserRepository') protected projectUserRepositoryGetter: Getter<ProjectUserRepository>,
  ) {
    super(User, dataSource);
    this.projectUsers = this.createHasManyRepositoryFactoryFor('projectUsers', projectUserRepositoryGetter,);
    this.registerInclusionResolver('projectUsers', this.projectUsers.inclusionResolver);
    this.tasks = this.createHasManyRepositoryFactoryFor('tasks', taskRepositoryGetter,);
    this.registerInclusionResolver('tasks', this.tasks.inclusionResolver);
  }
}
