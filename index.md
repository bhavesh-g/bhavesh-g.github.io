---
layout: default
title: Home
---

# Hi — I'm {{ site.author.name }}

Welcome to my blog.

## Latest posts
<ul>
  {% for post in site.posts limit:5 %}
    <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>

[About me]({{ '/about/' | relative_url }}) • [Projects]({{ '/projects/' | relative_url }})
