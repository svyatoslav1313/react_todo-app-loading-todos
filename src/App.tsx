/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { addTodo, changeTodo, getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTodos()
      .then(todos => {
        setTodos(todos);
      })
      .catch(error => {
        setError(true);
        setErrorMessage('Unable to load todos');
        setTimeout(() => {
          setError(false);
        }, 3000);
        throw error;
      });
  }, []);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'ALL') {
      return todo;
    }

    if (filter === 'ACTIVE') {
      return !todo.completed;
    }

    if (filter === 'COMPLETED') {
      return todo.completed;
    }

    return;
  });

  const handleFilter = (type: 'ALL' | 'ACTIVE' | 'COMPLETED') => {
    setFilter(type);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const maxId = Math.max(...todos.map(todo => todo.id));

    const newTodo: Todo = {
      id: maxId + 1,
      userId: 3485,
      title: query,
      completed: false,
    };

    setLoading(maxId + 1);
    setTodos(currentTodos => [...currentTodos, newTodo]);
    addTodo(newTodo)
      .catch((error) => {
        setError(true);
        setErrorMessage('Unable to add a todo');
        setTimeout(() => {
          setError(false);
        }, 3000);
        setTodos(todos);
        throw error;
      })
      .finally(() => setLoading(0));

    setQuery('');
    inputRef.current?.blur();
  };

  const handleTodoComplete = (todo: Todo) => {
    const updatedTodo = { ...todo, completed: !todo.completed };

    changeTodo(updatedTodo)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.map(t => (t.id === todo.id ? updatedTodo : t)),
        );
      })
      .catch((error) => {
        setError(true);
        setErrorMessage('Unable to update a todo');
        setTodos(todos);
        throw error;
      });
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {/* This is a completed todo */}
          {filteredTodos.map(todo => (
            <div
              data-cy="Todo"
              className={classNames('todo', { 'completed': todo.completed })}
              key={todo.id}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todo.completed}
                  onChange={() => {handleTodoComplete(todo)}}
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                {todo.title}
              </span>

              {/* Remove button appears only on hover */}
              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
              >
                ×
              </button>

              {/* overlay will cover the todo while it is being deleted or updated */}
              <div
                data-cy="TodoLoader"
                className={classNames('modal overlay', {
                  'is-active': todo.id === loading,
                })}
              >
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}
        </section>

        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.filter(todo => !todo.completed).length} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  ' selected': filter === 'ALL',
                })}
                data-cy="FilterLinkAll"
                onClick={() => handleFilter('ALL')}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  ' selected': filter === 'ACTIVE',
                })}
                data-cy="FilterLinkActive"
                onClick={() => handleFilter('ACTIVE')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  ' selected': filter === 'COMPLETED',
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => handleFilter('COMPLETED')}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames('notification is-danger is-light has-text-weight-normal', {
          'hidden': !error,
        })}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setError(false)}
        />
        {/* show only one message at a time */}
        {errorMessage}
      </div>
    </div>
  );
};
