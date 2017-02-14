---
title: {{ blog.title }}
date: {{ date }}
tags: [{{ tags }}]
author: {{ blog.user.login }}
---
{{ &blog.body }}

***
Sync From: {{ &blog.html_url }}
