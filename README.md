# bhavesh-g.github.io

personal blog built with jekyll and no-style-please theme

## local development

```bash
bundle install
bundle exec jekyll serve
```

visit http://localhost:4000

## deployment

auto-deploys to github pages on push to main

## add new post

create file in `_posts/` with format: `YYYY-MM-DD-title.md`

frontmatter:
```yaml
---
layout: post
title: "your title"
date: YYYY-MM-DD
categories: category-name
---
```

## structure

```
.
├── _config.yml          # site config
├── _data/
│   └── menu.yml        # navigation menu
├── _posts/             # blog posts go here
├── about.md            # about page
├── all-posts.md        # archive page
└── index.md            # homepage
```
