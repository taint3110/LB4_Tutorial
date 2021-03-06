export const authRoutes : {
  signup: string,
  login: string,
  getMe: string,
} = {
  signup: "/auth/signup",
  login: "/auth/login",
  getMe: "/auth/me",
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
  getTask: string,
  updateTask: string,
  createTaskLink: string,
  createTask: string,
  createUserTask: string,
} = {
  getTasksInProject: "/tasks/projects/{projectId}/users/{userId}",
  getTask: "/tasks/{id}",
  updateTask: "/tasks/{id}",
  createTaskLink: "/tasks/link",
  createTask: "/tasks",
  createUserTask: "/tasks/users/{id}/tasks"
}



