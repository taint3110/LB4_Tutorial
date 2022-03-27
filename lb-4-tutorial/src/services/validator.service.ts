import { UserRepository, TaskRepository, ProjectRepository, ProjectUserRepository } from './../repositories'
import { HttpErrors } from '@loopback/rest';
import * as isEmail from 'isemail';
import { Credentials, TaskData, ProjectData, ProjectUserData, TaskLinkData } from '../repositories/index';
import { isBuffer } from 'lodash';
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

export async function validateTaskData(taskData: TaskData, taskRepository: TaskRepository) {
  const foundTask = await taskRepository.findOne({
    where: {
      title: taskData.title
    }
  });
  if (foundTask !== null) {
    throw new HttpErrors.UnprocessableEntity('Task with this title already exists');
  }
}

export async function validateProjectData(projectData: ProjectData, projectRepository: ProjectRepository) {
  const foundProject = await projectRepository.findOne({
    where: {
      title: projectData.title
    }
  });
  if (foundProject !== null) {
    throw new HttpErrors.UnprocessableEntity('Project with this title already exists');
  }
}

export async function validateProjectUserData(projectUserData: ProjectUserData, projectUserRepository: ProjectUserRepository, projectRepository: ProjectRepository) {
  const foundProjectUser = await projectUserRepository.findOne({
    where: {
      userId: projectUserData.userId,
      projectId: projectUserData.projectId,
    }
  });
  const foundProject = await projectRepository.findOne({
    where: {
      id: projectUserData.projectId
    }
  })
  if (foundProjectUser !== null) {
    throw new HttpErrors.UnprocessableEntity('User is already on this project');
  }
  if (foundProject == null){
    throw new HttpErrors.UnprocessableEntity('Project not found to create projectUser');
  }
}

export async function validateTaskLinkData(taskLinkData: TaskLinkData, taskRepository: TaskRepository) {
  const foundTask = await taskRepository.findById(taskLinkData.taskId);
  const foundParentTask = await taskRepository.findById(taskLinkData.parentId)
  if (!foundTask || !foundParentTask) {
    throw new HttpErrors[404]('One of two task does not exist');
  }
  const isSameProject: boolean = String(foundTask?.projectId) === String(foundParentTask?.projectId)
  if (!isSameProject){
    throw new HttpErrors.Forbidden('Can only link two tasks in the same project');
  }
}
