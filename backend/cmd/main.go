package main

import (
	"net/http"
	"strconv"
	"sync"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Task struct {
	ID        int    `json:"id"`
	Titulo    string `json:"titulo"`
	Descricao string `json:"descricao,omitempty"`
	Status    string `json:"status"`
}

var (
	tasks     = make(map[int]Task)
	nextID    = 1
	tasksLock = sync.Mutex{}
)

func createTaskHandler(c *gin.Context) {
	var newTask Task
	if err := c.ShouldBindJSON(&newTask); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Corpo da requisição (JSON) inválido"})
		return
	}

	if newTask.Titulo == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O título é obrigatório"})
		return
	}

	newTask.Status = "A Fazer"
	tasksLock.Lock()

	newTask.ID = nextID
	tasks[newTask.ID] = newTask
	nextID++

	tasksLock.Unlock()
	c.JSON(http.StatusCreated, newTask)
}

func getTasksHandler(c *gin.Context) {
	tasksLock.Lock()
	defer tasksLock.Unlock()
	var taskList []Task

	for _, task := range tasks {
		taskList = append(taskList, task)
	}

	c.JSON(http.StatusOK, taskList)
}

func updateTaskHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido, precisa ser um número"})
		return
	}

	var updatedTask Task
	if err := c.ShouldBindJSON(&updatedTask); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Corpo da requisição (JSON) inválido"})
		return
	}

	if updatedTask.Titulo == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O título é obrigatório"})
		return
	}
	if updatedTask.Status != "A Fazer" && updatedTask.Status != "Em Progresso" && updatedTask.Status != "Concluídas" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status inválido. Deve ser 'A Fazer', 'Em Progresso' ou 'Concluídas'"})
		return
	}

	tasksLock.Lock()
	defer tasksLock.Unlock()

	_, exists := tasks[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tarefa não encontrada"})
		return
	}

	updatedTask.ID = id
	tasks[id] = updatedTask
	c.JSON(http.StatusOK, updatedTask)
}

func deleteTaskHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido, precisa ser um número"})
		return
	}

	tasksLock.Lock()
	defer tasksLock.Unlock()

	_, exists := tasks[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tarefa não encontrada"})
		return
	}

	delete(tasks, id)

	c.Status(http.StatusNoContent)
}

func main() {

	server := gin.Default()

	server.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	server.GET("/ping", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{
			"message": "pong",
		})
	})

	api := server.Group("/tasks")
	{
		api.POST("", createTaskHandler)
		api.GET("", getTasksHandler)
		api.PUT("/:id", updateTaskHandler)
		api.DELETE("/:id", deleteTaskHandler)
	}

	server.Run(":8000")

}
