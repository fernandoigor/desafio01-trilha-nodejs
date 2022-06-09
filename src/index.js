const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if(!user){
      return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

function getTodosId(todos,id){
  const todo = todos.find((todo) => todo.id === id);
  return todo;
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const UserAlreadyExists = users.some(
      (user) => user.username === username
  );

  if(UserAlreadyExists){
      return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { todos } = request.user;
  const todo = { 
    id: uuidv4(), // precisa ser um uuid
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };
  todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { todos } = request.user;

  let todo = getTodosId(todos, id);
  if(!todo)
    return response.status(404).json({ error: "Todos not found" });

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;

  let todo = getTodosId(todos, id);
  if(!todo)
    return response.status(404).json({ error: "Todos not found" });

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;
  const todoIndex = todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todos Not Found' });
  }
  todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;