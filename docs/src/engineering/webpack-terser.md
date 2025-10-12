# Terser

## 代码压缩原理

代码压缩的原理在于通过删除不必要的字符、简化代码结构来减少代码体积，同时保持代码的功能和逻辑不变。具体来说，代码压缩通常包括以下几个方面：

1. **删除空白字符和注释**：去除代码中的空格、换行符和注释，这些字符对代码的执行没有影响，但会增加文件大小。

2. **变量名压缩**：将变量名、函数名等标识符替换为更短的名称，以减少字符数。例如，将 `variableName` 替换为 `a`。

3. **代码合并**：将多行代码合并为一行，减少换行符的使用。

4. **常量折叠**：将可以在编译时确定的常量表达式直接计算并替换为结果。例如，将 `2 + 2` 替换为 `4`。

5. **死代码消除**：移除代码中永远不会执行的部分，例如条件恒为假的分支。

6. **函数内联**：将小的函数调用直接替换为函数体，以减少函数调用的开销。

通过这些技术，代码压缩工具能够显著减少 JavaScript、CSS 和 HTML 文件的大小，从而提高网页加载速度和性能。

## 使用 TerserWebpackPlugin 压缩 JS

Terser 是一个广泛使用的 JavaScript 代码压缩工具，支持 Dead-Code Eliminate、删除注释、删除空格、代码合并、变量名简化等一些列操作。他的前身是 UglifyJS，在 UglifyJS 基础上增加了 ES6 语法支持，并重构代码解析、压缩算法，使得执行效率与压缩效率都有较大提升。

在 Webpack5.0 后默认使用 Terser 作为 JavaScript 代码压缩器。只需要通过 `optimization.minimize` 配置项即可开启：

```js
module.exports = {
  // ...
  optimization: {
    minimize: true,
  },
}
```

使用 `mode = production` 启动生产模式构建时默认也会开启 Terser 压缩。

Terser 支持许多压缩配置：

- `dead_code`：是否删除不可抵达的代码（死代码）
- `booleans_as_integers`：是否将 Boolean 值字面量转换为 0、1
- `join_vars`：是否合并连续的变量声明，如 `var = 1; var b = 2` 合并为 `var a=1,b=2`

多数情况使用默认 Terser 配置即可，必要时也可以通过手动创建 `terser-webpack-plugin` 配置。

```js
const TerserPlugin = require("terser-webpack-plugin")

module.export = {
  // ...
  minimize: true, // 控制是否开启压缩
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        reduce_vars: true,
        pure_func: ["console.log"],
      },
    }),
  ],
}
```

`terser-webpack-plugin` 常用配置项：

- `test` 只有命中该配置的产物路径才会执行压缩；
- `include` 在该范围内的产物才会执行压缩；
- `exclude` 与 `include` 相反，不在该范围内的产物才会执行压缩
- `paralle` 是否启动并行压缩，默认为 `true`，会按 `os.cpus().length - 1` 启动若干进程并行执行
- `minify` 用于配置压缩器，支持传入自定义压缩函数，也支持 `swc/esbuild/uglifyjs` 等值
- `terserOptions`：传入 `minify` —— “压缩器”函数的配置参数；
- `extractComments`：是否将代码中的备注抽取为单独文件，可配合特殊备注如 `@license` 使用。

下面通过两个示例来说明

1. 通过 `test/include/exclude` 过滤插件的执行范围，这个功能配合 `minimizer` 的数组特性，可以实现针对不同产物执行不同的压缩策略，例如：

```js
const TerserPlugin = require("terser-webpack-plugin")

module.exports = {
  entry: { foo: "./src/foo.js", bar: "./src/bar.js" },
  output: {
    filename: "[name].js",
    // ...
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /foo\.js$/i,
        extractComments: "all",
      }),
      new TerserPlugin({
        test: /bar\.js/,
        extractComments: false,
      }),
    ],
  },
}
```

示例中，针对 `foo.js` 产物文件会执行 `exctractComments` 逻辑，将备注信息抽取为单独文件；而针对 `bar.js`，由于 `extractComments = false`，不单独抽取备注内容。

2. terser-webpack-plugin 插件并不只是 Terser 的简单包装，它更像一个代码压缩功能骨架，底层支持使用 SWC、UglifyJS、ESBuild 作为压缩器，使用时只需要通过 `minify` 参数切换即可，例如：

```js
module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        // `terserOptions` 将被传递到 `swc` (`@swc/core`) 工具
        // 具体配置参数可参考：https://swc.rs/docs/config-js-minify
        terserOptions: {},
      }),
    ],
  },
}
```

TerserPlugin 内置如下压缩器：

- `TerserPlugin.terserMinify`：依赖于 `terser` 库；
- `TerserPlugin.uglifyJsMinify`：依赖于 `uglify-js`，需要手动安装 `yarn add -D uglify-js`；
- `TerserPlugin.swcMinify`：依赖于 `@swc/core`，需要手动安装 `yarn add -D` `@swc/core`；
- `TerserPlugin.esbuildMinify`：依赖于 `esbuild`，需要手动安装 `yarn add -D esbuild`。

另外，`terserOptions` 配置也不仅仅专供 `terser` 使用，而是会透传给具体的 `minifier`，因此使用不同压缩器时支持的配置选项也会不同。

## 使用 CssMinimizerWebpackPlugin 压缩 CSS

## 使用 HtmlMinifierTerser 压缩 HTML
