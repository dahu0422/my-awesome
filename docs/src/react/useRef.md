# useRef

`useRef` 是一个 React Hook，用于引用一个"不需要用于渲染"的值。

```jsx
const inputRef = useRef(null)

console.log(inputRef.current)
```

`useRef` 的返回对象在组件的整个生命周期中都是持久的，而不是每次渲染都需要重新创建。

当 `useRef` 的 `.current` 属性改变时，组件不会重新渲染。

## useRef 常见用途

### 访问 DOM 元素

使用 `useRef` 可以直接与 DOM 元素进行交互，例如：手动获取焦点或测量元素尺寸。

```jsx
function TextInput() {
  const inputRef = useRef(null)

  function focusInput() {
    inputRef.current.focus()
  }

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus the input</button>
    </div>
  )
}
```

#### 在组件嵌套场景中使用 useRef

```jsx
import { forwardRef, useRef } from "react"

const MyInput = forwardRef((props, ref) => {
  return <input {...props} ref={ref} />
})

export default function Form() {
  const inputRef = useRef(null)

  function focusInput() {
    inputRef.current.focus()
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={focusInput}>Focus the input</button>
    </>
  )
}
```

### 保存状态但不触发渲染

当需要在组件中保存某些值，而不希望每次该值更改时重新渲染组件，可以使用 `useRef`

```jsx
function Timer() {
  const count = useRef(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      count.current += 1
      console.log(`Elapsed time: ${count.current} seconds`)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])
}
```

### 保存上一次的 props 或 state

有时我们需要在组件中获取上一次的 state 或 props 的值。可以通过 `useRef` 和 `useEffect` 组合实现：

```jsx
function Count() {
  const [count, setCount] = useState(0)
  const prevCountRef = useRef()

  useEffect(() => {
    prevCountRef.current = count // 渲染后保存当前 count
  }, [count])

  const prevCount = prevCountRef.current

  return (
    <div>
      <p>当前值: {count}</p>
      <p>上一次的值: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}
```

**执行顺序说明：**

1. 组件初次渲染时，`count` 为 0，`prevCountRef.current` 为 `undefined`。
2. 渲染后，`useEffect` 执行，把当前 `count` 存入 `prevCountRef.current`。
3. 当点击按钮，`setCount` 触发，`count` 变为新值，组件重新渲染。
4. 此时 `prevCountRef.current` 还是上一次的 `count`，页面显示"上一次的值"。
5. 渲染后，`useEffect` 再次执行，更新 `prevCountRef.current`。

`useEffect` 是在组件渲染之后运行的，因此组件渲染过程中 `prevCountRef.current` 的值还是前一次渲染中保持不变的。

当 `useEffect` 被调用并执行完毕后，`prevCountRef.current` 才会更新。

## 避免在渲染期间写入 ref

React 官方文档明确建议：可以在渲染期间读取 ref，但不要在渲染期间写入 ref。

```jsx
function MyComponent() {
  const myRef = useRef(0)
  // 读取
  console.log(myRef.current) // OK
  // ...
}

// function MyComponent() {
//   const myRef = useRef(0)
//   myRef.current = 123 // ❌ 不推荐在渲染期间写入
//   // ...
// }

useEffect(() => {
  myRef.current = 123 // ✅ 推荐在副作用中写入
}, [])
```

如果在渲染期间修改 ref 可能导致不可预期的行为。

## 避免重复创建 ref 的初始值

如果在创建 ref 时，想要通过计算或副作用的方法获取初值，像下面这样写：

```jsx
function ClickCounter() {
  // ❌ 这里的问题是，每次组件渲染时，getInitialCount 都会被调用，尽管它的返回值只在第一次渲染时被使用。
  const countRef = useRef(getInitialCount())

  function handleClick() {
    countRef.current += 1
    console.log(`Button clicked ${countRef.current} times.`)
  }

  return <button onClick={handleClick}>Click me!</button>
}
```

这种方法会导致 `getInitialCount()` 在每次组件渲染时被调用，造成不必要的性能损耗。

正确做法是用 `null` 作为初始值，在渲染过程中判断并赋值：

```jsx
function ClickCounter() {
  const countRef = useRef(null)
  if (countRef.current === null) {
    countRef.current = getInitialCount()
  }

  function handleClick() {
    countRef.current += 1
    console.log(`Button clicked ${countRef.current} times.`)
  }

  return <button onClick={handleClick}>Click me!</button>
}
```
