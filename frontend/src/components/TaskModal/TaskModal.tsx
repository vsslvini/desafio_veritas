import { useState, useEffect } from 'react';
import type { Task } from '../../types/task';
import styles from './TaskModal.module.css';

// [!code ++] Definindo os dados que o formulário envia
type TaskPayload = Omit<Task, 'id'>;

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskToEdit: Task | null;
    onSave: (taskData: TaskPayload, taskId?: number) => Promise<void>;
    onDelete: (taskId: number) => Promise<void>;
}

export function TaskModal({
    isOpen,
    onClose,
    taskToEdit,
    onSave,
    onDelete
}: TaskModalProps) {

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = taskToEdit !== null;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setTitulo(taskToEdit.titulo);
                setDescricao(taskToEdit.descricao || '');
            } else {
                setTitulo('');
                setDescricao('');
            }
            setError('');
            setIsSubmitting(false);
        }
    }, [isOpen, taskToEdit, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titulo.trim()) {
            setError('O título é obrigatório.');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            const status: Task['status'] = isEditMode ? taskToEdit.status : 'A Fazer';
            const taskData: TaskPayload = { titulo, descricao, status };
            await onSave(taskData, taskToEdit?.id);

            onClose();
        } catch (err) {
            console.error(err);
            setError('Falha ao salvar a tarefa. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditMode) return;

        if (!window.confirm(`Tem certeza que deseja excluir a tarefa: "${taskToEdit.titulo}"?`)) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await onDelete(taskToEdit.id);
            onClose();
        } catch (err) {
            console.error(err);
            setError('Falha ao excluir a tarefa.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2>{isEditMode ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </header>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <p className={styles.formError}>{error}</p>}

                    <div className={styles.formGroup}>
                        <label htmlFor="titulo">Título</label>
                        <input
                            type="text"
                            id="titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ex: Corrigir bug no login"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="descricao">Descrição (Opcional)</label>
                        <textarea
                            id="descricao"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Ex: O usuário não consegue acessar..."
                            rows={4}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.actions}>
                        {isEditMode && (
                            <button
                                type="button"
                                className={styles.buttonDanger}
                                onClick={handleDelete}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Excluindo...' : 'Excluir'}
                            </button>
                        )}
                        {/* [!code end] */}

                        <button
                            type="button"
                            className={styles.buttonSecondary}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.buttonPrimary}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Salvar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}