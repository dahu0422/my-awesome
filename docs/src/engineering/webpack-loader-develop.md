# Loader 开发

## Loader 简单示例

Webpack 进入构建阶段后，首先会通过 IO 接口读取文件内容，之后调用[Loader Runner](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwebpack%2Floader-runner) 将文件内容以 `source` 参数形式传递到 Loader 数组，`source` 数据在 Loader 数组内可能经过若干次形态转换，最终以标准 JavaScript 代码提交给 Webpack 主流程。

Loader 本质上是一个函数，接收三个参数分别为：

```js
module.exports = function (source, sourceMap?, data?) {
  return source
}
```

- `source`：接收到的**原始资源文件**的内容；
- `sourceMap`: 前一个 loader 传递下来的 source map 信息，便于生成调试用的源码映射；
- `data`: 附加的元数据；

接下来编写一个简单 Loader Demo，功能就是在原来的 `source` 上拼接一些文本，核心代码如下：

```js title="src/index.jsx"
import { validate } from "schema-utils"
import schema from "./options.json"

export default function loader(source) {
  const { version, webpack } = this
  const options = this.getOptions() // 读取 Loader 配置对象

  validate(schema, options, "Loader") // 接口校验 Loader 是否符合预期配置

  const newSource = `
  /**
   * Loader API Version: ${version}
   * Is this in "webpack mode": ${webpack}
   */
  /**
   * Original Source From Loader
   */
  ${source}`

  return newSource
}
```

之后修改 `webpack.config.js` 在 `resolveLoader.modules` 配置指向到 Loader 所在目录

```js
module.exports = {
  resolveLoader: {
    alias: {
      "custome-loader": path.join(__dirname, "./src/custome-loader/index.js"),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "custome-loader",
            options: { name: true },
          },
          // ....
        ],
      },
    ],
  },
}
```

## Loader Context

Loader Context 是 Webpack 注入的上下文对象，包含 Loader 运行时常用的属性和方法：

- `callback` 回调返回结果
- `async` 声明异步 Loader
- `emitFile ` 产生一个文件
- `addDependency ` 添加一个文件作为产生 loader 结果的依赖，使它们的任何变化可以被监听到。
- `getLogger` 记录信息，信息将以日志的格式打印
- `emitError ` emit 一个错误，可以在输入中显示。不会中断当前模块的编译过程。

## 在 Loader 返回多个结果

简单的 Loader 可直接 `return` 语句返回处理结果，复杂场景还可以通过 `callback` 接口返回更多信息，供下游 Loader 或者 Webpack 本身使用，例如在 [webpack-contrib/eslint-loader](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwebpack-contrib%2Feslint-loader) 中：

```js
export default function loader(content, map) {
  // ...
  linter.printOutput(linter.lint(content))
  this.callback(null, content, map)
}
```

通过 `this.callback(null, content, map)` 语句，同时返回转译后的内容与 sourcemap 内容。`callback` 的完整签名如下：

```js
this.callback(
    // 异常信息，Loader 正常运行时传递 null 值即可
    err: Error | null,
    // 转译结果
    content: string | Buffer,
    // 源码的 sourcemap 信息
    sourceMap?: SourceMap,
    // 任意需要在 Loader 间传递的值
    // 经常用来传递 ast 对象，避免重复解析
    data?: any
);
```

## 在 Loader 返回异步结果

涉及到异步或 CPU 密集操作时，Loader 中还可以以异步形式返回处理结果，例如 [webpack-contrib/less-loader](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fwebpack-contrib%2Fless-loader) 的核心逻辑：

```js
import less from "less"

async function lessLoader(source) {
  // 1. 获取异步回调函数
  const callback = this.async()
  // ...

  let result

  try {
    // 2. 调用less 将模块内容转译为 css
    result = await (options.implementation || less).render(data, lessOptions)
  } catch (error) {
    // ...
  }

  const { css, imports } = result

  // ...

  // 3. 转译结束，返回结果
  callback(null, css, map)
}

export default lessLoader
```

在 less-loader 中，包含三个重要逻辑：

- 调用 `this.async` 获取异步回调函数，此时 Webpack 会将该 Loader 标记为异步加载器，会挂起当前执行队列直到 `callback` 被触发；
- 调用 `less` 库将 less 资源转译为标准 css；
- 调用异步回调 `callback` 返回处理结果。

## 在 Loader 中直接写出文件

Loader Context 的 `emitFile` 接口可用于直接写出新的产物文件，例如在 `file-loader` 中：

```js
export default function loader(content) {
  const options = getOptions(this)

  validate(schema, options, { name: "File Loader", baseDataPath: "options" })
  // ...

  if (typeof options.emitFile === "undefined" || options.emitFile) {
    // ...
    this.emitFile(outputPath, content, null, assetInfo)
  }

  const esModule =
    typeof options.esModule !== "undefined" ? options.esModule : true

  return `${esModule ? "export default" : "module.exports ="} ${publicPath};`
}

export const raw = true
```

## 在 Loader 中添加额外依赖

Loader Context 的 `addDependency` 接口用于添加额外的文件依赖，当这些依赖发生变化时，也会触发重新构建，例如在 `less-loader` 中：

```js
try {
  result = await (options.implementation || less).render(data, lessOptions)
} catch (error) {
  // ...
}

const { css, imports } = result

imports.forEach((item) => {
  // ...
  this.addDependency(path.normalize(item))
})
```

在这段代码中，首先通过 `less` 库编译文件内容，然后遍历所有 `@import` 语句（即 `result.imports` 数组），并使用 `this.addDependency` 将被 import 的文件注册为依赖。这样一来，这些资源文件发生变化时会自动触发当前文件的重新编译。

为什么要这样处理？因为 `less` 工具会递归打包所有 Less 文件，例如在 `a.less` 中 `@import (less) './b.less'`，a、b 文件会被 less 一起打包。但这些依赖对 Webpack 是不可见的。如果不通过 `addDependency` 显式声明，后续 `b.less` 变更时不会触发 `a.less` 重新构建，达不到预期效果。

因此，`addDependency` 适用于 Webpack 无法自动感知的隐式依赖场景。比如 `less-loader`、`babel-loader` 等，后者会将 `.babelrc` 等配置文件添加为依赖，确保配置变更时能重新编译。

此外，Loader Context 还提供了以下依赖相关接口：

- `addContextDependency(directory: String)`：添加目录依赖，目录内容变更时会触发重编译；
- `addMissingDependency(file: String)`：添加文件依赖，作用类似 `addDependency`；
- `clearDependencies()`：清除所有依赖。

## 在 Loader 中正确处理日志

Webpack5 内置了一套 [infrastructureLogging](https://webpack.js.org/configuration/infrastructureLogging/) 接口，专门用来处理 Webpack 内部及第三方组件的日志需求。

```js
module.exports = function (source) {
  const logger = this.getLogger("my-loader")
  logger.info("开始处理文件")
  logger.warn("警告内容")
  logger.error("错误内容")
  return source
}
```

`getLogger` 返回的 logger 支持多种日志等级方法：

- `logger.debug(msg)`：调试信息
- `logger.info(msg)`：普通信息
- `logger.warn(msg)`：警告信息
- `logger.error(msg)`：错误信息

日志等级可以在 `webpack.config.js` 中通过 `infrastructureLogging.level` 配置。例如：

```js
module.exports = {
  // ...
  infrastructureLogging: {
    level: "info", // 可选：'none' | 'error' | 'warn' | 'info' | 'log' | 'verbose'
  },
}
```

**最佳实践：**

- 日志内容应简明扼要，便于定位问题。
- `info` 适合输出 Loader 关键流程节点，`warn` 用于非致命但需关注的问题，`error` 用于严重错误。
- 调试阶段可用 `debug` 输出详细信息，生产环境建议将日志等级调高，减少无关输出。
- 日志前缀建议带上 Loader 名称，便于区分来源。

## 在 Loader 中正确上报异常

Webpack Loader 中有多种上报异常信息的方式：

- 使用 `logger.error`：仅输出错误日志，不会打断编译流程。适用于仅需记录错误信息、但不影响构建流程的场景。日志输出受 Webpack 的 infrastructureLogging 配置控制，适合开发调试或非关键性错误提示。
- 使用 `this.emitError`：向 Webpack 报告错误，同样不会中断编译流程，但会在构建结果中以更显眼的方式提示错误。与 `logger.error` 不同，`emitError` 不受日志等级控制，适合需要用户重点关注但不希望中断构建的错误（如配置警告、非致命错误等）。
- 使用 `this.callback` 提交错误信息：通过 `this.callback(err)` 或直接 `throw`，会导致当前模块编译失败，阻止后续流程。适用于遇到致命错误、必须终止当前模块构建的场景（如语法解析失败、关键依赖缺失等）。
