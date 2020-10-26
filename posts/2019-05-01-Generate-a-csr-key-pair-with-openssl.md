---
title: Generate a CSR/Key pair with openssl (linux)
date_published: 2019-05-01T20:36:00.000Z
summary: I'll just show you how to generate a CSR/Key pair with openssl on linux, I use it all the time so putting it here to not lose it is helpful.
categories: linux security openssl
layout: layouts/post.njk
tags:
  - openssl
  - security
---

#### Command
```bash
openssl req -new -newkey rsa:2048 -nodes -keyout faresbessrour.com.key -out faresbessrour.com.csr
```

That will create a key `faresbessrour.com.key` and a csr `faresbessrour.com.csr`, make sure you backup the key somewhere secure and you can use the CSR to get a certificate from a CA, then you can throw it. The CRT part that you will get is the public part so it is not as important.

#### Footnote
The most important part is the CN, it should be your url or your machine name, the rest is just whatever I think, but it's still good to put the correct information if you will deploy to production, else for local testing you can skip those questions, but I'm not sure
