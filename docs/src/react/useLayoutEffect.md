# useLayoutEffect

`useLayoutEffect` 是 React 提供的一个 Hook，它的用法和 `useEffect` 完全一样，接受两个参数（副作用函数和依赖项数组）

它的副作用会在 DOM 更新后，浏览器绘制前同步执行。

## useEffect vs useLayoutEffect

`useEffect` 在浏览器完成绘制后异步执行，不会阻塞页面渲染。

`useLayoutEffect` 在 DOM 更新后、浏览器绘制前同步执行，会阻塞页面渲染，直到副作用执行完毕。

## useLayoutEffect 使用场景

- 读取并同步修改 DOM，如测量元素宽高后立即设置样式
- 需要避免“闪烁”或“抖动”的 UI 场景

```jsx
import { useLayoutEffect, useRef } from "react"

function MyComponent() {
  const divRef = useRef()

  useLayoutEffect(() => {
    // 读取 DOM 信息
    const width = divRef.current.offsetWidth
    // 立即同步修改 DOM
    divRef.current.style.width = width + 100 + "px"
  }, [])

  return <div ref={divRef}>内容</div>
}
```
