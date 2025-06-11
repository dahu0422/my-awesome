# Server & Client Components

在 Next.js 中，组件根据运行环境分为服务器组件（Server Components）和 客户端组件（Client Components）。这是 Next.js 13 引入的重要特性之一，可以更精细地控制组件的运行方式，优化性能和资源加载。

## Server Components

服务器组件是由 React 提供，Next.js **默认**启用的功能，用于在**服务器端组件代码**，只将最终的 HTML 渲染结果返回给客户端，从而减少客户端 JS 的体积并提升性能。

适用场景如下：

- **获取远程数据**  
  示例场景：首页、商品详情页、博客文章页、用户信息页等。  
  原因：服务端组件可以 `async` 获取数据，页面直接渲染好 HTML，不用等待客户端再请求数据渲染。

  ```jsx
  export default async function Page() {
    const data = await fetchDataFromDB()
    return <div>{data.title}</div>
  }
  ```

- **访问服务端私密资源**

  示例场景：读取数据库、文件、环境变量等；根据用户 session 渲染个性化页面
  原因：服务端组件运行在服务端，可以直接安全的访问这些内容，不暴露在浏览器中。

  ```jsx
  import { cookies } from "next/headers"
  export default function Page() {
    const user = cookies().get("user_session")
    return <div>欢迎你，{user?.value}</div>
  }
  ```

- **静态页面或展示内容**  
  示例场景：落地页、文档页、展示型页面。新闻列表、商品列表等无需交互的区域。  
  原因：不需要交互的组件用服务端渲染即可，避免打包 JS 减少负载。

- **需要提升首屏渲染速度、优化 SEO**  
  示例场景：首页、营销页、文章详情页  
  原因：服务端组件生成完整 HTML，搜索引擎爬虫能立即抓取内容，对 SEO 友好。同时首屏内容可快速展示。

## Client Components

客户端组件时通过 `use client` 指令显示声明的组件，会被打包并发送到浏览器，在客户端运行。适用场景如下：

- **页面需要交互地方**  
  示例场景：表单、按钮点击、切换 Tab、切换语言等。

- **组件中需要使用 React 状态或副作用 Hook**  
  示例场景：使用 `useState`、`useEffect`、`useRef` 等场景

- **访问浏览器特有 API**  
  示例场景：获取窗口大小、监听滚动、访问 `localStorage`、使用 WebSocket、Geolocation、Clipboard 等
