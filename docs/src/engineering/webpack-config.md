# 结构化理解 Webpack 配置项

Webpack 原生提供了上百种配置项，这些配置项分别作用于打包流程的不同阶段，可以从流程和结构的角度对其进行系统性梳理和理解。

Webpack 的打包过程虽然复杂，但大致可以简化为以下几个阶段：

- **输入**：从文件系统读取代码文件；
- **模块递归处理**：通过 Loader 转译模块内容，并将结果转换为 AST，分析模块依赖关系，递归处理所有依赖文件，直到全部处理完毕；
- **后处理**：所有模块递归处理完成后，执行模块合并、运行时代码注入、产物优化等操作，最终输出 Chunk 集合；
- **输出**：将 Chunk 写入外部文件系统；

从上述流程来看，Webpack 配置项大致可分为两类：

- **流程类**：作用于打包流程某一或多个环节，直接影响编译打包效果的配置项；
- **工具类**：为主流程之外的工程化需求提供支持的配置项。

## 流程类配置项

与打包流程紧密相关的配置项包括：

### 输入输出相关

- `entry`：定义项目入口文件，Webpack 会从这些入口文件开始分析项目依赖；
- `context`：指定项目的执行上下文路径；
- `output`：配置产物的输出路径、文件名等；

### 模块处理相关

- `resolve`：配置模块路径解析规则，帮助 Webpack 更高效地定位模块；
- `module`：配置模块加载规则，例如针对不同类型资源使用相应的 Loader 进行处理；
- `externals`：声明外部资源，Webpack 会跳过这些资源的解析与打包；

### 后处理相关

- `mode`：指定编译模式（如 development、production），影响内置优化策略；
- `optimization`：控制产物包体积优化，如 Dead Code Elimination、Scope Hoisting、代码混淆与压缩等；
- `target`：配置编译产物的目标运行环境（如 web、node、electron），不同环境下产物结构会有所差异；

Webpack 首先根据输入配置（`entry`、`context`）定位项目入口文件，随后依据模块处理相关配置（`module`、`resolve`、`externals` 等）逐一处理模块文件，包括转译和依赖分析。所有模块处理完毕后，再根据后处理配置（如 `optimization`、`target` 等）进行资源合并、运行时注入和产物优化。

## 工具类配置项

除了核心打包功能外，Webpack 还提供了多种提升研发效率的工具配置，主要包括：

### 开发效率相关

- `watch`：配置文件变更监听，实现持续构建；
- `devtool`：配置产物 SourceMap 生成规则，便于调试；
- `devServer`：配置开发服务器及热模块替换（HMR）等功能；

### 性能优化相关

- `cache`：Webpack 5 及以上用于控制编译过程和结果的缓存策略；
- `performance`：配置产物体积超出阈值时的提示策略；

### 日志相关

- `stats`：精细控制编译过程日志内容，便于性能调优和问题排查；
- `infrastructureLogging`：配置日志输出方式，如输出到磁盘文件等；

## Easy Demo

构造一个简单示例，了解设计一个 Webpack 配置的过程，示例文件结构

```txt
.
├── src
|   └── index.js
└── webpack.config.js
```

其中，`src/index.js` 为项目入口文件，`webpack.config.js` 为 Webpack 配置文件。在配置文件中，首先声明项目入口：

```js
// webpack.config.js
module.exports = {
  entry: "./src/index",
}
```

接着声明产物输入路径

```js
// webpack.config.js
const path = require("path")

module.exports = {
  entry: "./src/index",
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./dist"),
  },
}
```

至此，已经足够驱动一个最简单项目的编译工作。但是，在前端项目中经常需要处理 JS 之外的其它资源，包括 css、ts、图片等，此时需要为这些资源配置适当的加载器：

```js
// webpack.config.js
const path = require("path")

module.exports = {
  entry: "./src/index",
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./dist"),
  },
  module: {
    rules: [
      {
        test: /\.less$/i,
        include: {
          and: [path.join(__dirname, "./src/")],
        },
        use: [
          "style-loader",
          "css-loader",
          // "./loader",
          {
            loader: "less-loader",
          },
        ],
      },
    ],
  },
}
```

到这里已经是一个简单但足够完备的配置结构了，接下来还可以根据需要使用其它工程化工具，例如使用 `devtool` 生成 Sourcemap 文件；使用 `watch` 持续监听文件变化并随之重新构建。

更多配置可以看看我写的 [Webpack Demo](https://github.com/dahu0422/my-demo/tree/main/webpack/demos)

## Webpack 配置结构类型

Webpack 的配置方式非常灵活，能够适应多种项目需求。除了最常见的单一对象导出外，还支持数组和函数等多种结构，便于在不同环境、不同构建目标下灵活切换和扩展配置。

### 单文件对象

最常见的配置方式是直接导出一个配置对象。这种方式适用于大多数简单或中等复杂度的项目。

```js
// webpack.config.js
module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  // ...其它配置
}
```

**适用场景**：单一构建目标、环境简单、无需动态生成配置。

### 配置数组

当需要同时构建多个不同目标（如多页面应用、同时输出 Node 和 Web 版本等）时，可以导出一个配置对象数组，Webpack 会分别执行每一项配置。

```js
// webpack.config.js
module.exports = [
  {
    entry: "./src/index.js",
    output: {
      filename: "web.js",
      path: path.resolve(__dirname, "dist"),
    },
    target: "web",
  },
  {
    entry: "./src/index.js",
    output: {
      filename: "node.js",
      path: path.resolve(__dirname, "dist"),
    },
    target: "node",
  },
]
```

**适用场景**：需要同时生成多个构建产物，或针对不同平台/环境输出不同配置。

### 配置函数

如果配置需要根据环境变量、命令行参数等动态生成，可以导出一个函数。Webpack 会在执行时调用该函数，并传入环境参数。

```js
// webpack.config.js
module.exports = (env, argv) => {
  return {
    entry: "./src/index.js",
    mode: argv.mode === "production" ? "production" : "development",
    // ...其它配置
  }
}
```

**适用场景**：需要根据不同环境、命令行参数动态调整配置内容。
