package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("Iniciando o TaskStore...")
	store := NewTaskStore()

	handlers := NewTaskHandler(store)

	server := gin.Default()

	server.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:8080"},
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
		api.POST("", handlers.CreateTask)
		api.GET("", handlers.GetTasks)
		api.PUT("/:id", handlers.UpdateTask)
		api.DELETE("/:id", handlers.DeleteTask)
	}
	log.Println("Servidor rodando na porta :8000")
	server.Run(":8000")
}
