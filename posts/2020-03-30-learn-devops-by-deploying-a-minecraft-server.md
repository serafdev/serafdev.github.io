---
title: Learn DevOps by deploying a Minecraft Server
slug: learn-devops-by-deploying-a-minecraft-server
date_published: 2020-03-31T03:19:00.000Z
date_updated: 2020-05-31T03:23:05.000Z
tags:
  - devops
  - dns
  - ci/cd
  - linux
  - minecraft
excerpt: A (long) guide to deploying a Minecraft server, I'll show you how to to configure Dynamic DNS and some more cool stuff.
layout: layouts/post.njk
---

Learn about high availability services, CI/CD, Linux Services, Dynamic DNS and some more DevOps and sysadmin tasks, just by deploying your Minecraft server and automating the configuration files deployment.

This is a beginner friendly tutorial aimed for everyone with hopes to enlighten everyone on the job of a DevOps engineer by going through your first (or not) automated deployment. For more advanced readers, you can skim through most paragraphs because they will go into details on explaining every corner.

# Prerequisites

- A machine running Ubuntu
- A GitHub account
- Access to your router’s ports management (for the ports forwarding)

Install Ubuntu on any of your machines.

At the time of this writing my setup looks like this: A small server right by my router in the corner of my dining room, running Ubuntu Server 18.04. You can use a spare Laptop or a Raspberry Pie, really, anything will do. For this tutorial, if you are already on Linux, you can just use your current installation.

For the GitHub account, you can just visit the official website to create an account.

You will also need to do some port forwarding so people can access your Minecraft server from outside your home network, also for having GitHub actions accessing your server for the automated deployments.

Details on all of these will come through the article.

# Set up

On your Linux machine, create a folder named /opt/minecraft and change it’s ownership to your main user. What this means is that the folder will be modifiable by you without the need to use super user privileges (sudo), to do so you can do:

> sudo mkdir /opt/minecraft

> sudo chown $USER /opt/minecraft

This is where we will put our Minecraft server. Go ahead and download the server archive using “wget”, you can find the link at the page bellow by clicking on the green download button under Ubuntu Server Software for Ubuntu and hitting “Copy Link”, you can do that on another machine if you’re using Ubuntu Server, and just write it down there: [https://www.minecraft.net/en-us/download/server/bedrock/](https://www.minecraft.net/en-us/download/server/bedrock/)

At the time of writing, the command looks like this, make sure to use the latest version:

> wget [https://minecraft.azureedge.net/bin-linux/bedrock-server-1.14.32.1.zip](https://minecraft.azureedge.net/bin-linux/bedrock-server-1.14.32.1.zip) -P /tmp/

-P /tmp/ is used to basically tell wget to put the file in the /tmp/ directory (P for prefix).

Install unzip if you don’t already have it,

> sudo apt install unzip

Now we can unzip the content of that file inside the folder we created earlier

> unzip /tmp/bedrock-server-1.14.32.1.zip -d /opt/minecraft

Test your installation using:

> cd /opt/minecraft && chmod +x ./bedrock_server && LD_LIBRARY_PATH=. ./bedrock_server

Basically, we go into the folder, we change the mod of the bedrock_server file to executable and run the server with environment variable LD_LIBRARY_PATH set to current location. Pretty simple when someone puts some words to those cryptic commands right?

If the app runs smoothly, you should see a logstack like this one:

> NO LOG FILE! — setting up server logging…
> [2020–03–29 23:14:30 INFO] Starting Server
> [2020–03–29 23:14:30 INFO] Version 1.14.32.1
> [2020–03–29 23:14:30 INFO] Session ID f6b04942–72ed-414d-88d3–024ad4c8683c
> [2020–03–29 23:14:30 INFO] Level Name: Bedrock level
> [2020–03–29 23:14:30 INFO] Game mode: 0 Survival
> [2020–03–29 23:14:30 INFO] Difficulty: 1 EASY
> [2020–03–29 23:14:30 INFO] opening worlds/Bedrock level/db
> [2020–03–29 23:14:32 INFO] IPv4 supported, port: 19132
> [2020–03–29 23:14:32 INFO] IPv6 supported, port: 19133
> [2020–03–29 23:14:32 INFO] IPv4 supported, port: 57890
> [2020–03–29 23:14:32 INFO] IPv6 supported, port: 40946
> [2020–03–29 23:14:33 INFO] Server started.

Hurray! We’re ready for the fun part.

# The Minecraft Service (Linux Daemon)

A quick explanation of what a daemon is, it is just an application that runs in the background. Basically it logs nothing to your standard output (eh, generally, because you can hack a daemon that spams and takes control of your standard output if you want, but that’s beside the point). We want this because we don’t want to have to go manually open a terminal or a background terminal and run our Minecraft server. We are too lazy for that, we will automate everything.

Here’s how our Minecraft Service looks like, I will explain every part afterwards.

    [Unit]
    Description=Minecraft Server
    After=network.target
    
    [Service]
    User=minecraft
    Group=minecraft
    
    Type=Simple
    
    WorkingDirectory=/opt/minecraft
    ExecStart=/bin/sh -c "LD_LIBRARY_PATH=. ./bedrock_server"
    TimeoutStopSec=20
    Restart=on-failure
    
    [Install]
    WantedBy=multi-user.target

First we have the Description, After means, we want this service to run after the network is ready.

In Service, we have our User and Group, replace these by yours. To find out in what group you’re in you can just run the command “group” on the shell, you will see a list of those, just pick the one named after your user. To keep it simple, Type=Simple (nice dad pun) means that the process running on ExecStart is the main process of this service. The WorkingDirectory is the working directory which is the location of our server /opt/minecraft.

ExecStart is the command we tested before, sh -c means run this command as interpreted by sh. /bin/sh is the absolute path of shell. Timeout, is just the timeout of no response when it has to stop gracefully, and Restart=on-failure, means if there’s a crash it will try to restart again, if you stop it manually it will not restart except on reboot if you enable the service.

Let’s test this! I have setup a repository for this, so go ahead and clone it.

> git clone [https://github.com/serafdev/mineconf.git](https://github.com/serafss2/mineconf.git) ~/mineconf

Modify the minecraft.service file to put your User and Group, we will use nano for this but you can also use emacs or vi if you are comfortable with any other editor.

> nano ~/mineconf/minecraft.service

“CTRL+x, Y, ENTER” to save your changes.

Now let’s make a symbolic link to that file and put it in the services folder so it can be recognized by systemctl (services tool)

> ln -s $HOME/mineconf/minecraft.service /etc/systemd/system/minecraft.service

Now your service should be ready to be started and enabled. Enabling a service makes it run when system boots.

> sudo systemctl start minecraft

> sudo systemctl enable minecraft

You can check if the server started successfully with

> sudo systemctl status minecraft

Now that’s working, we need to add a user to the whitelist so you can have him access the server! Go ahead and add yourself, open ~/mineconf/whitelist.json and add yourself in it. For Minecraft Bedrock server the content should look like this:

    [
      {
        "ignoresPlayerLimit": false,
        "name": "AUser",
        "uuid": "erf895cc-9x7v-7da5-fasd–asgaasqwe2214"
      }
    ]

To findout what your uuid is you can paste your username into any Minecraft user lookup, it’ll give all the info. Here’s one: [https://mcuuid.net/](https://mcuuid.net/)

Now link that file to your minecraft server installation and restart the server:

> rm /opt/minecraft/whitelist.json

> ln -s $HOME/mineconf/whitelist.json /opt/minecraft/whitelist.json

> sudo systemctl restart minecraft

Yeahh, now you’ve got your own minecraft server running in your home. Let’s test it! Go to another device in your home network, make sure you’re connected to the same network because we did not setup port forwarding and Dynamic DNS yet (more into these next), and log in to Minecraft, on the Server tab you should be able to see your Server online! Grreeat :) I personally play on both Windows and iPhone, my brother plays on Android and Windows and my other brother plays on the Nintendo Switch, and we can all join the same server! Pretty cool in my opinion!

Okay, now let’s make it accessible from the outside world

# Port Forwarding

Log in to your router, usually 192.168.0.1 or 192.168.0.2, look in the advance settings and Port Forwarding, sadly every router has it’s own specific settings so you might be better looking on duckduck.go “Port Forwarding <Router Model>” or just looking around yourself, add Port 19132 TCP/UDP forwarded to 19132 Your-Minecraft-Machine, do the same for Port 22 TCP forwarded to 22 Your-Minecraft-Machine.

To just briefly explain what this is about, it is about accessing your server from the outside world. When someone writes your IP Address on minecraft, it will redirect the traffic to your router, but your router doesn’t know what to do with that address, because the address is your whole network’s IP Address. So basically with Port Forwarding, you tell your router “If someone contacts us at port 22 or 19132, redirect the traffic to the minecraft machine”, it should be fairly simple to setup.

After you done that, let’s test it out! (I really like tests). Connect your PC or Mobile phone that runs minecraft to your LTE or hotspot connection (make sure to set the limit on Windows to 100MB or something low like that to not consume your whole data in case you forget downloads in the background). Go ahead and look at your external IP, on your minecraft machine, just run this command: `curl ifconfig.me` Click Add Server in minecraft and write that address down, put 19132 for the port.

Yeahhh, you can already tell your friends to log into your server! You can take a small break and go build a house, playing minecraft is part of the tutorial.

# DynamicDNS

Okay, now that you built your first house and waiting until the zombies go away because you have no bed yet. Let’s deal with the Dynamic IP issue. Common ISPs distribute ephemeral IP addresses to non-businesses, what this means is that if your router goes down and back up, you will be assigned a new IP Address and will have to go through getting the new IP and distributing it to your friends again, this is very annoying, this is what I used to do in college because I did not know much about basic networking.

DynamicDNS is a feature domain providers provide for this exact problem, first let’s explain what DNS is. Basically the Domain Name System (DNS) is just like your contacts app, you got the name and some more information about your contact like his phone number, in this case it is just the IP Address that is assigned by your ISP (Internet Service Provider), so basically, instead of writing IP Addresses when we access websites, we instead write names and DNS servers will go get the IP address and bring us back the content we requested. Now, DynamicDNS is the same thing, but one of your computers in your home tells your Domain provider “Hey dude, I got a new IP Address, can you record this to the (decentralized) contact list?” This way, you won’t care if the IP Address changes.

Personally, I have my own domains, they can go as low as 11 dollars (or even less), I use them for my emails and business, but for this tutorial we will go ahead and use noip. Go ahead and make a free account at [https://www.noip.com/](https://www.noip.com/client/linux/noip-duc-linux.tar.gz). Finish all the initial setup and go on the DynamicDNS tab, pick your hostname and click next, fill in the information they ask you, put Minecraft Server or just skip the second step, pick yes for Device always connected on the network, click on download the DUC, it will show the steps on how to install the app that will update the DNS automatically.

I will add the commands here, but you basically can just follow their tutorial for this. At this time, we’re at version 2.1.9, but for the 4th step, you can write no-ip- and hit tab to autocomplete.

> [wget https://www.noip.com/client/linux/noip-duc-linux.tar.gz](https://www.noip.com/client/linux/noip-duc-linux.tar.gz) -P /usr/local/src

> cd /usr/local/src

> tar xzf noip-duc-linux.tar.gz

> cd no-ip-2.1.9

> make

> make install

Now you can create the configuration file using

> /usr/local/bin/noip2 -C

Enter your username, password and hostname.

Now launch the app:

> /usr/local/bin/noip2

Make it launch at startup, create a service like the one we did earlier and put it in /etc/systemd/system/noip2.service

I found one that works, a gist from Nathan Giesbrecht, so copy the bellow content and put it inside that file and then start and enable:

> nano /etc/systemd/system/noip2.service

    # Simple No-ip.com Dynamic DNS Updater
    #
    # By Nathan Giesbrecht (http://nathangiesbrecht.com)
    #
    # 1) Install binary as described in no-ip.com's source file (assuming results in /usr/local/bin)
    # 2) Run sudo /usr/local/bin/noip2 -C to generate configuration file
    # 3) Copy this file noip2.service to /etc/systemd/system/
    # 4) Execute `sudo systemctl daemon-reload`
    # 5) Execute `sudo systemctl enable noip2`
    # 6) Execute `sudo systemctl start noip2`
    #
    # systemd supports lots of fancy features, look here (and linked docs) for a full list:
    #   http://www.freedesktop.org/software/systemd/man/systemd.exec.html
    
    [Unit]
    Description=No-ip.com dynamic IP address updater
    After=network.target
    After=syslog.target
    
    [Install]
    WantedBy=multi-user.target
    Alias=noip.service
    
    [Service]
    # Start main service
    ExecStart=/usr/local/bin/noip2
    Restart=always
    Type=forking

> sudo systemctl start noip2

> sudo systemctl enable noip2

All right, let’s go back to the noip dashboard. Click on DynamicDNS -> No-IP Hostnames. You should see an update to the “Last Update” column and your External IP/Target beside it, greeaat! This look pretty cool. At this time, you already know what will happen. Test time! Go ahead and do the Hotspot thing we earlier did.

Cool, now we have a fully functional Minecraft service. We learned about DynamicDNS, IP Forwarding, Linux Daemons and systemctl and a few Linux commands, this looks neat! Good job so far. You can already get comfortable now in your world.

You can already start thinking on high availability. Now that you know when your computer restarts, your No-IP and Minecraft Server daemons will kick right in, you can go and tweak your motherboard settings. For example I set 2 things that help me in case of outage or server down, I set the “Boot when electricity comes back” and “WLAN (Wake On Lan)”, this is very nice for when you’re on vacation and your home loses electricity, your computer will boot right back when electricity comes back. the WLAN part is when I shutdown intentionally my PC knowing that no one will login (e.g everyone’s on vacation or something) and then I happen to need to turn my server back on, I just need to contact it and my motherboard will just turn on, notified by my network card that stays on. I don’t really use this feature because I really let my PC online 24/7, but it is still something cool to consider in some situations.

# Continuous Deployment — GitHub Actions

Now, let’s use the tools we put in place so far into action (such unfunny puns).

First, let’s make the command “sudo systemctl restart minecraft” not prompt us for a password, run:

> sudo visudo

Add at the end of the file:

> yourusername ALL=(ALL) NOPASSWD: systemctl restart minecraft

As you remember we cloned mineconf to the home directory of the server, that repository contains the pipeline for deployment. We will first need to create a repository and push that into it. Go ahead on Github and create a private repository, name it like you want, I suggest mineconf so you remember to come back to my repo once in a while and update your files!

We also need to add your server SSH public key to your github account, this is needed for pulling the git changes without password prompt, for that you can fork from this tutorial and go ahead follow these steps: [https://help.github.com/en/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account](https://help.github.com/en/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account)

Okay, so now your repo is located at [git@github.com](mailto:git@github.com):username/mineconf.git (change username with yours), let’s update the mineconf repo that we pulled earlier, run these commands to modify the remote url and push the repo content to it:

> cd ~/mineconf

> # replace username by your username underneath

> git remote set-url origin [git@github.com](mailto:git@github.com):username/mineconf.git

> git push

Now, in the earlier steps, you created a pair ssh keys, copy the one inside ~/.ssh/id_rsa, which is your private key (Keep it private, it is VERY dangereous to share that) and put it inside the Github Secrets of your Repo, at the same time you should add the HOST (hostname you created in no-ip2) and your linux user username, here how it should look like:
![](/content/images/2020/05/image-21.png)
Ouff, this was a lot to digest. Take your time understanding every step. Also it is very important to audit anything you get from open source, you can check and dig into the Actions I wrote, the services you copy pasted and so on.

Let’s look at how they look on the time of writing this:

    name: Minecraft Config CI/CD
    
    on:
      push:
        branches: [ master ]
      pull_request:
        branches: [ master ]
    
    jobs:
      deploy:
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v2
        - name: Test SSH Command
          uses: appleboy/ssh-action@v0.0.7
          with:
            # Goes into your configuration files and gets the latest changes from github
            script: cd ~/mineconf && git stash && git pull && sudo systemctl restart minecraft && ls -la
            host: ${{ secrets.HOST }}
            username: ${{ secrets.USERNAME }}
            key: ${{ secrets.PRIVATE_KEY }}

Here the “on” keyword means trigger on push and pull request on branch master, I only put one job which is a deployment and runs on an ubuntu machine, the first step checksout to our branch and the second step runs a command via SSH which goes into the mineconf folder, stashes the local changes, pulls the newest changes and restarts minecraft. I added ls -la to show a log on the github actions, helps with debugging etc.

> cd ~/mineconf && git stash && git pull && sudo systemctl restart minecraft && ls -la

For now it is a fairly basic pipeline, I (or anyone, it’s open source) will eventually added tests (because I freaking love tests) and documentation, this will make the deployments more robust, if someone makes a typo and breaks the whitelist file, it will block at the test level. You can already imagine how limitless the options are!

This is a typical pipeline that you would write with any tool like gitlab CI, Github Actions, Ansible, etc. They have different namings and stuff but it’s the same thing.
![](https://miro.medium.com/max/38/0*b_YRCmB33_3mdkwL?q=20)Them Pipelines man
Next, let’s activate them! Go to ~/mineconf and rename .github_ to .github (I have deactivated it on the public repository by adding a _ at the end)

> cd ~/mineconf

> mv .github_ .github

Add these changes and push to your repo

> git add .github .github_

> git add whitelist.json

git commit -m “Activated Github Actions and added User to whitelist.json”

(whitelist.json keeps getting overrided by the Minecraft Server and messes up with the format, I usually just do a git stash when it’s the only change because I want to keep my json formatted correctly, but since it’s the first time we push it, add it to the repo to not lose the user you added)

Now that should’ve automatically triggered the automated deployment. Go ahead into the github repository in the Actions Tab, it should look like this:
![](/content/images/2020/05/image-22.png)
I can see there that my brother updated the whitelist.json and his friend is now playing on our server, I should get more RAM.

Now to finish up, we need to make a symlink for the server properties so you can play with it on Github, and the permissions.json. You can easily go ahead and remove the files that exist on the server and create the symlinks:

> rm /opt/minecraft/permissions.json /opt/minecraft/server.properties

> ln -s $HOME/mineconf/server.properties /opt/minecraft/server.properties

> ln -s $HOME/mineconf/permissions.json /opt/minecraft/permissions.json

> sudo systemctl restart minecraft

There you go! You are ready to roll, now, if you need to add someone to your whitelist, you just need to add it directly from the online GitHub GUI. No need to bother with SSHing etc. That’s a good feeling, and that’s the feeling that every DevOps or Developer look for, things that took minutes, hours or days to accomplish, now takes 11 seconds.

# Conclusion

Okay, we learned about running a server, changing file permissions, connecting, ssh keys, automated deployments, DynamicDNS, Port Forwarding. That pretty much covers the whole DevOps job thingy. You’re ready to go to that interview with confidence now, the day to day job doesn’t look very different to this, might get a bit more complicated sometimes but there’s always a simple solution.

I hope you enjoyed your read and learned stuff along the way! Don’t hesitate leaving a comment if you find that I went too fast somewhere or need more clarifications or even if you just found a typo or a mistake!
