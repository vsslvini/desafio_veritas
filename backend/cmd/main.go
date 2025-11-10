package main

import (
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

func main() {

	server := gin.Default()

	server.GET("/ping", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{
			"message": "pong",
		})
	})

	server.Run(":8000")

}
