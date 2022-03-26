import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DatabaseDataSource} from '../datasources';
import {Todo, TodoRelations, User} from '../models';
import {UserRepository} from './user.repository';
export type TodoCredentials = {
  title: string,
}
export class TodoRepository extends DefaultCrudRepository<
  Todo,
  typeof Todo.prototype.id,
  TodoRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Todo.prototype.id>;

  public readonly parent: BelongsToAccessor<Todo, typeof Todo.prototype.id>;

  constructor(
    @inject('datasources.database') dataSource: DatabaseDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('TodoRepository') protected todoRepositoryGetter: Getter<TodoRepository>,
  ) {
    super(Todo, dataSource);
    this.parent = this.createBelongsToAccessorFor('parent', todoRepositoryGetter,);
    this.registerInclusionResolver('parent', this.parent.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
