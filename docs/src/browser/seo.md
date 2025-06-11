# SEO

SEO（Search Engine Optimization，搜索引擎优化）是指通过优化网站的内容、结构、代码等方式，提高网站在搜索引擎（如 Google、百度、Bing）自然搜索结果中的排名，从而获得更多免费的、有针对性的流量。

SEO 的核心目标是让网站在用户搜索相关关键词时，能够在搜索结果页面（SERP）中获得更靠前的位置。这样可以吸引更多潜在用户访问网站，提升品牌曝光和转化率。

SEO 分为三个主要方向：

- **站内 SEO**：页面结构、关键词布局、语义化标签、meta 信息等。
- **站外 SEO**：外链建设、品牌影响力、内容营销等。
- **技术 SEO**：网站架构、robots.txt、sitemap.xml、核心 Web 指标等。

## 站内 SEO（On-page SEO）

### 页面标题 `<title>` 、描述 `<meta description>`

设置合适的 `<title>` 和 `<meta>` 标签

```html
<head>
  <title>高质量的产品 - 我的电商网站</title>
  <meta
    name="description"
    content="购买高质量的电子产品，优惠多多，支持包邮。"
  />
  <meta name="keywords" content="电子产品, 高品质, 购物" />
</head>
```

### 合理使用语义化标签

| 标签        | 作用                                          |
| ----------- | --------------------------------------------- |
| `<header>`  | 网站/模块的顶部介绍内容（通常含 logo 和标题） |
| `<nav>`     | 导航区域，包含站内链接                        |
| `<main>`    | 页面主内容区域（仅一个）                      |
| `<section>` | 一组逻辑相关内容（可嵌套）                    |
| `<article>` | 独立、完整内容单元（如新闻、博客）            |
| `<aside>`   | 与主内容相关的补充信息（如侧栏、推荐）        |
| `<footer>`  | 页尾，常包含版权信息、联系方式等              |

示例代码

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SEO Optimized Page</title>
  </head>
  <body>
    <header>
      <h1>Main Title of the Page</h1>
    </header>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
    <main>
      <article>
        <h2>Article Title</h2>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos.
        </p>
      </article>
    </main>
    <footer>
      <p>&copy; 2025 SEO Optimized Page. All rights reserved.</p>
    </footer>
  </body>
</html>
```

### 图片添加 `alt` 属性

```html
<img src="/images/product.jpg" alt="2025款旗舰手机 正面展示图" />
```

没有 `alt` 搜索引擎无法识别图片内容，对无障碍用户不友好。

### 内链优化

```html
<a href="/product/123" title="查看旗舰手机详情">旗舰手机</a>
```

使用具有描述性的 `title`，避免只写“点击这里”之类的无效锚点文本

## 站外 SEO（Off-page SEO）

## 技术 SEO（Technical SEO）

### 网站地图 Sitemap

Sitemap 是一个 XML 文件，列出了网站中所有希望被搜索引擎抓取的 URL。

SEO 作用：指导搜索引擎“优先收录”哪些页面。提供页面的最后更新时间、更新频率、重要性等，有助于爬虫更智能地爬取。

<!-- TODO: Sitemap 如何实现：react 和 next 两种方案 -->

### robots.txt 配置

robots.txt 位于网站根目录，用来告诉搜索引擎“**哪些页面允许抓取，哪些禁止抓取**”。

SEO 作用：防止收录重复页面或敏感页面（如后台、登录页），有助于节省爬虫抓取预算。

它是**搜索引擎爬虫**抓取网站内容时最优先读取的文件之一。直接放在网站根目录的 `public/` 文件夹中

基本语法规则

| 指令         | 含义                                     |
| ------------ | ---------------------------------------- |
| `User-agent` | 指定搜索引擎类型（如 Googlebot）         |
| `Disallow`   | 不允许访问的路径                         |
| `Allow`      | 允许访问的路径（仅在部分路径中例外时用） |
| `Sitemap`    | 指定 sitemap 的链接地址（推荐加）        |
| `#`          | 注释                                     |

示例结构

```txt
User-agent: *        # 所有搜索引擎
Disallow: /admin/    # 禁止抓取后台目录
Allow: /admin/help   # 但允许抓取后台帮助页
Sitemap: https://example.com/sitemap.xml
```

搜索引擎爬虫会在以下几个关键时机读取 `robots.txt` 文件

1. 首次访问网站时：当搜索引擎第一次发现网站（比如通过外链或提交站点），它会第一时间请求 `robots.txt` 文件，判断是否允许抓取首页或其他资源
2. 周期性抓取：爬虫会定期重新访问 `robots.txt` 以检查是否有更新，当 `robots.txt` 更改后，爬虫会自动刷新
3. 抓取新页面或链接前：当爬虫发现新链接，比如增加了新的页面、别人引用了你的文章等，它会先检查 URL 是否被 `robots.txt` 限制，如果禁止了路径，爬虫会跳过。
4. 主动提交 URL 或 sitemap：通过 Google Search Console 或 Bing Webmaster Tools 提交 URL 或 sitemap，爬虫会再次读取 `robots.txt`，确认该 URL 是否允许被抓取。

当出现以下情况，爬虫可能不继续抓取：

- `robots.txt` 返回 403\404\5xx 错误，Google 爬虫会临时不抓取或谨慎抓取
- 文件内容写了 `Disallow:/` 表示禁止抓取整站
- 文件过大或响应慢，有些爬虫会终止解析，影响抓取效果

### Core Web Vitals 页面响应速度与核心 Web 指标

Google 评估用户体验的 3 个性能指标

| 指标                                | 含义                 | 要求    |
| ----------------------------------- | -------------------- | ------- |
| **LCP**（Largest Contentful Paint） | 首屏最大内容渲染时间 | ≤ 2.5s  |
| **FID**（First Input Delay）        | 用户首次交互延迟     | ≤ 100ms |
| **CLS**（Cumulative Layout Shift）  | 页面内容跳动度       | ≤ 0.1   |

SEO 作用：Google 将其作为排名核心因素，页面越快，用户停留时间越长、转化率越高。
