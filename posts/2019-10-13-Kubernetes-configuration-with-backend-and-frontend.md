---
title: Kubernetes configuration with a backend + frontend setup
date_published: 2019-10-13T03:50:00.000Z
summary: An example of how to deploy a web application using Kubernetes Services and Deployments.
categories: devops orchestration kubernetes
layout: layouts/post.njk
---

#### The app
First, the setup of my application is pretty small and simple: I have a backend that connects to a traditional database and a static frontend that sends requests to the backend endpoints. The database has it's own cloud-managed cluster and will not be part of the Kubernetes deployments, although, the machines are in the same private network since you should never expose a database publicly.


### The registry
For my design, I have for now a standalone machine that I called `ops` for operations and it contains my docker registry where I push my images. I also have my jenkins on the same machine.

Both run on docker, for registry you simply need to do:
```bash
docker pull registry
docker run -d -p 5000:5000 --restart always --name registry registry:2
```
This will pull the official registry image from the docker hub, then we will run it in daemon mode on port 5000.

You now have a registry running!

Now let's put the images on it. Let's do it manually for now.

First, I pulled my `backend` and `frontend` code to the `ops` machine, then simply doing:

```bash
cd ~/backend
docker build . -t backend
docker tag backend localhost:5000/backend
docker push localhost:5000/backend
```

Will build the docker image and push it to the registry. Now it should be accessible from our kubernetes deployments. Make sure that your `ops` machine is on the same network as your kubernetes cluster. You can do the same with the `frontend`, it is exactly the same commands

Personally, I am going to remove the `ops` machine and just run the docker registry as a service on the kubernetes cluster, with no external IP. That way I can save money on machines and make it simpler (no physical machines to take care of, just Kubernetes `YAML` files). To solve the problem of saving images, you can add the configuration to save your images to your cloud provider's storage (`Google Cloud Storage` in my case), or volumes will do just fine. Jenkins can also easily put on the Kubernetes cluster using a volume (With declarative pipelines you won't even need to back up your jenkins volume, it's stateless anyway! Important things to consider on your design).


### The Kubernetes Deployments
The apps were named `backend` and `frontend` for simplicity reasons. Now, for the backend deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ops:5000/backend
        ports:
        - containerPort: 8000
```

The metadata `name` is `backend`, pretty unimportant, I usually put the same number of replicas as the number of machines, I find it unuseful to put more since my backend apps are already designed for multithreading, now the important part is the selector, to be able to add a pointer to this deployment, your service needs to know how to find it, in kubernetes cluster we use selectors. so here if we match the label app=backend, it will redirect the service request to this deployment, you can have multiple deployments having the same matchLabel, reason you would do this is maybe A-B testing with different technologies but don't want to mix the Deployments (e.g an app written in Python and rewritten in C++ to test the performance, using the same service and 2 deployments would work just fine!). It's important for me to keep every part as lean as possible, mixing everything together is a pain in the ass to debug.

Now, for the specs of the `Deployment`, we have the image that we uploaded earlier to our registry (the machine name is `ops`, don't mix in IP addresses, you don't want to start managing that too) on `port 5000`, the image name is just `backend`, so `ops:5000/backend`. Done! You have your simple `Deployment`.

I will paste the frontend one, but it is exactly the same, minus the port:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: ops:5000/frontend
        ports:
        - containerPort: 80
```

To deploy these, you need to use `kubectl` and connect your `kubectl` to your cluster, so it knows where to execute the commands, I use cloud so usually if you go to your `Cluster` panel it will tell you what command to run to do this.

To create a `Deployment`, copy the backend deployment `YAML` configuration above to `backend-deployment.yaml` and simply run (ditto for `frontend`):
```bash
kubectl create -f backend-deployment.yaml
```

### The Kubernetes Services
Now that we have deployments, you can do nothing with them, you need to expose them to the external world, here's the backend `Service`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  type: LoadBalancer
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 8000
      targetPort: 8000
```

What I like from this, is it pretty easy to read and understand, first we have the `metadata`, the name of your `Service`, I like using the same `metadata` as the `Deployment` when it is a simple architecture like this (1:1). Second, there's the `specs`, for a Load Balancer, we simply put `type: LoadBalancer` (so your orchestrator assigns an external IP), then we have the selector, for us it is simply `app: backend` since if you remember correctly in the `Deployment` we put `matchLabels: {app: backend}`. For the ports, I put `TCP` because it's the default one and it's irrelvant to me for now but you could use anything you want. The port I'm exposing my `Service` on is `port: 8000`, and the target port on the `Deployment` is also `targetPort: 8000`. You could change this for e.g if your frontend deployment runs on `8080` you could do something like this:

```yaml
- protocol: TCP
  port: 80
  targetPort: 8080
```

You can also have multiple ports exposed on the same `Service`, e.g your `frontend` usually runs on 80 and 443.

I will also paste the `frontend Service` here but there's nothing special about it:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: LoadBalancer
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

To create a service, you just need to use the same command as the deploment:
```bash
kubectl create -f frontend-service.yaml
```

I think it's the same command to create any object in the Orchestrator.

### Ok, done

Hope you enjoyed this article and everything worked for you. If you find an issue in this article, a step missing, or just something unclear, please do not hesitate opening one on my [serafss2.github.io](https://github.com/serafss2/serafss2.github.io) repo!

You could also contribute with spelling or typo fixes! I'm writting this on `emacs`, I don't know if there's a spelling pluging, but probably.
