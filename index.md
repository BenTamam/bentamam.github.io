---
layout: page
title: "Ben Tamam"
subtitle: "Offensive Security Engineer & Security Researcher"
show-avatar: true
nav-short: true
---

## Blog

<div class="plc-list">
{% for post in site.posts %}
  <div class="plc-card">
    <div class="plc-text">
      <h3 class="plc-title">
        <a class="plc-title-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </h3>

      {% if post.subtitle %}
        <p class="plc-sub">{{ post.subtitle }}</p>
      {% endif %}

      <div class="plc-meta">
        <span class="plc-date">{{ post.date | date: "%b %-d, %Y" }}</span>
        {% if post.tags and post.tags.size > 0 %}
          <span class="plc-tags"> ·
            {% for tag in post.tags %}
              <a class="plc-tag" href="{{ '/tags' | relative_url }}#{{ tag | slugify }}">#{{ tag }}</a>
            {% endfor %}
          </span>
        {% endif %}
      </div>
    </div>

    {% assign thumb = post.thumbnail-img | default: post.cover-img %}
    {% if thumb %}
      <div class="plc-thumb">
        <img src="{{ thumb | relative_url }}" alt="{{ post.title }}">
      </div>
    {% endif %}
  </div>
{% endfor %}
</div>

<style>
/* compact, professional blog list */
.plc-list{display:flex;flex-direction:column;gap:12px}
.plc-card{
  display:grid;grid-template-columns:1fr 110px;gap:14px;
  padding:12px 0;border-bottom:1px solid #e5e7eb
}
.plc-text{display:flex;flex-direction:column}
.plc-title{margin:0}
.plc-title-link{text-decoration:none;font-size:1.05rem;font-weight:800;line-height:1.2}
.plc-title-link:hover{text-decoration:underline}
.plc-sub{margin:.15rem 0;font-size:.9rem;opacity:.85}
.plc-meta{font-size:.78rem;opacity:.65}
.plc-tags{margin-left:4px}
.plc-tag{margin-right:6px;text-decoration:none}
.plc-tag:hover{text-decoration:underline}
.plc-excerpt{margin:.25rem 0 0 0;font-size:.9rem;line-height:1.35;color:#334155}
.plc-thumb{display:flex;justify-content:center;align-items:center}
.plc-thumb img{
  width:100px;height:100px;object-fit:cover;border-radius:8px; /* square (set to 0 for sharp corners) */
}
@media(max-width:720px){
  .plc-card{grid-template-columns:1fr}
  .plc-thumb img{width:84px;height:84px}
}
</style>
