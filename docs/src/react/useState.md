# useState

`useState` 用于在函数组件中添加和管理"状态"。

## 初始化状态

### 基础定义

```jsx
const [age, setAge] = useState(40)
```

### 懒初始化

对于需要计算得到的初始状态，可以传递一个函数给 `useState`。这样该函数只会在初次渲染时执行，而不是每次渲染。

```jsx
const [todos, setTodos] = useState(createInitialTodos)
```

## 更新状态

### 直接更新 VS 函数式更新

大多数情况下，直接更新状态即可：

```jsx
setAge(newState)
```

但当**新状态依赖于前一个状态时**，推荐使用函数式更新。这可以确保更新的准确性，尤其是在并发模式下。

```jsx
setState((prevState) => prevState + 1)
```

以下例子展示了函数式更新的重要性：

```jsx
import { useState } from "react"

export default function Counter() {
  const [age, setAge] = useState(42)

  function increment() {
    setAge((a) => a + 1) // 函数式更新
  }

  return (
    <>
      <h1>Your age: {age}</h1>
      <button
        onClick={() => {
          increment()
          increment()
          increment()
        }}
      >
        +3
      </button>
    </>
  )
}
// 结果：点击 +3 时，age 更新为 45。
```

直接更新

```jsx
// 示例2: 使用直接更新
import { useState } from "react"

export default function Counter() {
  const [age, setAge] = useState(42)
  function increment() {
    setAge(age + 1) // 直接更新
  }
  return (
    <>
      <h1>Your age: {age}</h1>
      <button
        onClick={() => {
          increment()
          increment()
          increment()
        }}
      >
        +3
      </button>
    </>
  )
}
// 结果：点击 +3 时，可能只更新为 43。
```

`age` 的值在单次渲染中是固定的，三次 `increment` 调用都基于一个陈旧的 `age` 值进行计算。所以当需要基于前一个状态来计算新状态时，应该使用 `setState` 的函数式更新。

### 对象与数组的更新

对象和数组的更新需要**创建新的引用**，而不是直接修改原状态。

```jsx
setForm({
  ...form,
  name: e.target.value, // 更新该属性
})

// 错误示例：
// form.name = e.target.value
```

```jsx
setTodos([
  ...todos,
  {
    id: nextId++,
    title: title,
    done: false,
  },
])

// 错误示例：
// todos.push({
//   id: nextId++,
//   title: title,
//   done: false
// });
// setTodos(todos);
```

### 存储函数

如果想在状态中存储一个函数，需要用箭头函数"包裹"它。

```jsx
const [fn, setFn] = useState(() => someFunction)

function handleClick() {
  setFn(() => someOtherFunction)
}
```

通常不会这样用，但在某些特定场景下会用到，比如动态切换回调/策略模式。

有时需要根据用户操作或业务逻辑，动态切换某个回调函数的实现：

```jsx
function fnA() { alert('A'); }
function fnB() { alert('B'); }

const [fn, setFn] = useState(() => fnA);

<button onClick={() => fn()}>执行</button>
<button onClick={() => setFn(() => fnB)}>切换到B</button>
```

## 状态更新批处理

为了优化性能，React 不会在每次调用 `setState` 时都立刻重新渲染组件。相反，它会将短时间内的多个 `setState` 调用"收集"起来，然后将它们合并，最后只进行一次重新渲染。这可以避免不必要的重复渲染，提升性能。

**举个例子：**

```jsx
import { useState } from "react"

export default function Counter() {
  const [number, setNumber] = useState(0)
  const [count, setCount] = useState(0)

  function handleClick() {
    // 这三个 setState 调用会被合并为一次渲染
    setNumber((n) => n + 1) // 结果: 1
    setCount((c) => c + 1) // 结果: 1
    setCount((c) => c + 1) // 结果: 2 (在前一个 setCount 的基础上+1)
  }

  console.log("Component rendered")

  return <button onClick={handleClick}>Update State</button>
}
```

在上面的例子中，即使 `handleClick` 中有三个 `setState` 调用，"`Component rendered`" 也只会在控制台打印一次，说明组件只重新渲染了一次。

### React 18 的自动批处理

从 React 18 开始，批处理是**自动的**。无论 `setState` 在哪里被调用——事件处理函数、`setTimeout`、`Promise` 还是原生事件监听器——React 都会将它们批处理，以减少渲染次数。这被称为"Automatic Batching"。

### React 18 之前的行为差异

在 React 18 之前，批处理的行为是**不一致的**。

- **在 React 事件处理器中**：`setState` 调用会被自动批处理。
- **在 `setTimeout`、`Promise`、原生事件监听器等异步回调中**：`setState` **不会**被批处理，每个调用都会触发一次独立的重新渲染。

**示例：React 17 中的非批处理行为**

如果在 React 17 的环境中运行以下代码，每次点击按钮，`"Component rendered"` 会被打印两次，意味着组件渲染了两次。

```jsx
// 在 React 17 中运行此代码
import { useState } from "react"

export default function Counter() {
  const [number, setNumber] = useState(0)
  const [count, setCount] = useState(0)

  function handleClick() {
    setTimeout(() => {
      // 在 React 17 的 setTimeout 中，这两个更新不会被批处理
      // "Component rendered" 会打印两次
      setNumber((n) => n + 1)
      setCount((c) => c + 1)
    }, 0)
  }

  console.log("Component rendered")

  return <button onClick={handleClick}>Update State in Timeout</button>
}
```

为了解决这个问题，在 React 18 之前，开发者有时会使用 `react-dom` 中一个不稳定的 API `unstable_batchedUpdates` 来手动强制开启批处理：

```jsx
import { unstable_batchedUpdates } from "react-dom"

// ...
setTimeout(() => {
  unstable_batchedUpdates(() => {
    setNumber((n) => n + 1)
    setCount((c) => c + 1) // 现在这两个更新会被批处理
  })
}, 0)
```

React 18 的自动批处理（Automatic Batching）优雅地解决了这种不一致性，使得所有场景下的更新行为都符合预期。

### 如何退出批处理？

在极少数情况下，你可能需要强制 React 在每次 `setState` 后立即同步更新 DOM。这时可以使用 `react-dom` 中的 `flushSync`。

```jsx
import { flushSync } from "react-dom"

function handleClick() {
  flushSync(() => {
    setCount((c) => c + 1)
  })
  // 到这里，DOM 已经被更新

  flushSync(() => {
    setNumber((n) => n + 1)
  })
  // 到这里，DOM 再次被更新
}
```

> **注意**：`flushSync` 应该谨慎使用，因为它会破坏自动批处理带来的性能优势，可能导致意外的行为。
