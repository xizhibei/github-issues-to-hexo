---
title: {{ post.title }}
date: {{ date }}
updated: {{ updated }}
tags: [{{ tags }}]
author: {{ post.user.login }}
---
{{ &post.body }}

***
Sync From: {{ &post.html_url }}
