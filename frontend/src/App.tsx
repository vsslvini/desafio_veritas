import { useState, useEffect } from 'react';
import './App.css';
import type { Task } from './types/task';
import { TASK_STATUSES } from './types/task';
import api from './services/api';
import { KanbanColumn } from './components/KanbanColumn/KanbanColumn';


function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    console.log("App montado!");
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<Task[]>('/tasks');
        setTasks(response.data || []);
        setLoading(false);
      } catch (error) {
        setError("Falha ao carregar tarefas, verificar o backend.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const todoTasks = tasks.filter(task => task.status === 'A Fazer');
  const inProgressTasks = tasks.filter(task => task.status === 'Em Progresso');
  const doneTasks = tasks.filter(task => task.status === 'Concluídas');

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Meu Kanban</h1>
        </header>
        <main>
          <p>Carregando tarefas...</p>
        </main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Meu Kanban</h1>
        </header>
        <main>
          <p className="error-message">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Meu Kanban</h1>
      </header>
      <main className="kanban-board">
        <KanbanColumn title={TASK_STATUSES[0]} tasks={todoTasks} />
        <KanbanColumn title={TASK_STATUSES[1]} tasks={inProgressTasks} />
        <KanbanColumn title={TASK_STATUSES[2]} tasks={doneTasks} />
      </main>
    </div>
  );

}

export default App;