---
title: Run an auto-reload Go web development server with Docker
slug: go-livereload
date_published: 2020-05-30T18:53:00.000Z
date_updated: 2020-05-31T18:49:06.000Z
excerpt: A small example on how you could run a Go auto-reload web server on file change.
layout: layouts/post.njk
tags:
  - go
  - docker
---

In this short tutorial, I will show you how to run a development server during Go web development. This made me skip the need to go to my terminal and re-run “go run main.go” 73 times an hour (Spoil-alert: I didn’t wait until that number, I’m very lazy).

I suggest following along, else if you are already comfortable with Docker/Docker-Compose and Go web development, you can jump directly to the TL;DR at the end of the article.

First let’s write a small app that we will run locally.

Create a folder named godev, create a file named main.go in there and put the following content in it:

```go
    package main
    
    import (
        "fmt"
        "net/http"
    )
    
    func main() {
        // Bind anonymous function to root route "/"
        http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
            // Returns string "Livemounted Version One" to the http writer.
            fmt.Fprintf(w, "Livemounted %s\n", "Version One")
        })
        fmt.Println("Serving Go app on port 8081")
        // Serves on port 8081
        http.ListenAndServe(":8081", nil)
    }
```
main.go
Simply put, we run an http server with one route “/” returning string “Livemounted Version One”.

Now create your go module, go in the folder and run in a terminal (replace the url with a unique link of your choice):

```bash
go mod init github.com/yourusername/godev
```

We can test this by running in the terminal:

```bash
go run main.go
```

Now visit the http server at localhost:8081, you will see “Livemounted Version One”

Let’s change the “One” to a “Two” on line 10. Let’s kill the go service and run again the go run main.go. We now serve “Livemounted Version Two”, as you can see, this workflow is not efficient, especially when you get up to speed with the language and have to modify and test multiple things per minute, just the process of going to the terminal and re-running your application can get heavy on your workflow and is not efficient.

A good way to automate something like this is inotify, it will watch all the files (using a regex, in our case .go$) and when it detects changes it will run a command, what we want exactly is: “When a .go file changes in my directory, execute go run main.go”

There is other tools like inotify and luckily it is easy to write your own script that does that. Since we are already in a Go environment, I picked github.com/cespare/reflex, it is written in Go (that way I won’t be bothered with downloadomg other Linux tools).

Put this content in a docker-entrypoint.sh file:

```bash
echo "Running docker-entrypoint.sh"
reflex -r '\.go$' -s -- sh -c 'echo "Running development server" && go mod tidy && go run main.go'

```

docker-entrypoint.sh
Basically we run the reflex command using regex .go$ and execute as a shell script go mod tidy and go run main.go, these will make sure that if you imported new libraries, it will update the go modules inside your container

And this in a file named Dockerfile:

```dockerfile
FROM golang:1.14.3-buster

WORKDIR /app

RUN go get github.com/cespare/reflex 

COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN sed -i 's/\r//' /docker-entrypoint.sh

VOLUME godev

ENTRYPOINT ["sh", "/docker-entrypoint.sh"]
```

Dockerfile
Here all we do is download reflex and copy the docker-entrypoint. The RUN sed line only makes sure that it removes that \r EOL character that I inserted when using Windows. I don’t need that line when I write my docker-entrypoint using Linux or Mac, but better safe than sorry.

The VOLUME directive tells the Docker-image that it’s expecting the user to mount a volume named godev and as an ENTRYPOINT, we just run the content of the docker-entrypoint above.

The reason we using a docker-entrypoint is because the reflex command shouldn’t run at build time, which the CMD directive does, an ENTRYPOINT directive only runs after all volumes are mounted, this makes it safe running go mod tidy and having an environment that is live-proof (aka no mounting overrides, etc)

Okay, now let’s run all of this, let’s create a docker-compose file to make it easier to build and run, create a docker-compose.yml file and put this content in it:

```yaml
    version: '3'
    
    volumes:
      godev:

    services:
      godev:
        build:
          context: .
        ports:
          - 8081:8081
        volumes:
          - ./:/app
          - godev:/go
```

docker-compose.yml
This config will mount your current directory into /app and will create a godev volume and mount it to /go ($GOPATH). This will serve as cache for your libraries during your development.

Let’s run that:
```bash
docker-compose up
```

Now you should see this as output:

```bash
godev_1 | Running docker-entrypoint.sh
godev_1 | [00] Starting service
godev_1 | [00] Running development server
godev_1 | [00] Serving Go app on port 8081
```

If you go to 8081, you should see “Livemount Version Two” (as we changed it at some step). Now let’s go to our code and bump the Version, in this case “Version Three”. Save your file and your output should look like this:

```bash
godev_1 | Running docker-entrypoint.sh
godev_1 | [00] Starting service
godev_1 | [00] Running development server
godev_1 | [00] Serving Go app on port 8081
godev_1 | [00] Killing service
godev_1 | [00] ^Csignal: interrupt
godev_1 | [00] Starting service
godev_1 | [00] Running development server
godev_1 | [00] Serving Go app on port 8081
```

NOICE, automatic rebuilds and at 8081 we can find our updated code.

Welp, that’s it! This also helps a lot when you have an environment using multiple databases and don’t want to be bothered with port mappings etc, you’re already in your docker network. All right, thanks for reading!

# TL;DR

```bash
git clone [https://github.com/serafdev/godev.git](https://github.com/serafdev/godev.git)

cd godev && docker-compose up
```

Visit localhost:8081, you will see “Livemount Version One” on the page

Now open main.go and bump the Version in the “/” route, you will see the docker-compose logs look like this:

```bash
godev_1 | Running docker-entrypoint.sh
godev_1 | [00] Starting service
godev_1 | [00] Running development server
godev_1 | [00] Serving Go app on port 8081
godev_1 | [00] Killing service
godev_1 | [00] ^Csignal: interrupt
godev_1 | [00] Starting service
godev_1 | [00] Running development server
godev_1 | [00] Serving Go app on port 8081


```
Now refresh your browser, you should see “Livemount Version Two”

Okay thanx for reading!
