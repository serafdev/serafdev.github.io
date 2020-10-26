---
title: Gunicorn WSGI Dockerfile (Python webserver)
date_published: 2019-10-05T03:50:00.000Z
summary: A docker image running a Django app behind a gunicorn WSGI. Could also work with any other python webapp.
categories: devops docker gunicorn
tag:
  - docker
  - python
layout: layouts/post.njk
---

### Write the Dockerfile
First, I really love using alpine linux for all my docker images, when testing my containers,
they most of the time only take a few megabytes of space. For the version, I have nothing special running linux related so always
keeping latest is allright (by not specifying any version for the alpine part). For Python, we're currently at 3.7.4, by putting 3.7
you ensure your docker image to always have those minor updates (latest of 3.7).

In my app, I needed some libraries that required compiling and cryptography libraries, so I added gcc,
libc-dev, libressl-dev and libffi-dev.

For the rest it's just the normal python commands to install packages using pip.


```dockerfile
FROM python:3.7-alpine

RUN apk add gcc libc-dev libffi-dev libressl-dev

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

COPY . /app

EXPOSE 8000

CMD gunicorn -b 0.0.0.0:8000 app.wsgi
```

### Build the docker image
To build the docker image you can simply run the build command in the right directory:
```bash
docker build . -t your-django-app
```

### Run the app
Since we exposed our gunicorn app on port 8000, we need to publish (-p) our container port to one of the host ports,
here I'll be chosing 8000 for simplicity, so in daemon mode (-d):
```bash
docker run -d -p 8000:8000 your-django-app
```
