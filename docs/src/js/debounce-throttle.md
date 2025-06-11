# 防抖、节流

防抖**只在最后一次执行**；节流**定期执行**

## 防抖 Debounce

触发事件后，等待 N 秒，如果 N 秒内没有再触发事件，则执行函数。

适用于：输入框搜索、窗口 resize、按钮点击（防止重复提交）等场景；

## 手写防抖函数

```js
function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    clearTimeout(timer) // 清除上一次回调函数
    timer = setTimeour(() => {
      fn.apply(this, args) // 使用 apply 保证 this 和 参数正确
    }, delay)
  }
}

const fn = (a, b) => {
  console.log(a + b)
}
const debounceFn = debounce(fn, 300)

window.addEventListener("resize", debounceFn(1, 2))
```

## 节流 Throttle

规定一个时间段内只执行一次函数，即使这个时间段内事件被触发多次，也只执行一次。

适用于：滚动加载、mousemove、scroll、resize、拖拽场景。

## 手写节流

### 基于时间戳

```js
function throttle(fn, delay = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}
```

第一次调用会立刻执行 `fn`，之后每隔 `delay` 毫秒，再次执行，

### 基于定时器

```js
function throttle(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null
        fn.apply(this, args)
      }, delay)
    }
  }
}
```

第一次不会立刻执行，而是等 `delay` 毫秒后才执行 `fn`

---

举例说明俩种写法效果上的区别：

假设 delay = 1000ms，用户在 0ms、200ms、400ms、1200ms 连续点击按钮：

时间戳实现方式：

- 0ms 立即执行
- 200ms、400ms 忽略
- 1200ms 距离上次已超过 1000ms 执行

定时器实现方式：

- 0ms 不执行，1000ms 后执行
- 200ms、400ms 忽略
- 1200ms 如果上一个定时器已结束，则再等 1000ms 后执行

---

### 首位双触发（时间戳 + 定时器）

```js
function throttle(fn, delay = 300) {
  let timer = null
  let lastTime = 0

  return function (...args) {
    const now = Date.now()
    const remaining = delay - (now - lastTime) // 距离下次可执行的剩余时间

    if (remaining <= 0) {
      // 距离上次执行已超过 delay，立即执行
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      fn.apply(this, args)
    } else if (!timer) {
      // 距离上次执行还没到 delay，且没有定时器，则设置定时器
      timer = setTimeout(() => {
        lastTime = Date.now()
        timer = null
        fn.apply(this, args)
      }, remaining)
    }
  }
}
```

第一次调用时 `lastTime` 为 0，`remaining <= 0` 立即执行 `fn`。如果在 `delay` 时间内再次调用，不会立即执行，而是设置一个定时器，在剩余时间后执行。

如果用户持续高频操作，最后一次操作结束后，`fn` 也会被执行一次（由定时器触发）。
