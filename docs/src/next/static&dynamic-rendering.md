# 静态渲染 & 动态渲染

## 静态渲染 Static Rendering

静态渲染是指在构建阶段（build time），就把页面的 HTML 生成好，部署上线后用户访问时直接返回这些静态 HTML 文件。

Next.js 支持两种静态渲染方式：

- 静态生成（Static Generation，SSG）：页面在构建时一次性生成，适合内容不经常变化的页面
- 增量静态生成（Incremental Static Regeneration，ISR）：页面在后台定时或按需重新生成，兼顾静态性能和数据实时性。

在 Next.js 的 App Router（`app/` 目录）中，如果你在动态路由页面（如 `/cabins/[cabinId]`）中导出 `generateStaticParams` 函数，Next.js 会在构建时自动调用它，获取所有需要静态生成的参数，并为每个参数生成对应的静态页面。例如：

```js
export async function generateStaticParams() {
  const cabins = await getCabins()
  return cabins.map((cabin) => ({
    cabinId: cabin.id.toString(),
  }))
}
```

这样，Next.js 会在打包时为每个 cabin 生成静态 HTML 文件，实现真正的 SSG。用户访问这些页面时，直接返回预先生成好的静态内容，极大提升了访问速度和性能。

适用于内容不经常变化的页面，比如博客、产品详情页等，不需要针对用户个性化的页面。

性能极高，页面可直接通过 CDN 分发，响应速度快。服务器压力小，适合大流量访问。

## 动态渲染 Dynamic Rendering

动态渲染是指在每次请求时（request time），服务器实时生成 HTML 并返回给用户。每个请求可以根据用户、参数等动态生成不同内容。

适用于数据经常变化、或需要根据用户、请求参数动态生成内容的页面，比如购物车、用户中心、搜索结果等页面。需要强个性化、权限控制的页面。

### Next.js 何时自动切换为动态渲染？

通常开发者不需要直接选择路由是静态还是动态渲染，Next.js 会在以下场景自动切换为动态渲染：

1. 路由包含动态片段（如页面使用了 params，例如 `/product/[id]`）。
2. 页面组件中使用了 searchParams（如 `/product?quantity=23` 这样的查询参数）。
3. 在路由的服务端组件中使用了 headers() 或 cookies()（即需要读取请求头或 Cookie）。
4. 在路由的服务端组件中发起了未缓存的数据请求（uncached data request）。

这些情况都意味着页面内容在构建时 Next.js 无法预知，必须在请求时动态生成。

#### 为什么？

因为上述这些值（如 params、searchParams、headers、cookies、未缓存的数据）在构建时 Next.js 无法获知，所以只能在请求时动态渲染页面。

### 如何手动强制动态渲染

开发者也可以通过以下方式强制某个路由动态渲染：

```js
// 在 page.js 中导出
export const dynamic = "force-dynamic"

// 或者
export const revalidate = 0

// 或者 fetch 请求时设置
fetch(url, { cache: "no-store" })

// 或者在服务端组件中使用
noStore()
```

这些设置会影响页面的缓存策略，使其每次请求都动态生成内容。
