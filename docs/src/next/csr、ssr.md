# CSR 与 SSR

## 客户端渲染（Client-Side Rendering, CSR）

客户端渲染是指浏览器首先加载一个基础的 HTML 页面，然后再加载 JavaScript 文件。页面内容的渲染依赖于 JavaScript 的执行，因此用户初次访问时可能会看到白屏或加载动画。

## 服务端渲染（Server-Side Rendering, SSR）

服务端渲染是指当用户请求页面时，服务器会先生成完整的 HTML 页面，并将其直接返回给浏览器。浏览器收到 HTML 后即可显示内容，随后 JavaScript 接管页面，实现交互功能。

### 如何实现服务端渲染

只需在 `pages` 目录下的页面文件中，导出 `getServerSideProps`，该函数会在每次请求时在服务端运行，获取数据并将其作为 props 传递给页面组件。

```js
// pages/index.js
export async function getServerSideProps(context) {
  // 这里可以进行数据请求，比如调用 API、数据库等
  const res = await fetch("https://api.example.com/data")
  const data = await res.json()

  // 返回的数据会作为 props 传递给页面组件
  return {
    props: { data }, // 必须是一个对象
  }
}

export default function Home({ data }) {
  return (
    <div>
      <h1>服务端渲染页面</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

## 静态站点生成（Static Site Generation，SSG）

静态站点生成是指在构建（build）阶段就把页面内容生成好静态 HTML 文件，用户访问时直接返回这些静态页面，而不是每次请求都去服务端动态生成。

### 如何实现静态站点生成

只需在 `pages` 目录下的页面文件中，导出 `getStaticProps` 函数。该函数会在构建时（build time）执行，用于获取数据并生成静态页面。

```js
// pages/posts/[id].js
export async function getStaticProps(context) {
  const { id } = context.params
  const res = await fetch(`https://api.example.com/posts/${id}`)
  const post = await res.json()

  return {
    props: { post }, // 作为 props 传递给页面组件
  }
}

// 如果是动态路由，还需要 getStaticPaths
export async function getStaticPaths() {
  const res = await fetch("https://api.example.com/posts")
  const posts = await res.json()

  const paths = posts.map((post) => ({
    params: { id: post.id.toString() },
  }))

  return { paths, fallback: false }
}

export default function Post({ post }) {
  return <div>{post.title}</div>
}
```

## CSR vs SSR vs SSG

| 特性         | 客户端渲染（CSR）                         | 服务端渲染（SSR）                 | 静态站点生成（SSG）                        |
| ------------ | ----------------------------------------- | --------------------------------- | ------------------------------------------ |
| 渲染位置     | 浏览器端执行渲染                          | 服务端生成完整 HTML 响应          | 构建时生成静态 HTML，直接由 CDN/服务器返回 |
| 初始加载速度 | ⛔ 较慢：需下载大量 JS，挂载后再请求数据  | ✅ 较快：HTML 和数据一次性返回    | ✅ 非常快：直接返回静态 HTML               |
| 交互性       | ✅ 高：JS 全加载，响应更快                | ⚠️ 有延迟：部分交互需刷新页面     | ✅ 高：和 CSR 一样，JS 加载后全交互        |
| SEO 支持     | ⚠️ 不友好：搜索引擎难抓取 JS 动态内容     | ✅ 友好：内容直接返回，利于收录   | ✅ 友好：内容静态，利于收录                |
| 典型场景     | 内部管理工具、登录后系统、单页应用（SPA） | 博客、新闻、电商、需要 SEO 的页面 | 博客、文档、产品展示、内容不常变的网站     |

## 为什么 SSR 能更快显示页面内容？

服务端渲染（SSR）能更快显示页面内容，主要有以下原因：

### 1. 并行处理

服务器可以同时进行数据获取和 HTML 渲染，客户端只需等待一次 HTTP 响应即可获得完整内容，减少了等待和处理步骤。

### 2. 缩短关键渲染路径

- **客户端渲染流程**：

  1. 加载 HTML
  2. 加载 JavaScript
  3. 执行 JavaScript
  4. 发起数据请求
  5. 渲染内容

- **服务端渲染流程**：
  1. 加载完整 HTML（包含数据）

### 3. 更早显示内容

浏览器收到 HTML 后可以立即渲染页面，无需等待 JavaScript 加载和执行，用户能更快看到页面内容，提升体验。

### 4. 资源利用优化

服务器通常性能更强，可以更快地处理数据和渲染，减轻了客户端设备的压力。
