import type { Task } from '../../types/task';
import { TaskCard } from '../TaskCard/TaskCard';
import styles from './KanbanColumn.module.css';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  title: Task['status'];
  tasks: Task[];
}

export function KanbanColumn({ title, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
    data: {
      status: title,
    }
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <section
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.columnOver : ''}`}
    >
      <h2 className={styles.title}>{title}</h2>
      <SortableContext
        items={taskIds}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.taskList}>
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <p className={styles.emptyText}>Nenhuma tarefa aqui.</p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}