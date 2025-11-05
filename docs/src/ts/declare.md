# 使用 declare 关键字声明类型

在 TypeScript 中，`declare` 关键字主要用于**类型声明**，它告诉 TypeScript 编译器某个实体（变量、函数、类等）已经存在，不需要在当前的 TypeScript 代码中实现。

## 为什么需要 declare

TypeScript 作为静态类型语言，需要在编译阶段了解所有类型信息才能进行有效的类型检查。然而，JavaScript 本质是一门动态语言，许多实体（如全局变量、第三方库、环境变量等）只有在运行时才真正存在。

`declare` 关键字正是为了解决**静态类型与动态运行时**之间的鸿沟。它充当了连接 TypeScript 类型系统与 JavaScript 运行时环境的桥梁，让开发者能够在编译阶段为那些运行时才可用的实体提供类型信息。

具体问题场景：假设在 HTML 中引入了 JQuery

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

然后在 TypeScript 中想要使用:

```typescript
// app.ts
$("#myButton").click() // ❌ 编译错误：找不到名称 '$'
```

因为 TypeScript 看到 `$`，但是在项目中找不到这个标识符的定义，解决方案就是使用 `declare` 关键字

```typescript
declare var $: (selector: string) => any
$("#myButton").click() // ✅ 现在可以编译了
```

## declare 的主要用途

1. 声明全局变量

当变量在运行时存在（比如通过 `<script>` 标签引入或构建时注入），但 TypeScript 不知道时：

```typescript
// 告诉 TypeScript 这些全局变量已经存在
declare const APP_VERSION: string
declare const IS_PRODUCTION: boolean

// 现在可以安全使用
console.log(`App v${APP_VERSION}`)
if (IS_PRODUCTION) {
  // 生产环境特定逻辑
}
```

2. 为第三方 JavaScript 库提供类型

很多老旧的 JavaScript 库都是用纯 JavaScript 写的，没有类型定义：

```typescript
declare module 'old-js-library' {
  export function doSomethingCool(input: string): number;
  export const CONFIG {
    timeout: number;
    retries: number;
  }
}

// 安全导入和使用
import { doSomethingCool } from 'old-js-library'
const result = doSomethingCool('hello')
```

3. 声明环境变量和构建常量时

这些值在构建时被注入，源代码中看不到

```typescript
declare const API_BASE_URL: string
declare const NODE_ENV: "development" | "production" | "test"

function callAPI(endpoint: string) {
  // TypeScript 知道 API_BASE_URL 是 string 类型
  return fetch(`${API_BASE_URL}${endpoint}`)
}
```

4. 扩展全局对象

为浏览器环境或 Node.js 环境中的全局对象添加新属性

```typescript
// 扩展 Window 对象
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    analytics: {
      track(event: string, data?: any): void
    }
  }
}

// 使用
window.gtag("event", "page_view")
window.analytics.track("user_login")
```

## 关键特性：declare 不产生运行时代码

```typescript
declare const VERSION: string
console.log(VERSION)

// 编译后的 JavaScript 代码：
console.log(VERSION)
// declare 语句完全消失了！
```

`declare` 只是类型声明，在编译到 JavaScript 时会被完全移除。

记住这个简单的原则：当你需要告诉 TypeScript"相信我，这个在运行时存在"时，就使用 declare。
