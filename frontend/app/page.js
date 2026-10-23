"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");
  const [container, setContainer] = useState("");
  const [error, setError] = useState("");

  async function checkHealth() {
    try {
      const res = await fetch(`${API_URL}/api/health`);
      const data = await res.json();
      setApiStatus("up");
      setContainer(data.container);
    } catch {
      setApiStatus("down");
    }
  }

  async function loadTodos() {
    try {
      const res = await fetch(`${API_URL}/api/todos`);
      if (!res.ok) throw new Error();
      setTodos(await res.json());
      setError("");
    } catch {
      setError(`Can’t reach the API at ${API_URL}. Run “docker compose ps” to check the backend is up.`);
    }
  }

  useEffect(() => {
    checkHealth();
    loadTodos();
  }, []);

  async function addTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch(`${API_URL}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const todo = await res.json();
      setTodos([todo, ...todos]);
      setTitle("");
    }
  }

  async function toggleTodo(todo) {
    const res = await fetch(`${API_URL}/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
    }
  }

  async function deleteTodo(id) {
    const res = await fetch(`${API_URL}/api/todos/${id}`, { method: "DELETE" });
    if (res.ok) setTodos(todos.filter((t) => t.id !== id));
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="page">
      <header className="header">
        <h1>Pranabh Dock Tasks</h1>
        <p className="sub">
          {todos.length === 0
            ? "Nothing on the list yet."
            : `${remaining} of ${todos.length} still to do`}
        </p>
      </header>

      <section className="stack" aria-label="Running services">
        <div className="service up">
          <span className="dot" />
          <span className="name">Next.js</span>
          <span className="port">:3000</span>
        </div>
        <span className="link" aria-hidden="true" />
        <div className={`service ${apiStatus}`}>
          <span className="dot" />
          <span className="name">FastAPI</span>
          <span className="port">:8000</span>
        </div>
        <span className="link" aria-hidden="true" />
        <div className={`service ${apiStatus}`}>
          <span className="dot" />
          <span className="name">PostgreSQL</span>
          <span className="port">db:5432</span>
        </div>
      </section>
      {container && (
        <p className="container-id">API answered from container {container}</p>
      )}

      <form className="add" onSubmit={addTodo}>
        <label htmlFor="new-task" className="visually-hidden">New task</label>
        <input
          id="new-task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task, like “Write a Dockerfile”"
          maxLength={200}
        />
        <button type="submit" disabled={!title.trim()}>Add task</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      <ul className="list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.done ? "done" : ""}>
            <label className="item">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo)}
              />
              <span>{todo.title}</span>
            </label>
            <button
              className="delete"
              onClick={() => deleteTodo(todo.id)}
              aria-label={`Delete ${todo.title}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && !error && (
        <p className="empty">Add your first task above. It’s saved in PostgreSQL, so it survives a container restart.</p>
      )}
    </main>
  );
}
