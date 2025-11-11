import type { Task } from '../../types/task';
import styles from './TaskCard.module.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
    task: Task;
    onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            status: task.status,
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
        >
            <h3 className={styles.title}>{task.titulo}</h3>
            {task.descricao && (
                <p className={styles.description}>{task.descricao}</p>
            )}
        </div>
    );
}