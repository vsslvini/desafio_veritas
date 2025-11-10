import type { Task } from '../../types/task';
import styles from './TaskCard.module.css';

interface TaskCardProps {
    task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
    return (
        <div className={styles.card}>
            <h3 className={styles.title}>{task.titulo}</h3>
            {task.descricao && (
                <p className={styles.description}>{task.descricao}</p>
            )}
        </div>
    );
}