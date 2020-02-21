---
layout:     post
title:      Jekyll&Liquid&YAML语法笔记
subtitle:   更好的用Jekyll来构建博客
date:       2018-12-19
author:     Lee
header-img: img/background-jekyll.png
catalog: true
tags:
    - Jekyll
    - YAML
---
> Jekyll是一个非常棒的静态网页生成工具，本文就实际使用过程中的一些小问题做了记录，遇到相同问题的朋友可以有个参考。

### Jekyll文件夹结构简介

```code
.
├── _config.yml
├── _drafts
|   ├── ....textile/md
|   └── ....textile/md
├── _includes
|   ├── footer.html
|   └── header.html
├── _layouts
|   ├── default.html
|   └── post.html
├── _posts
|   ├── ....textile/md
|   └── ....textile/md
├── _site
└── index.html
```

上面是一个很基本的文件夹结构，下面对它做一些基本的解释

* `_posts`文件夹是放markdown格式的博客的.

* `_includes`用于放置子模版.

* `_layouts`用于放置父模板,默认有default.html和post.html

* `_sites`是自动生成的,需要用.gitignore忽略

* `_drafts`你可以建一个草稿文件夹放还没写完的文章.

> 可以根据需要来新建其他文件夹,并且像静态服务器那样访问他们, 比如可以新建一个img文件夹,里面放一些图片文件。

* `_config.yml`Jekyll的全局配置文件，可以通过`site.key`来访问其中的自定义键值。

> * 翻页需要加上`gems: ["jekyll-paginate"]`
> * GitHub语法高亮2016年以后只支持 `rouge`(兼容 `pygments`)，所以尽量不要自己改回`pygments`
> * markdown 渲染器尽量选 `kramdown` ，GitHub，GitLab都推荐使用

### Jekyll写文章

```yaml
---
layout: post
title: Jekyll is Cool
tags:
  - jekyll
  - github
  - blog
categories:
  - blog
---
```

上面是一个典型的Jekyll文章的头部信息，尽管这个头部信息是可选，,但最好还是写完整，也方便后期查找修改。

> 预设的博客格式属性可以在[Jekyll的官方文档](https://jekyllrb.com/docs/front-matter/)上找到

下面紧接着就可以使用Markdown或者Texttile进行创作啦！

### Jekyll文章模板

文章模板是用一个叫Liquid Template Language做的，基本属于大众语法,{% raw %}{{ ... }}{% endraw %}表示插入,{% raw %}{% some code %}{% endraw %}表示执行，没有太多学习成本.

> [Liquid Template Language 官方文档](https://shopify.github.io/liquid/)

如果修改文章却没有变化，多半是Jekyll没有编译成功，基本就是模板编译错误。这个错误在本地编译时可以在控制台上看到提示。

### Jekyll提供的默认变量

因为每一版的变量都有调整，建议在使用的时候从[官方文档](https://jekyllrb.com/docs/variables/)上查找变量释义

### 一些小问题

#### 包含含有{% raw %}{{...}}{% endraw %}代码

> Jekyll这个RubyGem首先处理Liquid Template Language，将模板解析完毕后，再由markdown生成静态网页。

按照上面所说，如果你写的博客中的代码本身就包含有类似{% raw %}**{{...}}**{% endraw %}的字符（这是极有可能的），那么它就会被当作Liquid模板语言被解析，而这并不是你做希望的。那怎么办呢？
这个时候就需要用到Liquid模板中的{% raw %}**{% raw %}......{% endraw %**{% endraw %}**}**标签来实现，这两个标签中间的内容会被直接当作文本加载到markdown中，从而达到我们所希望的效果。

> PS. 有兴趣的同学可以试试看怎么打出{% raw %}**{% endraw %**{% endraw %}**}**这个标签哦。
