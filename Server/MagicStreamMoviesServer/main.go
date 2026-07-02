package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/blackdragoon26/MagicStreamMovies/Server/MagicStreamMoviesServer/database"
	"github.com/gin-contrib/cors"
	"github.com/joho/godotenv"

	"github.com/blackdragoon26/MagicStreamMovies/Server/MagicStreamMoviesServer/routes"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
	// "github.com/blackdragoon26/MagicStreamMovies/Server/MagicStreamMoviesServer/controllers"
)


func main(){

	router:=gin.Default()

	router.GET("/hello", 
	func(c *gin.Context){
		c.String(200, "hello magic ok  ")
	})
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: unable to find .env file")
	}

	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")

	var origins []string
	if allowedOrigins != "" {
		origins = strings.Split(allowedOrigins, ",")
		for i := range origins {
			origins[i] = strings.TrimSpace(origins[i])
			log.Println("Allowed Origin:", origins[i])
		}
	} else {
		origins = []string{"http://localhost:5173"}
		log.Println("Allowed Origin: http://localhost:5173")
	}

	config := cors.Config{}
	config.AllowOrigins = origins
	config.AllowMethods = []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"}
	//config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	router.Use(cors.New(config))
	router.Use(gin.Logger())


	
	var client *mongo.Client =database.Connect()

	if err:=client.Ping(context.Background(),nil);err!=nil{
		log.Fatalf("Failed to reach server:%v ",err)
	}
	defer func() {
		err:=client.Disconnect(context.Background())
		if err!=nil{
			log.Fatalf("Failed to disconnect :%v ",err)

		}
	}()

	routes.SetupUnProtectedRoutes(router, client)
	routes.SetupProtectedRoutes(router,client)




	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err:=router.Run(":" + port);err!=nil{ //run starts a goroutine for a each request and runs server
		fmt.Println("failed: ",err)
	}



}