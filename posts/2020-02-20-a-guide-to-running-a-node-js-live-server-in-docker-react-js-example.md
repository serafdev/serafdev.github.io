---
title: A Guide to running a node.js live server in Docker (react.js example)
slug: a-guide-to-running-a-node-js-live-server-in-docker-react-js-example
date_published: 2020-02-21T03:50:00.000Z
date_updated: 2020-05-31T19:03:05.000Z
tags:
  - docker
  - reactjs
  - nodejs
excerpt: I'll show you here how to run a React app using Docker during development.
layout: layouts/post.njk
---

The real TL;DR, clone the repo, run the example, then jump to the Build and Run section:

> git clone https://github.com/serafdev/livemount-react-app react-app && cd react-app

**Setup the development environment**

Create a new React project if you don’t already have one:

> npx create-react-app react-app && cd react-app

Put a file on the root of the project named docker-entrypoint.sh with content:
```bash
#!/bin/sh

case $1 in
    dev)
        yarn
        echo "Running development server on 0.0.0.0:3000.."
        yarn start
        ;;
    test)
        echo "Running tests.."
        yarn test
        ;;
    sh)
        /bin/sh
        ;;
esac
```

Another file named Dockerfile with this content:

```bash
FROM node:lts-alpine
ENV HOST 0.0.0.0

WORKDIR /app

COPY package.json /app
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh", "dev"]
```

#### Build and run!

You’re ready to test! Run your docker command to build the image:

```bash
docker build . -t react-app:local
```
Now you can run it by mounting your code to the machine and exposing the node port to your host:

```bash
docker run -v $(pwd):/app -p 3000:3000 react-app:local
```

Visit the url on your browser: localhost:3000, you should be able to see the React default page

#### Test Reloading

Now let’s modify some code and reload the page, open src/App.js with your favourite editor and modify the content of the <p></p> dom to: Noice (or anything, really). Now if you reload you should have:
![](/content/images/2020/05/image-1.png)Just noice.
A more detailed article will be coming soon. If you have issues or find difficulties, do not hesitate leaving a comment.

Happy hot-reloading!
