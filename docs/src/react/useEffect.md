# useEffect

`useEffect` 是 React 提供的一个 Hook，主要用于在函数组件中处理副作用（side effects）。

:::tip 副作用
副作用是指那些不是直接用于渲染 UI，而是与外部系统或环境交互的操作。比如：数据请求、手动操作 DOM、定时器、本地存储操作、订阅和取消订阅等。
:::

## useEffect 的定义

```jsx
useEffect(setup, dependencies?)
```

- **第一个参数 setup**：副作用函数，在组件渲染后被执行。可以返回一个**清理函数**，用于组件卸载或依赖变化时做清理工作。
- **第二个参数 dependencies**：依赖项数组，用于告知 React 何时执行副作用。
  - 不写第二个参数：每次渲染都会执行副作用。
  - 空数组 `[]`：只在组件挂载和卸载时执行一次。
  - 有依赖项 `[a, b]`：只有当依赖项 a 或 b 发生变化时才会执行。

## 跳过初始渲染

在 React 中，`useEffect` 默认会在初始渲染后就执行一次。

如果想让 `useEffect` 跳过初始渲染，只在依赖项变化时才执行，可以结合 `useRef` 标记是否为首次渲染。

```jsx
import { useEffect, useRef } from "react"

function MyComponent({ value }) {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false // 标记已渲染过
      return // 跳过首次渲染
    }

    // 这里写依赖变化时的副作用
    console.log("value 变化了，不是初始渲染")
  }, [value])

  return <div>{value}</div>
}
```
