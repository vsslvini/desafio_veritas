import type { Task } from '../../types/task';
import { TaskCard } from '../TaskCard/TaskCard';
import styles from './KanbanColumn.module.css';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
}

export function KanbanColumn({ title, tasks }: KanbanColumnProps) {
  return (
    <div className={styles.column}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.taskList}>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className={styles.emptyMessage}>Nenhuma tarefa aqui.</p>
        )}
      </div>
    </div>
  );
}