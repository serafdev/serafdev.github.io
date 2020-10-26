---
title: How Magit improved my workflow
slug: how-magit-improved-my-workflow
date_published: 2020-03-29T02:57:00.000Z
date_updated: 2020-05-31T03:25:34.000Z
tags:
  - tools
  - git
  - magit
  - emacs
layout: layouts/post.njk
---

As a software developer, git is the most important collaborative tool you have to use, mastering it is essential for anyone that collaborates in the code base.

Your git repository probably broke so many times, you most certainly staged (git add) files (those database credentials) and had to google to find out how to un-stage them.

I will cover some of these and let you explore more! I always wanted to showcase some of Magit, now that it is available for VSCode and not only on my editor, it is time for you too to do the switch, I can guarantee that it will be available for most editors sometime in this decade! (lol, I’m a patient man, a decade is nothing)

---

# Installation

As from last month, VSCode users can get it on the marketplace, I will although go through this article using emacs with evil-mode, not that it matters, the only difference should be the keybindings, the workflow will be the same. I will still try to get the keybindings from VSCode when I can.

For emacs users you can install it following the official guide here [https:/magit.vc/manual/magit/Installing-from-Melpa.html#Installing-from-Melpa](https://magit.vc/manual/magit/Installing-from-Melpa.html#Installing-from-Melpa). If you use the spacemacs configuration you only need to add “magit” to your layers.

---

Spoil alert, you can jump at the bottom of the page to look at the whole menu of Magit in my editor. It’s basically most git commands.

I will here only cover git add, commit, remote, push.

# git add

This is the basic process that all of us have to go through so many times, as simple as it is, you still have to remember what you’re adding, what were you working on, etc. So basically you often need to go through all the changes you made, make sure you didn’t forget any Printf or console.logs, so the first thing you do is a git status to look at what files were changed, and then a git diff to look at the changes made compared to the latest commit. If you find anything you need to remove or modify, you need to go inside that file and do your changes.

Now that you’re done, you need to stage (git add) the files you want to commit, then commit and push. On a side note here, it is important to stage files carefully, I’ve seen people use the git add — all blindly. Don’t do that make sure you know exactly what you’re staging.

Let’s now see how this process goes with Magit, first you need to open the “Magit Status” buffer, you can open the buffer by running the tool in your editor, or simply the keybinding for it.

So I prepared some changes and I am ready for my next commit. I open the buffer (SPC+g+s for me):
![](/img/2020/05/image-20.png)
You can see how cool already the Magit status buffer is already, you can see the Unstaged changes, the recent commits just under it and in the same windows you can still see the file you’re editing on top. In the same buffer we have git status and git log and the buffer is interactive! Let’s put our cursor on the line with “modified main.go” and click “TAB”.
![](/img/2020/05/image-19.png)
Noice. So that’s the change I made, okay, so now in the same buffer we also have a git diff and I can easily stage only parts of a file, each part has a pink header here. Hmm, I don’t like the first part, I will have to remove that x it seems like it got there unintentionally, but the other part looks great.

I will point on the “package mainx” part and click “x” for Discard, then I will point on the Println modification and click “s” for Stage:
![](/img/2020/05/image-18.png)
Ok, now we have our first hunk discarded and the Println modification is Staged, we can see that it is now in the Staged section. If you want to unstage, you can just unstaged it back by click on “u”.

You can also click enter in any part of the Unstagged, Untracked and Staged hunks to open them and modify them.

# git commit

We are now ready to commit. So I simply click “c” for commit:
![](/img/2020/05/image-17.png)
Wait, what? I did not know the existence of all those arguments before using Magit, I always had to go to stackoverflow and search for “How to override the author? How to Fixup? How to squash? Can I make this verbose? How to reset the author when amending?” Welp, no more. So let’s keep this simple, I just want to commit. I will click “c” again as shown in the bottom legend.
![](/img/2020/05/image-16.png)
We now have 2 buffers open, one for the commit message and one with the details of all the changes made, this is so helpful when writing a commit message (and keeps giving you visibility in case you forgot something).

I will write a message and save my commit with “CTRL+C CTRL+C”.
![](/img/2020/05/image-15.png)
Before pushing our changes, we can see the line “Head: master Second Commit” but there is no line for “Push”, that is because we do not have a remote repository.

# git remote

Let’s add the remote repository, press M for reMote (lol)
![](/img/2020/05/image-14.png)
Then “a” to Add a remote branch:
![](/img/2020/05/image-13.png)
After writing the Remote name (I named is “origin” as per the convention) press Enter:
![](/img/2020/05/image-12.png)
Now set the url and click enter (You can put an ssh-style url too):
![](/img/2020/05/image-11.png)
Finally press y for setting “remote.pushDefault” to “origin”:
![](/img/2020/05/image-10.png)
Now you can see the second line appear, saying “Push: origin/master does not exist”. The “does not exist” part is because our remote branch is empty.

# git push

We are now ready to push, I will simply press on “P” (capital P, aka Shift+P):
![](/img/2020/05/image-9.png)
This view gives me many options, the one that I will focus on is the “Push master to” section, you still can quickly skim on the other parts to see that it gives you also the option to push another branch or tag while staying on the current branch. There’s also the usual arguments which are fairly simple for the “git push” command.

Let’s look at the line with the “p” command, saying that if we push it will push to origin/master, it will also create the remote branch for us. Let’s do that:
![](/img/2020/05/image-8.png)
It prompts me for my username and password (If you usually do this process with an ssh key it wouldn’t prompt anything):
![](/img/2020/05/image-7.png)
The “Push:” line changed, the latest commit on origin/master is now “Second Commit” and we are done with our day-to-day work.

# Magit Commands

Here’s a simple screenshot with all commands available, in the Magit Status buffer, click “h”:
![](/img/2020/05/image-6.png)
I find this very interesting because it shows me many commands that I usually don’t use and I should use more, and many commands that I didn’t know existed, it is easy to click on any of them to look at the details and look at what they do. In the beginnings this buffer is your best friend, in no time all these commands will become automatic.

# The End.

It looked pretty long (and felt pretty long to me because I had to do screenshots), but when you get used to the keybindings, this whole process shouldn’t take more than 15 seconds + Writing commit time (assuming that you are only adding 1 change and don’t have to go through your files during add). Here’s a full recap to show how quick things can go:

git status: SPC g s

git add: s for stage, u for unstage, x for discard

git commit: c c for commit, c a for commit amend, ctrl c ctrl c to save commit.

git push: P p

Other great things that I did not cover here are Squash and Fixups that I use very often now that I have Magit, I used to be scared of these but with visibility this tool gives me, it is so simple and quick to use. Also merges and Fixing conflicts is very easy because of this “Magit Status” buffer that shows the conflicts and let’s me directly jump into them.

I know there is many GUI tools that helps you with your git process, but those makes you forget what you can or can’t do with git, this let’s me still interact with git the same as I would from the command line.

I hope this was useful for you. If you want me to cover anything else, let me know bellow in the comments!

Happy Magiting!
