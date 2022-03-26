export const userRoutes : {
  signup: string,
  login: string,
  getMe: string,
  readTodo: string,
  readAdminTodo: string,
  readUserTodo: string,
  createProject: string,
  createTodo: string,
  createUserTodo: string,
} = {
  signup: "/signup",
  login: "/login",
  getMe: "/users/me",
  readTodo: "/users/readTodo{id}",
  readAdminTodo: "/users/readAdminTodo{id}",
  readUserTodo: "/users/readUserTodo{id}",
  createProject: "/users/createProject",
  createTodo: "/users/createTodo{id}",
  createUserTodo: "/users/createUserTodo{id}"
}


