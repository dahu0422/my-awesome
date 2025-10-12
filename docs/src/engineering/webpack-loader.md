# Loader

Webpack 默认只能理解 JavaScript 和 JSON 文件。

**Loader** 机制使其能够处理其他类型的资源文件。Loader 主要用于对模块源代码进行转换，

当 Webpack 遇到 `import/require` 语句时，会根据配置的 loader 对文件内容进行相应处理。

## Babel Loader

ECMAScript 6.0（简称 ES6）引入了大量提升开发效率的新特性，如 `class` 关键字、块级作用域、ES Module 方案等，但当前浏览器和 Node 等 JavaScript 引擎对这些特性的支持并不完全。为解决兼容性问题，现代 Web 开发流程通常会引入 Babel 等转译工具。

Babel 是一款开源 JavaScript 转编译器，能够将高版本代码转译为低版本代码，从而保证在旧版 JavaScript 引擎中正常运行。例如：

```js
// 转译前
arr.map((item) => item + 1)
// 转译后
arr.map(function (item) {
  return item + 1
})
```

Babel 的在线 REPL 可在 [babeljs.io/repl](https://babeljs.io/repl) 体验。

**Webpack 集成 Babel 步骤如下：**

1. 安装依赖

```bash
npm install -D @babel/core @babel/preset-env babel-loader
```

2. 配置 Webpack

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
      },
    ],
  },
}
```

3. 执行编译

```
npx webpack
```

Babel 配置可通过 `.babelrc` 文件或 `rule.options` 属性实现：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
    ],
  },
}
```

- `@babel/preset-env`：智能预设，自动决定转换哪些新语法。
- `@babel/core`：负责代码解析、转换和生成。
- `babel-loader`：让 Webpack 在打包时调用 Babel。

**工作流程：** Webpack → babel-loader → @babel/core → @babel/preset-env → 转换后的代码

## TS Loader

Webpack 支持多种 TypeScript 集成方式，常用 `ts-loader` 进行 TypeScript 代码的构建。

1. 安装依赖

```bash
npm i -D typescript ts-loader
```

2. 配置 Webpack

```js
const path = require("path")

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
}
```

- `module.rules` 声明对所有 `.ts` 结尾的文件应用 `ts-loader`。
- `resolve.extensions` 声明自动解析 `.ts` 后缀文件，便于省略后缀。

3. 创建 `tsconfig.json` 配置文件

```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "moduleResolution": "node"
  }
}
```

4. 执行编译

```
npx webpack
```

## ESLint Loader

通过 `eslint-webpack-plugin` 可集成 ESLint 代码检查工具。

1. 安装依赖

```bash
npm i -D eslint eslint-webpack-plugin
npm i -D eslint-config-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node
```

2. 添加 `.eslintrc` 配置

```json
{
  "extends": "standard"
}
```

3. 配置 Webpack

```js
const path = require("path")
const ESLintPlugin = require("eslint-webpack-plugin")

module.exports = {
  entry: "./src/index",
  mode: "development",
  devtool: false,
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [new ESLintPlugin()],
}
```

4. 执行编译

```
npx webpack
```

## CSS Loader

Webpack 默认无法识别 CSS 语法，需借助 Loader 处理：

- `css-loader`：将 CSS 转译为 JS 字符串，便于 Webpack 解析依赖。
- `style-loader`：将 CSS 注入页面 `<style>` 标签。
- `mini-css-extract-plugin`：将 CSS 抽离为独立文件，通过 `<link>` 标签引入。

**开发环境：** 采用 `style-loader` + `css-loader`，样式注入 `<style>` 标签。

**生产环境：** 采用 `mini-css-extract-plugin` + `css-loader`，样式抽离为独立文件。

**配置示例：**

```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HTMLWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV === "development"
            ? "style-loader"
            : MiniCssExtractPlugin.loader,
          "css-loader",
        ],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin(), new HTMLWebpackPlugin()],
}
```

- `mini-css-extract-plugin` 需与 `html-webpack-plugin` 配合使用，确保 CSS 文件被正确引入 HTML。
- `mini-css-extract-plugin` 与 `style-loader` 不能混用，需根据环境变量切换。

## 预处理器 Loader

常见 CSS 预处理器有 Less、Sass、Stylus。以 Less 为例：

1. 安装依赖

```bash
yarn add -D less less-loader
```

2. 配置 Webpack

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
}
```

- `less-loader` 用于将 Less 代码转换为 CSS。
- `css-loader` 和 `style-loader` 负责后续处理和注入。

Sass、Stylus 配置方式类似。

| 预处理器 | 安装依赖                           | Webpack 配置                                                               |
| -------- | ---------------------------------- | -------------------------------------------------------------------------- |
| Less     | `yarn add -D less less-loader`     | `test: /\.less$/`，`use: ["style-loader", "css-loader", "less-loader"]`    |
| Sass     | `yarn add -D sass sass-loader`     | `test: /\.s[ac]ss$/`，`use: ["style-loader", "css-loader", "sass-loader"]` |
| Stylus   | `yarn add -D stylus stylus-loader` | `test: /\.styl$/`，`use: ["style-loader", "css-loader", "stylus-loader"]`  |

## PostCSS Loader

PostCSS 通过插件增强 CSS 能力。与预处理器不同，PostCSS 不定义新语言，而是通过插件处理 AST。

1. 安装依赖

```bash
yarn add -D postcss postcss-loader autoprefixer
```

2. 配置 Webpack

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                // 插件自动添加浏览器前缀
                plugins: [require("autoprefixer")],
              },
            },
          },
        ],
      },
    ],
  },
}
```

也可将 PostCSS 配置抽离到 `postcss.config.js`：

```js
module.exports = {
  plugins: [require("autoprefixer")],
}
```

## 预处理器与 PostCSS 组合

预处理器与 PostCSS 可组合使用，既能复用预处理语法特性，又能应用 PostCSS 丰富的插件能力。

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
          "postcss-loader",
          "less-loader",
        ],
      },
    ],
  },
}
```

## 常用 PostCSS 插件

- `autoprefixer`：自动添加浏览器前缀
- `postcss-preset-env`：转译最新 CSS 特性
- `postcss-less`、`postcss-sass`、`poststylus`：兼容各类预处理器语法
- `stylelint`：CSS 代码风格检查

通过合理配置 Loader，Webpack 能够高效处理各类资源文件，提升前端工程化能力。
