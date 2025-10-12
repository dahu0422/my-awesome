# 模块化规范

| 特性         |              ES Module               |         CommonJS         |
| ------------ | :----------------------------------: | :----------------------: |
| 加载时机     |      异步加载（编译时解析依赖）      |    同步加载（运行时）    |
| 动态性       |     静态 import（仅顶层作用域）      |    支持动态 require()    |
| this 指向    |           指向 `undefined`           |  指向当前模块的 exports  |
| 循环依赖     |           通过静态分析解决           | 部分支持（可能值未完成） |
| Node.js 支持 | 需 `.mjs` 后缀或者 `"type":"module"` |         原生支持         |
| 浏览器支持   |        原生支持（现代浏览器）        | 不直接支持（需打包工具） |
| Tree Shaking |         支持（利于打包优化）         |          不支持          |

## ES Module

ES Module 核心特点

- 静态分析：
  - 编译时确定以来关系：`import/export` 必须在模块的顶层作用域，使得打包工具 （如 Webpack、RollUp）可以在编译阶段分析依赖关系，实现 **TreeShaking**
  - 错误提前暴露：如果导入模块路径错误或不存在，会在代码运行前报错

```js
// ✅ 合法（顶层静态导入）
import { foo } from "./module.js"

// ❌ 不合法（不能动态导入）
if (condition) {
  import { bar } from "./module.js" // SyntaxError
}
```

- 异步加载
  - 浏览器中：ESM 默认异步加载，不会阻塞页面渲染，适合网络环境。
  - 支持动态导入：通过 import() 实现按需加载（返回 Promise），适用于代码分割。

```js
// 动态导入（按需加载）
const module = await import("./module.js")
```

- 严格模式：ESM 默认启用严格模式，无需手动声明

  - 变量必须声明
  - 禁止 `this` 指向全局对象

- 绑定导出：ESM 导出的是值的 动态绑定（类似引用传递），而非值的拷贝。如果模块内修改了导出的变量，外部导入的值会同步更新。

```js
// counter.js
export let count = 0
export function increment() {
  count++
}

// main.js
import { count, increment } from "./counter.js"
console.log(count) // 0
increment()
console.log(count) // 1 （CommonJS 中此处仍是 0）
```

- 支持循环依赖：ESM 通过静态分析和动态绑定，可以更好地处理模块间的循环引用\

```js
// a.js
import { b } from "./b.js"
export const a = "A"

// b.js
import { a } from "./a.js"
export const b = "B" // 正常执行
```

### Export 导出

#### 命名导出

```js
// 导出单个变量
export const name = "Alice"
export function greet() {
  return "Hello!"
}

const age = 30
const job = "Engineer"
export { age, job } // 导出多个变量

// 导出时重命名
export { age as userAge, job as profession }
```

#### 默认导出

一个模块只能有一个 `default` 导出

```js
const user = { name: 'Alice', age: 30 };
export default user; // 默认导出对象

export default function() { return 'Default!'; }
```

#### 重新导出

用于在一个文件中集中导出其它模块的默认导出，并可以重命名这些导出，常见于项目入口文件.

```js
export { name } from "./module1.js"
// 从 module1.js 中导入其命名导出 name 然后在当前模块中重新导出 name

export { default as age } from "./module2.js"
// 从 module2.js 中导入其默认导出 default 然后以命名导出的形式重新暴露出去，并重命名为 age
```

#### 仅加载模块（不导入）

```js
import "./init.js" // 用于执行初始化逻辑
```

### Import 导入

#### 命名导入

```js
// 按名称导入
import { name, greet } from "./module.js"
console.log(name) // 'Alice'
greet() // 'Hello!'

// 导入时重命名
import { name as userName, greet as sayHello } from "./module.js"
```

#### 默认导入

```js
import user from "./module.js" // 名称可自定义
console.log(user.name) // 'Alice'
```

#### 混合导入

```js
import user, { name, greet } from "./module.js"
```

#### 全部导入

```js
import * as utils from "./module.js"
console.log(utils.name) // 'Alice'
utils.greet() // 'Hello!'
```

#### 动态导入

返回 Promise

```js
import("./module.js").then((module) => {
  console.log(module.name) // 'Alice'
})

// 或使用 async/await
const module = await import("./module.js")
```

### 使用 ESModule

#### 浏览器中

```html
<script type="module">
  import { greet } from "./module.js"
  greet() // 'Hello!'
</script>
```

#### NodeJS 中

```js
// 方法1：使用 .mjs 文件扩展名
// 方法2：在 package.json 中配置
{
  "type": "module" // 所有 .js 文件视为 ESM
}
```

## CommonJS

CommonJS 核心特点

- 同步加载

  - 适用于 Node.js（磁盘读取快），但 不适合浏览器（网络请求是异步的）。
  - 模块在第一次 require() 时加载并缓存，后续调用直接返回缓存结果。

- 运行时解析依赖，模块路径可以是动态的

```js
const moduleName = condition ? "moduleA" : "moduleB"
const module = require(`./${moduleName}.js`) // ✅ 允许动态路径
```

- 不支持循环依赖：由于同步加载 + 缓存机制，循环依赖可能导致未完成导出的对象

```js
// a.js
exports.a = 1;
const b = require('./b.js');
console.log(b.b); // 2
exports.a = 3;

// b.js
exports.b = 2;
const a = require('./a.js');
console.log(a.a); // 1（此时 a.js 的 exports.a 还未更新为 3）
exports.b = 4;

运行结果：1、2
```

### 导出

#### module.export 默认导出

```js
// math.js
function add(a, b) {
  return a + b
}

module.exports = add // 导出单个函数

// 外部引入
const add = require("./math.js")
console.log(add(2, 3)) // 5
```

#### exports 命名导出

```js
// utils.js
exports.add = (a, b) => a + b
exports.PI = 3.14

// 外部引入
const { add, PI } = require("./utils.js")
console.log(add(2, 3)) // 5
```

:::warning
`module.exports` 和 `exports` 不能混用，如果直接覆盖 `exports` 会导致报错

```js
exports = { add: () => {} } // ❌ 无效导出
module.exports = { add: () => {} } // ✅ 正确
```

:::

### 导入

使用 `require()` 同步加载模块

```js
const fs = require("fs") // 引入 Node.js 内置模块
const lodash = require("lodash") // 引入 npm 包
const myModule = require("./my-module.js") // 引入本地模块
```
