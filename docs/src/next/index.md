# Next.js

Next.js 是一个基于 React 的服务端渲染（SSR）和静态网站生成（SSG）框架。它由 Vercel 开发，旨在让 React 应用开发更简单、更高效，尤其是在 SEO、性能优化和生产部署方面。

## Next.js 和 React 的关系

React 是一个用于构建用户界面的 JavaScript 库，专注于视图层（View）。只负责组件的声明式开发和 UI 渲染。

Next.js 是基于 React 的一个框架，扩展了 React 的能力，提供了服务端渲染、静态生成、路由系统、API 路由、图片优化等一系列功能。

| 对比项    | React                         | Next.js                                 |
| --------- | ----------------------------- | --------------------------------------- |
| 定位      | UI 库                         | React 应用开发框架                      |
| 路由      | 需手动配置（如 react-router） | 基于文件系统自动生成                    |
| 渲染方式  | 仅客户端渲染（CSR）           | 支持 SSR、SSG、ISR、CSR 多种渲染方式    |
| SEO       | 支持有限                      | 支持服务端渲染，SEO 友好                |
| 构建/部署 | 需自行配置                    | 内置构建、部署优化                      |
| 其他功能  | 需手动集成                    | 内置 API 路由、图片优化、静态资源处理等 |

## Next.js 核心特性

### 多种渲染模式

- SSR（Server Side Rendering，服务端渲染）：页面在服务端生成 HTML；
- SSG（Static Site Generation，静态生成）：构建时生成静态页面，适合内容不常变的网站。
- ISR（Incremental Static Regeneration，增量静态生成）：支持静态页面的按需、定时再生成，兼顾静态和动态内容。
- CSR（Client Side Rendering，客户端渲染）：兼容传统 React 的客户端渲染方式。

### 基于文件系统的路由

只需要在 `pages` 目录下创建文件既可自动生成对应路由，无需手动配置；

### API 路由

在 `pages/api` 目录下创建 JS / TS 文件即可实现后端接口，方便前后端一体化开发；

### 自动性能优化

Next.js 开箱即用的优化机制包括：

- 图片优化：自动压缩、懒加载等；
- 字体优化：减少 CLS，提高视觉体验
- SEO 支持：更易被搜索引擎抓取
- 资源预加载：加快页面访问速度

## 水合（Hydration）

水合（Hydration）是服务端渲染（SSR）与客户端渲染结合时的一个重要机制。它指的是：浏览器端的 React 应用接管（激活）服务端渲染出来的静态 HTML，使其变为可交互的 React 组件。

其原理是，服务端先将 React 组件渲染为 HTML 字符串，返回给浏览器。浏览器加载页面后，前端 JavaScript 代码会用 React 的 hydrate 或 hydrateRoot 方法，将 React 组件"挂载"到已有的 HTML 上。React 会复用已有的 DOM 节点，只为需要交互的部分添加事件监听等，从而避免了客户端重新渲染整个页面，提高了性能。

例如：

```js
// 服务端渲染
const html = renderToString(<App />)
// 客户端水合
ReactDOM.hydrateRoot(document.getElementById("root"), <App />)
```

水合的意义在于，用户首次访问时，看到的是已经渲染好的 HTML，体验更好；而在 JavaScript 加载后，页面上的按钮、表单等交互功能会被激活。水合是连接 SSR 和客户端 React 的桥梁，让页面既快又能交互，是现代 React/Next.js 应用的重要机制。

## App Router VS Pages Router

| 特性/对比点                    | App Router（现代）                                                     | Pages Router（传统）                                               |
| ------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 发布版本                       | Next.js 13.4（2023 年）                                                | Next.js v1（2016 年）                                              |
| 适用建议                       | ✅ 推荐用于新项目                                                      | ✅ 仍受支持，未来持续维护                                          |
| 架构                           | 基于 React 全栈架构（Server Components、Server Actions、Streaming 等） | 无全栈架构，仅支持传统页面逻辑                                     |
| 数据获取方式                   | 在组件中直接使用 `fetch()` 获取数据                                    | 使用 Next.js 特定 API，如 `getStaticProps` 和 `getServerSideProps` |
| 布局支持                       | ✅ 非常易于创建布局、加载器等                                          | ⚠️ 实现布局相对复杂                                                |
| 路由功能                       | ✅ 支持并行路由等高级功能                                              | 🚫 功能较基础                                                      |
| 开发体验（DX）& 用户体验（UX） | ✅ 更现代、更灵活                                                      | ✅ 简单易懂，上手快                                                |
| 缓存机制                       | ⚠️ 缓存策略激进，可能引起困惑                                          | 相对简单、易控                                                     |
| 学习曲线                       | ⚠️ 较陡峭（但是 React 生态的一部分）                                   | ✅ 更平缓、易学                                                    |

## React Server Component （RSC）

RSC 是一种全新全新的架构模式，允许开发者：

- 在服务器端渲染组件：部分组件只在服务器上运行和渲染；
- 减少客户端压力：服务器组件不会被打包到客户端 bundle 中；
- 自然混合前后端代码：在同一个库中无缝集成前后端逻辑；

在 RSC 架构中，区分组件应该写在 Server Component 还是 Client Component 中主要基于以下规则：

Server Component 适用场景：

1. 数据获取和数据处理：需要直接访问数据库或后端 API，包含敏感逻辑和数据；
2. 静态内容：不包含交互性、状态或效果的纯展示内容，例如：文章内容、产品描述等；
3. 大型依赖：使用尽在服务器可用的 npm 包；
4. 性能优化：希望减少客户端 bundle 大小；

Client Component 适用场景：

1. 交互需求：需要事件处理、状态管理、调用浏览器 API；
2. UI 状态：表单输入、动画、拖拽等效果；
3. 第三方库：依赖客户端功能的库

![server-client boundary](./images/server-client-boundary.png)

## Client Component VS Server Component

| 特性                 | 客户端组件 (Client Components)            | 服务器组件 (Server Components)        |
| -------------------- | ----------------------------------------- | ------------------------------------- |
| **状态/Hooks**       | ✅ 支持 (useState, useEffect 等)          | ❌ 不支持                             |
| **状态提升**         | ⬜ 可选 (Lifting state up)                | ❌ 不适用 (N.A.)                      |
| **Props 传递**       | ✅ 支持                                   | ✅ 支持 (必须可序列化，不能传函数/类) |
| **数据获取**         | ⬜ 可通过库实现 (preferably with library) | ✅ 首选 (直接使用 async/await)        |
| **导入限制**         | 仅能导入客户端组件                        | 可导入客户端和服务器组件              |
| **渲染限制**         | 只能渲染客户端组件                        | 可渲染客户端和服务器组件              |
| **重新渲染触发条件** | 状态变化时                                | URL 变化时 (导航)                     |
| **默认类型**         | ❌ 需要显式声明 "use client"              | ✅ 默认类型                           |

## React Server Component 优缺点

### 优势

1. 全栈开发能力：仅用 React 组件 + Server actions 即可构建完整全栈应用；前后端共享单一代码库；
2. 数据安全与效率：服务端组件直接访问数据源；页面级数据预获取，避免客户端请求；“代码消失”特性：服务端组件不传输 JS，可零成本引入大型库；
3. 开发体验：更贴近传统 React 开发；

### 劣势

1. 复杂程度增加：显著提高 React 复杂度，需要学习新的概念；需频繁决策组件类型(服务端/客户端)和数据获取位置；
2. 功能限制：上下文 API（Context API）在服务端不可用；必须依赖框架使用
3. 架构决策：增加了"组件类型选择"等新的架构决策点，需要权衡服务端/客户端功能边界；

## React Server Component Works Behind the Scenes

![rsc behind the scenes](./images/rsc-behind-scenes.png)

![rsc behind the scenes](./images/rsc-behind-scenes2.png)
