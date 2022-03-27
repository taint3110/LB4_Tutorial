export const userRoutes : {
  signup: string,
  login: string,
  getMe: string,
} = {
  signup: "/signup",
  login: "/login",
  getMe: "/users/me",
}

export const projectRoutes : {
  createProjectUser: string,
  getProjectUser: string,
  createProject: string
} = {
  createProjectUser: '/projects/{id}/project-users',
  getProjectUser: '/projects/{id}/project-users',
  createProject: "/users/createProject",
}

export const taskRoutes : {
  getTasksInProject: string,
  updateTask: string,
  createTaskLink: string,
  createTask: string,
  createUserTask: string,
} = {
  getTasksInProject: "/project-users/tasks/{id}",
  updateTask: "/tasks/{id}",
  createTaskLink: "/tasks/createTaskLink",
  createTask: "/users/createTask/{id}",
  createUserTask: "/users/createUserTask/{id}"
}



