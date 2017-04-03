---
title: {{ post.title }}
date: {{ date }}
tags: [{{ tags }}]
author: {{ post.user.login }}
---
{{ &post.body }}

***
Sync From: {{ &post.html_url }}
