import { useState, useEffect } from 'react';
import './App.css';
import type { Task } from './types/task';
import { TASK_STATUSES } from './types/task';
import api from './services/api';
import { KanbanColumn } from './components/KanbanColumn/KanbanColumn';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';


function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<Task[]>('/tasks');
        setTasks(response.data || []);
      } catch (error) {
        setError("Falha ao carregar tarefas, verificar o backend.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    setTasks((prevTasks) => {
      const activeIndex = prevTasks.findIndex(t => t.id === activeId);
      const overIndex = prevTasks.findIndex(t => t.id === overId);
      const newStatus = over.data.current?.status as Task['status'];

      let newTasks: Task[];

      if (active.data.current?.status === newStatus) {
        newTasks = arrayMove(prevTasks, activeIndex, overIndex);
      } else {
        const updatedTask = { ...activeTask, status: newStatus };
        newTasks = prevTasks.map(t => (t.id === activeId ? updatedTask : t));
      }

      return newTasks;
    });

    const newStatus = over.data.current?.status as Task['status'];

    if (activeTask.status !== newStatus) {
      api.put(`/tasks/${activeId}`, {
        ...activeTask,
        status: newStatus,
      }).catch(err => {
        console.error("Falha ao atualizar tarefa no backend", err);
        setError("Erro ao salvar a tarefa. Recarregando...");
        setTimeout(() => window.location.reload(), 1500);
      });
    }
  };

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
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
    </DndContext>
  );
}

export default App;