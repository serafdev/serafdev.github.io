---
slug: collections-python
title: Deploy an nginx server
date_published: 2019-03-11T18:53:00.000Z
excerpt: An easy guide for deploying an nginx server.
layout: layouts/post.njk
tags:
  - nginx 
  - webserver
---

### Deploy an nginx server

I'll show you in this guide how to deploy an nginx server with detailed explanation on what's happening. This guide is for unix environments, I will do it on an ubuntu machine but it should be almost the same on any machine if you understand what's going on.


#### Install nginx

First you will need to install nginx,

```bash
sudo apt install nginx
```

#### Verify installation

First multiple things might happened depending on your platform, to verify the installation we first need to check the nginx file and look how it is behaving on your machine, so go check your `nginx.conf` file:

```bash
cat /etc/nginx/nginx.conf
```

You should find under the http tag either a `server` tag or one ore multiple includes which will take care to include servers from other files. For example in my case I found these 2 lines but no `server` tag (might be different for you):

```bash
include /etc/nginx/conf.d/*.conf;
include /etc/nginx/sites-enabled/*;
```

If you found a `server` tag, then good you can check the port it's listening to with the listen parameter:

```bash
    listen 80 default_server;
```

If not, we can look inside the folders included (`/etc/nginx/conf.d/` and `/etc/nginx/sites-enabled/`). I found mine in `/etc/nginx/sites-enabled/default` (which is a simlink but I won't cover that in this tutorial because it used to confuse me at first and I want to keep this simple.)

So I look inside it

```bash
cat /etc/nginx/sites-enabled/default

...
    listen 80 default_server;
...
```
Now to verify if everything worked correctly you can run your nginx application which will load the default files for you:

```bash
/etc/init.d/nginx start

or

systemctl start nginx
```

Go to your browser and type `localhost:80`, (or the default port for you) you should find that "Welcome to nginx!" page. If you're on a server you can do `curl http://localhost:80`

Okay, now we know nginx is working, whatever breaks after should be in our configuration file and not in our installation.

#### Let's make our own simple configuration from scratch (for a static web site)

First, let's make a simple page that does nothing, create a file named `index.html` inside `/var/www/html/my_website/`, you can copy paste these 2 lines:

```bash
sudo mkdir /var/www/html/my_website
sudo touch /var/www/html/my_website/index.html
```

Add some content to the file you just created, you can use whatever editor you like to open it and put this content in it (You can write an actual html file but I'll just write one line):

To open the file run this command (replace emacs with whatever editor you like, e,g: nano, gedit, vim):
```bash
emacs /var/www/html/my_website/index.html
```

```html
What's up doge;
```

Second, make sure you got this line in your `/etc/nginx/nginx.conf`:
```bash
	include /etc/nginx/conf.d/*.conf;
```
It indicates to nginx to include every configuration file that finishes with `.conf` inside the folder `conf.d/`.

Now let's clean our default configurations in there by removing the default server we found earlier (either directly inside `nginx.conf` or a standalone file inside `conf.d/` or `sites-enabled/`), in the case of standalone files you can delete the file or move it to your home directory if you want to play with it later, otherwise you can comment out the whole `server { ... }` bloc (by adding a `#` in the beginning)

Let's restart nginx with `systemctl restart nginx` or `/etc/init.d/nginx restart`, clean cache and head to `localhost:80` (or the port you found earlier). It shouldn't show the nginx welcome page anymore.

Now let's create our new configuration file for the fully functional website we just created:

Create a new nginx configuration file inside `/etc/nginx/conf.d/`

```bash
sudo touch /etc/nginx/conf.d/my_website.conf
```

Let's add this content to it by opening the file (`sudo emacs /etc/nginx/conf.d/my_website.conf`) and copy pasting the next snippet:

```bash
server {
    listen 8081;
    server_name localhost;

    root /var/www/html/my_website;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Now if you head to your browser at the url `localhost:8081`, you can see `What's up` on the page.

Congratulation, you just deployed a website behind an nginx layer.

#### Nginx as a reverse proxy

For the ones that want to use nginx as a reverse proxy, the base configuration is simpler:

```bash
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://localhost:8080;
    }
}
```

This will pass all requests from the client on http to your server listening to port `8080`.

If you want to add `https` with a redirect from `http` to `https`, this applies if you can :

```bash
server {
    listen 443 ssl;
    server_name _;
    ssl_certificate /etc/nginx/conf.d/ssl/ssl.crt;
    ssl_certificate_key /etc/nginx/conf.d/ssl/ssl.key;

    location / {
        proxy_pass http://localhost:8080;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name _;
    return 301 https://$host$request_uri;
}
```

NOTE: Replacing `server_name _;` with `server_name your_domain.com;` (a.k.a `server_name faresbessrour.com;` in my case) is not a bad idea. You can host many servers on the same machine.

Okay, thanx for reading! Hope this helped you.

If you have any comments, some step was ambiguous or any suggestions to fix or make this post better, please open an [issue](https://github.com/serafss2/serafss2.github.io/issues), I will be glad to hear from you!

