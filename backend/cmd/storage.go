// backend/cmd/storage.go
package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"sync"
)

const tasksFile = "tasks.json"

// [!code ++]
// 1. ADICIONADO A DEFINIÇÃO DA STRUCT 'Task'
// O arquivo agora sabe o que é uma "Task"
type Task struct {
	ID        int    `json:"id"`
	Titulo    string `json:"titulo"`
	Descricao string `json:"descricao,omitempty"`
	Status    string `json:"status"`
}

type TaskStore struct {
	mu sync.Mutex
	// [!code --] tasks  map[int]TaskStore
	tasks  map[int]Task // [!code ++] 2. CORRIGIDO: O mapa deve conter 'Task'
	nextID int
}

func NewTaskStore() *TaskStore {
	store := &TaskStore{
		tasks:  make(map[int]Task), // Isso já estava certo
		nextID: 1,
	}

	store.load()
	return store
}

func (ts *TaskStore) load() {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	data, err := ioutil.ReadFile(tasksFile)
	if err != nil {
		if os.IsNotExist(err) {
			log.Printf("Arquivo %s não encontrado. Iniciando com mapa de tarefas vazio.", tasksFile)
			return
		}
		log.Fatalf("Erro ao ler arquivo %s: %v", tasksFile, err)
	}

	if err := json.Unmarshal(data, &ts.tasks); err != nil {
		log.Fatalf("Erro ao fazer unmarshal do %s: %v", tasksFile, err)
	}

	maxID := 0
	for id := range ts.tasks {
		if id > maxID {
			maxID = id
		}
	}
	ts.nextID = maxID + 1

	log.Printf("Carregadas %d tarefas do disco. Próximo ID é %d.", len(ts.tasks), ts.nextID)
}

func (ts *TaskStore) save() {
	data, err := json.MarshalIndent(ts.tasks, "", "  ") // Corrigido o espaçamento
	if err != nil {
		log.Printf("ERRO: Falha ao fazer marshal das tasks: %v\n", err)
		return
	}

	if err := ioutil.WriteFile(tasksFile, data, 0644); err != nil {
		log.Printf("ERRO: Falha ao salvar tasks no disco (%s): %v\n", tasksFile, err)
	}
}

func (ts *TaskStore) GetTasks() []Task {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	taskList := make([]Task, 0, len(ts.tasks))
	for _, task := range ts.tasks {
		taskList = append(taskList, task)
	}
	return taskList
}

func (ts *TaskStore) CreateTask(titulo string, descricao string) Task {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	newTask := Task{
		ID:        ts.nextID,
		Titulo:    titulo,
		Descricao: descricao,
		Status:    "A Fazer",
	}

	ts.tasks[newTask.ID] = newTask
	ts.nextID++

	ts.save()
	return newTask
}
func (ts *TaskStore) GetTaskByID(id int) (Task, bool) {
	ts.mu.Lock()
	defer ts.mu.Unlock()
	task, exists := ts.tasks[id]
	return task, exists
}

func (ts *TaskStore) UpdateTask(id int, titulo string, descricao string, status string) (Task, bool) {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	_, exists := ts.tasks[id]
	if !exists {
		return Task{}, false
	}

	// [!code --] updatedTask := TasksT{
	updatedTask := Task{ // [!code ++] 3. CORRIGIDO: Erro de digitação 'TasksT'
		ID:        id,
		Titulo:    titulo,
		Descricao: descricao,
		Status:    status,
	}

	ts.tasks[id] = updatedTask
	ts.save()
	return updatedTask, true
}

func (ts *TaskStore) DeleteTask(id int) bool {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	_, exists := ts.tasks[id]
	if !exists {
		return false
	}

	delete(ts.tasks, id)
	ts.save()
	return true
}
