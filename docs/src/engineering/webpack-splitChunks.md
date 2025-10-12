# SplitChunks

## Chunk 是什么？

在 Webpack 中，**Chunk** 是打包过程中生成的代码块，是一组被打包在一起的模块集合。Webpack 会根据入口（entry）、异步加载（如 import()）、以及分包策略，自动将代码拆分成不同的 Chunk，最终输出为一个或多个 JS 文件。

Chunk 的类型主要有：

- **Initial Chunk**：入口模块及其依赖打包成的 Chunk。
- **Async Chunk**：通过异步方式（如 import()）引入的模块及其依赖组成的 Chunk。
- **Runtime Chunk**：Webpack 运行时代码单独抽离出来的 Chunk（可选配置）。

合理的 Chunk 拆分可以避免重复打包，提高缓存利用率；降低主包体积，加快首屏加载速度；支持异步加载，提升页面响应能力。

## SplitChunks 作用

`SplitChunks` 主要用来自动拆分代码，把重复或体积大的模块单独打包，减少主包体积、提升加载效率。常见的两类配置：

- **分包条件**：如 `minChunks`、`minSize`、`maxInitialRequest` 等，满足这些条件的模块会被单独打包。
- **缓存组（cacheGroups）**：为不同类型的资源设置专属的分包规则。

## 设置分包范围

默认情况下，SplitChunks 只对异步（Async）Chunk 生效。可以通过 `splitChunks.chunks` 配置调整分包范围：

- `'all'`：对同步（Initial）和异步（Async）Chunk 都生效，推荐使用。
- `'initial'`：只对同步 Chunk 生效。
- `'async'`：只对异步 Chunk 生效。
- `(chunk) => boolean`：自定义函数，返回 true 时生效。

**示例：**

```js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: "all", // 推荐
    },
  },
}
```

## 根据 Module 使用频率分包

通过 `splitChunks.minChunks` 可以设置模块被引用次数，只有被多个 Chunk 引用的模块才会被单独分包，减少重复打包。

**示例：**

```js
module.exports = {
  optimization: {
    splitChunks: {
      minChunks: 2, // 被2个及以上Chunk引用才分包
    },
  },
}
```

> 注意：这里的"引用次数"指被不同 Chunk（入口或异步）引用的次数。

## 限制分包数量

为防止分包过多导致请求数激增，可以用 `maxInitialRequests` 和 `maxAsyncRequests` 限制并行请求数：

- `maxInitialRequests`：入口 Chunk 的最大并行请求数。
- `maxAsyncRequests`：异步 Chunk 的最大并行请求数。

**示例：**

```js
module.exports = {
  optimization: {
    splitChunks: {
      maxInitialRequests: 4, // 入口最大4个并行请求
      maxAsyncRequests: 6, // 异步最大6个并行请求
    },
  },
}
```

> Webpack 会优先保留体积较大的分包，超出数量限制的小包会被合并回主包。

## 限制分包体积

通过 `minSize`、`maxSize` 等参数，可以控制分包的最小和最大体积，避免包太小碎片化或太大影响加载。

- `minSize`：小于该值的 Chunk 不会被单独分包。
- `maxSize`：大于该值的 Chunk 会尝试进一步拆分。
- `maxAsyncSize`：只对异步 Chunk 生效的最大体积。
- `maxInitialSize`：只对入口 Chunk 生效的最大体积。
- `enforceSizeThreshold`：超过该值强制分包。

**示例：**

```js
module.exports = {
  optimization: {
    splitChunks: {
      minSize: 20000, // 20kb
      maxSize: 300000, // 300kb
      maxAsyncSize: 200000, // 200kb
      maxInitialSize: 250000, // 250kb
      enforceSizeThreshold: 500000, // 500kb
    },
  },
}
```

> 合理设置体积阈值，可以让分包更贴合实际业务需求，提升缓存和加载效率。

## cacheGroups 用法

`cacheGroups` 可以为不同文件设置不同的拆包规则。比如，把第三方库和业务代码分开：

```js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          minChunks: 1,
          minSize: 0,
        },
      },
    },
  },
}
```

上面配置会把所有 `node_modules` 下的模块打包到 `vendors` 组，方便后续缓存和优化。

## Webpack 默认的 cacheGroups

Webpack 自带两个常用的 cacheGroups：

```js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: {
          idHint: "",
          reuseExistingChunk: true,
          minChunks: 2,
          priority: -20,
        },
        defaultVendors: {
          idHint: "vendors",
          reuseExistingChunk: true,
          test: /[\\/]node_modules[\\/]/i,
          priority: -10,
        },
      },
    },
  },
}
```

- `defaultVendors`：自动把所有 `node_modules` 下的依赖打包到 `vendors-xxx.js` 文件。
- `default`：把被多个 Chunk 引用（引用次数 ≥ 2）的模块单独打包，避免重复加载。

## 实战案例：单独拆包 element-ui 和 echarts

假设你的项目用 vue-cli 搭建，并引入了 element-ui 和 echarts。可以通过如下配置将它们单独拆包，提升缓存利用率和加载速度：

```js
// vue.config.js
module.exports = {
  configureWebpack: {
    optimization: {
      splitChunks: {
        cacheGroups: {
          elementUI: {
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
            name: "chunk-elementUI",
            priority: 20,
            chunks: "all",
          },
          echarts: {
            test: /[\\/]node_modules[\\/]echarts[\\/]/,
            name: "chunk-echarts",
            priority: 20,
            chunks: "all",
          },
          // 其他第三方库统一打包
          vendors: {
            test: /[\\/]node_modules[\/]/,
            name: "chunk-vendors",
            priority: 10,
            chunks: "all",
          },
        },
      },
    },
  },
}
```

**说明：**

- `elementUI` 和 `echarts` 分别单独打包，生成 `chunk-elementUI.js` 和 `chunk-echarts.js`。
- 只要这两个库没升级，用户就能一直用缓存。
- 业务代码变动时，只需重新加载业务相关 chunk。
- 其他第三方依赖仍然会被统一打包到 `chunk-vendors.js`。

这种做法非常适合生产环境，能显著提升加载速度和缓存利用率。

## 为什么要用 cacheGroups？

- **灵活分组**：可以针对不同类型的资源（如第三方库、业务组件）设置不同的打包策略。
- **提升缓存命中率**：第三方库变化少，单独打包后浏览器可以更好地缓存。
- **减少主包体积**：业务代码和依赖分离，主包更小，首屏加载更快。
