import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Task {
  id: number;
  title: string;
  description: string;
  completed:  boolean;
  createdAt:  string;
}

interface HealthCheck {
  status: string;
  message: string;
  timestamp: string;
  environment: string;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHealth();
    fetchTasks();
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await axios.get<HealthCheck>(`${API_URL}/health`);
      setHealth(response.data);
    } catch (err) {
      console.error('Failed to fetch health status', err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Task[]>(`${API_URL}/tasks`);
      setTasks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await axios.post<Task>(`${API_URL}/tasks`, {
        title: newTaskTitle,
        description: newTaskDescription
      });
      setTasks([...tasks, response.data]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setError('');
    } catch (err) {
      setError('Failed to add task');
      console.error(err);
    }
  };

  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const response = await axios.put<Task>(`${API_URL}/tasks/${id}`, {
        completed: !task. completed
      });
      setTasks(tasks.map(t => t.id === id ? response.data : t));
      setError('');
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🚀 AWS EC2 Demo Application</h1>
        {health && (
          <div className="health-status">
            <span className="status-badge">{health.status}</span>
            <span className="environment">{health.environment}</span>
          </div>
        )}
      </header>

      <main className="container">
        <section className="add-task">
          <h2>Add New Task</h2>
          <form onSubmit={addTask}>
            <input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="input"
            />
            <textarea
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e. target.value)}
              className="textarea"
              rows={3}
            />
            <button type="submit" className="btn btn-primary">
              Add Task
            </button>
          </form>
        </section>

        {error && <div className="error">{error}</div>}

        <section className="tasks">
          <h2>Tasks</h2>
          {loading ? (
            <p>Loading... </p>
          ) : tasks.length === 0 ? (
            <p className="empty-state">No tasks yet. Add one above!</p>
          ) : (
            <div className="task-list">
              {tasks. map(task => (
                <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-footer">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                      />
                      <span>{task.completed ? 'Completed' : 'Mark as complete'}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;