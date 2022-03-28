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
  createProject: "/projects",
}

export const taskRoutes : {
  getTasksInProject: string,
  updateTask: string,
  createTaskLink: string,
  createTask: string,
  createUserTask: string,
} = {
  getTasksInProject: "/tasks/get-task/{id}",
  updateTask: "/tasks/{id}",
  createTaskLink: "/tasks/link",
  createTask: "/tasks/create-task/{id}",
  createUserTask: "/users/create-task/{id}"
}



