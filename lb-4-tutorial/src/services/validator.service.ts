import { UserRepository, TodoRepository, ProjectRepository } from './../repositories'
import { HttpErrors } from '@loopback/rest';
import * as isEmail from 'isemail';
import { Credentials, TodoCredentials, ProjectCredentials } from '../repositories/index';
export async function validateCredentials(credentials: Credentials, userRepository: UserRepository) {
  if (!isEmail.validate(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity('invalid Email');
  }
  const foundUser = await userRepository.findOne({
    where: {
      email: credentials.email
    }
  });
  if (foundUser !== null) {
    throw new HttpErrors.UnprocessableEntity('this email already exists');
  }
  if (credentials.email.length < 8) {
    throw new HttpErrors.UnprocessableEntity('email length should be greater than 8')
  }
  if (credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity("passwordd length should be greater than 8")
  }
}

export async function validateTodoCredentials(credentials: TodoCredentials, todoRepository: TodoRepository) {
  const foundTodo = await todoRepository.findOne({
    where: {
      title: credentials.title
    }
  });
  if (foundTodo !== null) {
    throw new HttpErrors.UnprocessableEntity('Todo with this title already exists');
  }
}

export async function validateProjectCredentials(projectCredentials: ProjectCredentials, projectRepository: ProjectRepository) {
  const foundProject = await projectRepository.findOne({
    where: {
      title: projectCredentials.title
    }
  });
  if (foundProject !== null) {
    throw new HttpErrors.UnprocessableEntity('Project with this title already exists');
  }
}
