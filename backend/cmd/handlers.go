package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TaskHandler struct {
	store *TaskStore
}

func NewTaskHandler(store *TaskStore) *TaskHandler {
	return &TaskHandler{store: store}
}

type payloadUpdate struct {
	Titulo    string `json:"titulo"`
	Descricao string `json:"descricao,omitempty"`
	Status    string `json:"status"`
}

func (h *TaskHandler) CreateTask(c *gin.Context) {
	var payload payloadUpdate
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Corpo da requisição (JSON) inválido"})
		return
	}

	if payload.Titulo == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O título é obrigatório"})
		return
	}

	newTask := h.store.CreateTask(payload.Titulo, payload.Descricao)
	c.JSON(http.StatusCreated, newTask)
}

func (h *TaskHandler) GetTasks(c *gin.Context) {
	taskList := h.store.GetTasks()
	c.JSON(http.StatusOK, taskList)
}

func (h *TaskHandler) UpdateTask(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido, precisa ser um número"})
		return
	}

	var payload payloadUpdate
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Corpo da requisição (JSON) inválido"})
		return
	}

	if payload.Titulo == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O título é obrigatório"})
		return
	}
	if payload.Status != "A Fazer" && payload.Status != "Em Progresso" && payload.Status != "Concluídas" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status inválido. Deve ser 'A Fazer', 'Em Progresso' ou 'Concluídas'"})
		return
	}

	updatedTask, found := h.store.UpdateTask(id, payload.Titulo, payload.Descricao, payload.Status)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tarefa não encontrada"})
		return
	}

	c.JSON(http.StatusOK, updatedTask)
}

func (h *TaskHandler) DeleteTask(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido, precisa ser um número"})
		return
	}

	if !h.store.DeleteTask(id) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tarefa não encontrada"})
		return
	}

	c.Status(http.StatusNoContent)
}
