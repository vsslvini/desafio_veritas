package main

import (
	"net/http"
	"sync"

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

func main() {

	server := gin.Default()

	server.GET("/ping", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{
			"message": "pong",
		})
	})

	api := server.Group("/tasks")
	{
		api.POST("", createTaskHandler)
	}

	server.Run(":8000")

}
