---
title: A Guide to integrate Utterances with Ghost Blog.
slug: utterance-ghost
date_published: 2020-05-31T02:35:25.000Z
date_updated: 2020-06-01T01:29:45.000Z
excerpt: Utterances gives your users the possibility to comment on your blog posts using GitHub credentials.
layout: layouts/post.njk
tags:
  - blog
  - utterances
---

### Utterances Integration

So I came across a pretty cool open source project that let’s you use github issues to integrate commenting to your blogposts.

Adding to this other pretty cool open source blog project named ghost, the combination to me is the best since I don't like reinventing the wheel.

For more information here is the link: https://utteranc.es/

For the blog: https://ghost.org

Basically, all you'll have to do is to copy the Utterance snippet and put it inside the `post.hbs` file, then zip the modified theme and upload it to your blog.

The snippet that you need to copy:

```bash
    <script src="https://utteranc.es/client.js"
        repo="user/repo"
        issue-term="pathname"
        theme="github-dark"
        crossorigin="anonymous"
        async>
    </script>

```

For example, I use the Casper theme so I forked the official github repository of Casper and added that snippet there, then I Downloaded the repository as Zip and uploaded that to my Ghost blog.

Here's the permalink for the modified code: 

[https://github.com/serafdev/Casper/blob/777098a35b869060aefc664aceb8ad70b9290c27/post.hbs#L117](https://github.com/serafdev/Casper/blob/777098a35b869060aefc664aceb8ad70b9290c27/post.hbs#L117)
