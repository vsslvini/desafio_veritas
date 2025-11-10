import { useState, useEffect } from 'react';
import './App.css';
import type { Task } from './types/task';
import api from './services/api';


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
        setTasks(response.data);
        setLoading(false);
      } catch (error) {
        setError("Falha ao carregar tarefas, verificar o backend.");
        console.error(error);
      } finally {
        setLoading(false);
      }
      fetchTasks();
    };
  }, []);


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
        {tasks.map(task => (
          <div key={task.id}>
            <p>{task.title} ({task.status})</p>
          </div>
        ))}
        {tasks.length === 0 && (
          <p>Nenhuma tarefa encontrada. Que tal adicionar uma?</p>
        )}
      </main>
    </div>
  );

}

export default App;