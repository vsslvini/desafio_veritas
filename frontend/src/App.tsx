import { useState, useEffect, useCallback } from "react";
import "./App.css";
import type { Task } from "./types/task";
import { TASK_STATUSES } from "./types/task";
import api from "./services/api";
import { KanbanColumn } from "./components/KanbanColumn/KanbanColumn";
import { TaskCard } from "./components/TaskCard/TaskCard";
import {
  DndContext,
  useSensors,
  DragOverlay,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { TaskModal } from "./components/TaskModal/TaskModal";

const columns = TASK_STATUSES;
type TaskPayload = Omit<Task, 'id'>;

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Sensores DND
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<Task[]>("/tasks");
      setTasks(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar tarefas", err);
      setError("Falha ao carregar as tarefas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSaveTask = async (taskData: TaskPayload, taskId?: number) => {
    try {
      if (taskId) {
        const response = await api.put<Task>(`/tasks/${taskId}`, taskData);
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === taskId ? response.data : t))
        );
      } else {
        const response = await api.post<Task>("/tasks", taskData);
        setTasks((prevTasks) => [...prevTasks, response.data]);
      }

      setIsModalOpen(false);
      setTaskToEdit(null);

    } catch (err) {
      console.error("Falha ao salvar tarefa", err);
      throw new Error("Falha na API ao salvar tarefa.");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}`);

      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));

      setIsModalOpen(false);
      setTaskToEdit(null);

    } catch (err) {
      console.error("Falha ao deletar tarefa", err);
      throw new Error("Falha na API ao deletar tarefa.");
    }
  };

  const openAddTaskModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };


  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as number;
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as number;
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;
    const overId = over.id;

    let newStatus: Task["status"] | undefined = undefined;

    if (typeof overId === "string") {
      if (columns.includes(overId as any)) {
        newStatus = overId as Task["status"];
      }
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (!newStatus || newStatus === activeTask.status) {
      if (typeof overId === "number") {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          tasks[activeIndex].status === tasks[overIndex].status
        ) {
          setTasks((prevTasks) => {
            return arrayMove(prevTasks, activeIndex, overIndex);
          });
        }
      }
      return;
    }

    const oldStatus = activeTask.status;
    setTasks((prevTasks) => {
      return prevTasks.map((task) =>
        task.id === activeId ? { ...task, status: newStatus! } : task
      );
    });

    try {
      const payload: TaskPayload = {
        titulo: activeTask.titulo,
        descricao: activeTask.descricao,
        status: newStatus!,
      };

      await handleSaveTask(payload, activeId);

    } catch (err) {
      console.error("Falha ao atualizar tarefa no backend", err);
      setError("Erro ao salvar a tarefa. Revertendo...");
      setTasks((prevTasks) => {
        return prevTasks.map((task) =>
          task.id === activeId
            ? { ...task, status: oldStatus }
            : task
        );
      });
      setTimeout(() => setError(null), 3000);
    }
  };


  const todoTasks = tasks.filter(
    (task) => task.status === TASK_STATUSES[0]
  );
  const inProgressTasks = tasks.filter(
    (task) => task.status === TASK_STATUSES[1]
  );
  const doneTasks = tasks.filter(
    (task) => task.status === TASK_STATUSES[2]
  );

  if (loading) {
    return (
      <div className="loading-state">
        <p>Carregando tarefas...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={fetchTasks}>Tentar Novamente</button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app">
        <header className="app-header">
          <h1>Meu Kanban</h1>
          <button
            className="add-task-button"
            onClick={openAddTaskModal}
          >
            + Adicionar Tarefa
          </button>
        </header>
        <main className="kanban-board">
          <KanbanColumn
            title={TASK_STATUSES[0]}
            tasks={todoTasks}
            onTaskClick={openEditTaskModal}
          />
          <KanbanColumn
            title={TASK_STATUSES[1]}
            tasks={inProgressTasks}
            onTaskClick={openEditTaskModal}
          />
          <KanbanColumn
            title={TASK_STATUSES[2]}
            tasks={doneTasks}
            onTaskClick={openEditTaskModal}
          />
        </main>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} onClick={() => { }} /> : null}
      </DragOverlay>
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        taskToEdit={taskToEdit}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </DndContext>
  );
}

export default App;