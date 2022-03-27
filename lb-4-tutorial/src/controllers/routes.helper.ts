export const userRoutes : {
  signup: string,
  login: string,
  getMe: string,
  createProject: string,
  createTask: string,
  createUserTask: string,
} = {
  signup: "/signup",
  login: "/login",
  getMe: "/users/me",
  createProject: "/users/createProject",
  createTask: "/users/createTask/{id}",
  createUserTask: "/users/createUserTask/{id}"
}

export const projectRoutes : {
  createProjectUser: string,
  getProjectUser: string,
} = {
  createProjectUser: '/projects/{id}/project-users',
  getProjectUser: '/projects/{id}/project-users',
}

export const taskRoutes : {
  getTasksInProject: string,
} = {
  getTasksInProject: "/project-users/tasks/{id}"
}



