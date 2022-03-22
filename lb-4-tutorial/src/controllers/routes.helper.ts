export const userRoutes : {
  signup: string,
  login: string,
  getMe: string,
  readUserTodo: string,
} = {
  signup: "/signup",
  login: "/login",
  getMe: "/users/me",
  readUserTodo: "/users/readTodo{id}"
}

export const adminRoutes : {
  readAdminTodo: string,
  readUserTodo: string,
  createTodoList: string,
  createProject: string,
  createTodo: string,
} = {
  readAdminTodo: "/admins/readAdminTodo{id}",
  readUserTodo: "/admins/readUserTodo{id}",
  createTodoList: "/admins/createTodoList",
  createProject: "/admins/createProject",
  createTodo: "/admins/createTodo",
}

