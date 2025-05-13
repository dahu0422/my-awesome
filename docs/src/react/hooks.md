# 常用的 Hooks

- `useState` 状态管理：用于声明组件中的状态变量；

- `useEffect` 副作用处理：用于处理副作用，如请求数据、订阅、操作 DOM 等。

```jsx
import { useEffect, useState } from 'react'

function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval); // 清除副作用
  }, []); // 依赖为空数组，表示只执行一次（类似 componentDidMount）

  return <div>{seconds}秒</div>
}
```

- `useLayoutEffect` 和 `useEffect` 类似，但在 **DOM 更新后同步执行**，可用于读取 DOM 布局

```jsx
import { useLayoutEffect, useRef } from 'react';

function Measure() {
  const ref = useRef();

  useLayoutEffect(() => {
    console.log(ref.current.getBoundingClientRect());
  }, []);

  return <div ref={ref}>Measure me</div>;
}

```

:::tip `useEffect` 和 `useLayoutEffect` 有什么区别？

| 特性     | `useEffect`      | `useLayoutEffect`   |
| ------ | ---------------- | ------------------- |
| 执行时机   | **浏览器完成绘制后**（异步） | **DOM 更新后、绘制前**（同步） |
| 是否阻塞绘制 | ❌ 不会阻塞浏览器渲染      | ✅ 会阻塞浏览器绘制          |
| 适用场景   | 数据请求、订阅、日志等      | DOM 读写、测量布局、滚动定位等   |
| 性能     | 更好               | 可能导致性能问题（慎用）        |

```jsx
import { useEffect, useLayoutEffect, useRef } from 'react';

function Example() {
  const boxRef = useRef();

  useEffect(() => {
    // 异步执行：页面已经“闪了一下”才生效
    boxRef.current.style.transform = 'translateX(100px)';
  }, []);

  // useLayoutEffect(() => {
  //   // 同步执行：页面一开始就是正确位置
  //   boxRef.current.style.transform = 'translateX(100px)';
  // }, []);

  return (
    <div
      ref={boxRef}
      style={{ width: 100, height: 100, background: 'red', transition: 'transform 0.3s' }}
    />
  );
}
使用 `useEffect` 会看到方块先出现在初始位置，然后再向下移动。使用 `useLayoutEffect` 则不会看到闪烁，DOM 在绘制前被修改。

```
:::

- `useMemo` 缓存计算结果，优化性能

```jsx
import { useMemo } from 'react';

function ExpensiveCalculation({ num }) {
  const result = useMemo(() => {
    return fibonacci(num);
  }, [num]); // 只有 num 变化时才重新计算

  return <div>{result}</div>;
}
```

- `useCallback` 缓存函数引用，避免不必要的重渲染

```jsx
import { useCallback, useState } from 'react';

function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 函数不会在每次渲染时重新定义

  return <Child onClick={handleClick} />;
}
```

::: tip `useMemo` 和 `useCallback` 有什么不同？？？

`useMemo` 和 `useCallback` 都是 React 中用于性能优化的 Hooks。
  - `useMemo` 是用来**缓存计算结果的值**，适用于避免重复执行计算密集型操作。
  - `useCallback` 是用来**缓存函数引用**，适用于将函数作为 props 传给子组件时，避免子组件不必要的重新渲染。
:::

- `useReducer` 管理复杂状态逻辑

```jsx
import { useReducer } from 'react'

function reducer(state, action) {
  switch(action.type) {
    case 'increment':
      return { count: state.count + 1 }
    default: 
      return state
  }
}

function counter () {
  const [state, dispatch] = useReducer(reducer, {count: 0})

  return (
    <button onClick={() => dispatch({type: 'increment'})}>{state.count}</button>
  )
}
```

- `useContext` 使用 Context 上下文

- `useRef` 获取 DOM或保存不触发重新渲染的值

- `useImperativeHandle` 自定义 ref 暴露给父组件的方法

```jsx
import React, { useImperativeHandle, useRef, forwardRef } from 'react';

const MyInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus()
  }));
  return <input ref={inputRef} />;
});

function Parent() {
  const ref = useRef();
  return (
    <>
      <MyInput ref={ref} />
      <button onClick={() => ref.current.focus()}>Focus Input</button>
    </>
  );
}

```
