# 函数式编程

函数式编程（Functional Programming，FP）是一种**编程范式**，它将计算视为函数求值，并避免使用状态和可变数据。其核心思想是"**函数是一等公民**"，强调用**纯函数**（Pure Function）和**不可变数据**（Immutability）来构建程序。

主要特点：

- 纯函数：相同的输入必定产生相同的输出，没有副作用（不修改外部状态）；
- 不可变性：数据一旦创建就不能被更改，所有修改都返回新数据；
- 高阶函数：函数可以作为参数传递，也可作为返回值；
- 函数组合：可以将多个小函数组合成复杂的操作；
- 声明式编程：更关注"做什么"而不是"怎么做"

## 纯函数

纯函数是指在相同的输入下，总是**返回相同的输出**，并且**不会产生任何副作用**（如修改外部变量、输出日期、操作 DOM、请求网络等）

### 纯函数

```js
function add(a, b) {
  return a + b
}
```

输入相同，输出永远相同。没有修改外部变量，也没有其他副作用。

### 非纯函数

```js
let count = 0
function increment() {
  count++
  return count
}
```

输出依赖外部变量 count，每次调用结果不同。修改了外部变量 count，有副作用

### 带副作用的非纯函数

```js
function logMessage(message) {
  console.log(message)
  return message
}
```

虽然返回值和输入一致，但调用了 console.log，产生了副作用（输出到控制台）。

## 副作用

副作用是指**函数在执行过程中除了返回结果之外，还对外部环境产生了影响**，或者依赖了外部环境的状态。简单来说，副作用就是函数除了计算结果以外，做了"额外的事情"。

### 常见的副作用

- 修改全局变量或外部变量
- 修改函数参数（对象或数组等引用类型）
- I/O 操作（如读写文件、网络请求、操作数据库）
- 操作 DOM（如修改页面内容）
- 输出日志 `console.log()`
- 获取当前时间、随机数等（依赖外部状态）

```js
// 有副作用：修改了外部变量
let total = 0
function addToTotal(num) {
  total += num
}

// 有副作用：操作了 DOM
function setTitle(title) {
  document.title = title
}

// 有副作用：输出日志
function logMessage(msg) {
  console.log(msg)
}
```

### 如何避免副作用

1. 使用纯函数：只依赖输入参数，不依赖外部状态。不修改外部变量，只返回新值；
2. 数据不可变：不直接修改对象或数组，而是返回新的对象或数组；
3. 将副作用集中管理：必须有副作用时，将副作用集中在程序的边界（如 React 的 useEffect、Redux 的 middleware），核心逻辑保持纯净。
4. 依赖注入：通过参数传递依赖，而不是在函数内部直接访问全局变量。

```js
// 纯函数：无副作用
function add(a, b) {
  return a + b
}

// 不修改原数组，返回新数组
function addItem(arr, item) {
  return [...arr, item]
}
```

## 高阶函数

高阶函数是指至少满足以下任意一个条件的函数：

- **接收一个或多个函数作为参数**
- **返回一个函数作为结果**

### 常见的高阶函数

#### 接收函数作为参数

```js
// Array.prototype.map 就是高阶函数
const arr = [1, 2, 3]
const doubled = arr.map(function (x) {
  return x * 2
})
// doubled: [2, 4, 6]
```

`map` 接收一个函数作为参数，对数组每一项进行处理。

### 返回一个函数

```js
function makeAdder(x) {
  return function (y) {
    return x + y
  }
}

const add5 = makeAdder(5)
console.log(add5(10)) // 输出 15
```

`makeAdder` 返回一个新的函数，这个新函数可以记住 x 的值

### 既接收函数作为参数，也返回函数

```js
function withLogging(fn) {
  return function (...args) {
    console.log("调用前", args)
    const result = fn(...args)
    console.log("调用后", result)
    return result
  }
}

function sum(a, b) {
  return a + b
}

const loggedSum = withLogging(sum)
loggedSum(1, 2) // 控制台会输出调用前和调用后信息
```

## 柯里化

柯里化是一种将**接受多个参数的函数，转换为一些列只接受一个参数的函数**的技术。

换句话说，柯里化后的函数每次只接收一个参数，并返回一个新函数，直到所有参数都被传递后，才执行最终的计算。

### 柯里化的好处

- **参数复用**：可以提前传递部分参数，生成新的函数。
- **延迟执行**：可以等到需要时再传递剩余参数。
- **函数组合**：更容易与高阶函数结合使用。

### Easy Demo

```js
// 普通函数
function add(a, b, c) {
  return a + b + c
}
add(1, 2, 3) // 6

// 柯里化后的函数
function add(a) {
  return function (b) {
    return function (c) {
      return a + b + c
    }
  }
}
add(1)(2)(3) // 6
```

### 通用柯里化实现

```js
function curry(fn) {
  // 返回一个新的函数 curried，可以接收任意数量的参数
  return function curried(...args) {
    // 如果当前接收到的参数数量 >= 原函数的参数个数
    if (args.length >= fn.length) {
      // 直接用所有参数调用原函数，返回结果
      return fn.apply(this, args)
    } else {
      // 否则，返回一个新函数，继续收集参数
      return function (...nextArgs) {
        // 把之前收集的参数和新参数合并，再次调用 curried
        return curried.apply(this, args.concat(nextArgs))
      }
    }
  }
}

// 用法
function sum(a, b, c) {
  return a + b + c
}
const curriedSum = curry(sum)

curriedSum(1)(2)(3) // 6
curriedSum(1, 2)(3) // 6
curriedSum(1)(2, 3) // 6
```

### 柯里化使用场景

#### 日志工具

```js
function log(type, message) {
  console.log(`[${type}] ${message}`)
}

const logInfo = log.bind(null, "INFO")
const logError = log.bind(null, "ERROR")

logInfo("系统启动") // [INFO] 系统启动
logError("出错了") // [ERROR] 出错了

// 用柯里化实现
function curryLog(type) {
  return function (message) {
    console.log(`[${type}] ${message}`)
  }
}
const logInfo = curryLog("INFO")
logInfo("系统启动")
```

#### 与高阶函数结合，提升代码复用性

```js
const match = curry((reg, str) => reg.test(str))
const hasNumber = match(/\d+/)

console.log(hasNumber("abc123")) // true
console.log(hasNumber("abc")) // false

// 用于数组过滤
const arr = ["abc", "123", "a1b2"]
const filterNumber = arr.filter(hasNumber) // ['123', 'a1b2']
```

## 函数组合

将多个函数合并成一个函数，前一个函数的输出作为后一个函数的输入。`f(g(x))` 即先执行 `g`，再执行 `f`。

### compose 和 pipe

- `compose` 从**右到左**执行函, `compose(f, g, h)(x)` 等价于 `f(g(h(x)))`
- `pipe` 从**左到右**执行函数，`pipe(f, g, h)(x)` 等价于 `h(g(f(x))`

### 实现 compose

```js
// compose: 从右到左组合函数
function compose(...fns) {
  return function (initialValue) {
    return fns.reduceRight((acc, fn) => fn(acc), initialValue)
  }
}

// 示例
const add1 = (x) => x + 1
const double = (x) => x * 2

const add1ThenDouble = compose(double, add1) // double(add1(x))
console.log(add1ThenDouble(3)) // 8
```

### 实现 pipe

```js
// pipe: 从左到右组合函数
function pipe(...fns) {
  return function (initialValue) {
    return fns.reduce((acc, fn) => fn(acc), initialValue)
  }
}

// 示例
const add1 = (x) => x + 1
const double = (x) => x * 2

const doubleThenAdd1 = pipe(double, add1) // add1(double(x))
console.log(doubleThenAdd1(3)) // 7
```

## React 框架中的函数式编程应用

### 纯函数组件

```js
function Hello(props) {
  return <div>Hello, {props.name}</div>
}
// 相同的 props，总是返回相同的 UI，没有副作用
```

### 不可变数据

```js
const [list, setList] = useState([1, 2, 3])
// 添加元素时，返回新数组，不直接修改原数组
setList([...list, 4])
```
