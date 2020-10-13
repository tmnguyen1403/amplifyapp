import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listTodos } from './graphql/queries';
import { createTodo as createTodoMutation, 
  deleteTodo as deleteTodoMutation } from './graphql/mutations';
import { API } from 'aws-amplify';

const initialFormState = { name: '', description: ''}

function App() {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const apiData = await API.graphql({ query: listTodos });
    setTodos(apiData.data.listTodos.items);
  }

  async function createTodo() {
    if (!formData.name || !formData.description) return;
    //create new todo
    await API.graphql({ query: createTodoMutation, 
      variables: { input: formData}});
    //add new todo in todoList
    setTodos([...todos, formData]);
    //reset form
    setFormData(initialFormState); 
  }

  async function deleteTodo({ id }) {
    //remove todo from current state
    const newTodosArray = todos.filter(todo => todo.id !== id);
    setTodos(newTodosArray); //update view
    //delete todo from database
    await API.graphql({ query: deleteTodoMutation, 
      variables: { input : { id }}});
  }

  return (
    <div className="App">
      <h1>My Todos App</h1>
      <input 
        onChange={e => setFormData({...formData, 'name': e.target.value})}
        placeholder="Todo name"
        value={formData.name}
        />
      <input
        onChange={e => setFormData({...formData, 'description': e.target.value})}
        placeholder="Todo description"
        value={formData.description}
      />
      <button onClick={createTodo}>Create Todo</button>
      <div style={{marginBottom: 30}}>
        {
          todos.map(todo => (
            <div key={todo.id || todo.name}>
              <h2>{todo.name}</h2>
              <p>{todo.description}</p>
              <button onClick={() => deleteTodo(todo)}>Delete todo</button>
            </div>
          ))
        }
      </div>
      <AmplifySignOut/>
    </div>
  );
}

export default withAuthenticator(App);
