import { UserRepository, TaskRepository, ProjectRepository, ProjectUserRepository } from './../repositories'
import { HttpErrors } from '@loopback/rest';
import * as isEmail from 'isemail';
import { Credentials, TaskCredentials, ProjectCredentials, ProjectUserCredentials } from '../repositories/index';
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

export async function validateTaskCredentials(credentials: TaskCredentials, taskRepository: TaskRepository) {
  const foundTask = await taskRepository.findOne({
    where: {
      title: credentials.title
    }
  });
  if (foundTask !== null) {
    throw new HttpErrors.UnprocessableEntity('Task with this title already exists');
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

export async function validateProjectUserCredentials(projectUserCredentials: ProjectUserCredentials, projectUserRepository: ProjectUserRepository) {
  const foundProjectUser = await projectUserRepository.findOne({
    where: {
      userId: projectUserCredentials.userId,
      projectId: projectUserCredentials.projectId,
    }
  });
  if (foundProjectUser !== null) {
    throw new HttpErrors.UnprocessableEntity('User is already on this project');
  }
}
