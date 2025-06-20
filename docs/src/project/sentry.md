# Sentry 入门指南

Sentry 是一个开源的、跨平台的**应用监控平台**，专注于**错误跟踪**和**性能监控**。

它能够实时捕获、诊断并上报应用程序在生产环境中发生的错误和异常，帮助开发团队第一时间发现问题、定位问题根源并快速修复，从而提升产品质量和用户体验。

你可以把它看作是应用的"黑匣子"，当程序崩溃或出现性能瓶颈时，Sentry 会记录下详细的现场信息。

## Sentry 核心能力

Sentry 的能力远不止于简单的错误上报，它提供了一整套完善的解决方案：

- **错误监控 (Error Monitoring)**

  - 自动捕获前端、后端和移动端的未处理异常、运行时错误和 Promise 拒绝。
  - 智能地将相同错误聚合为一组，避免信息过载。

- **性能监控 (Performance Monitoring - APM)**

  - 跟踪页面加载时间（LCP, FCP）、API 请求耗时、路由切换性能等。
  - 通过分布式追踪连接前端到后端的完整调用链。

- **会话重放 (Session Replay)**

  - 像录屏一样记录用户在应用中的操作序列。当错误发生时，你可以回放用户的操作过程，直观地复现 Bug 场景。

- **丰富的上下文信息 (Context)**

  - 自动附加错误发生时的设备、操作系统、浏览器版本、用户 IP 等信息。
  - 支持自定义标签（Tags）和附加数据（Extra Data），让你能够根据业务场景（如用户 ID、订单号）来筛选和定位问题。

- **Source Maps 支持**

  - 能够将生产环境中经过压缩、混淆的代码的错误堆栈还原为开发时的源码位置，让你直接定位到出问题的具体代码行。

- **智能告警与通知 (Alerting & Notifications)**
  - 可自定义报警规则，例如"当某个错误在 1 小时内影响超过 100 个用户时发送通知"。
  - 支持邮件、Slack、钉钉、微信等多种通知渠道。

---

## 在 React 项目中集成 Sentry

在 React 项目中集成 Sentry 非常简单，主要分为以下几个步骤：

### 步骤 1: 安装 Sentry SDK

首先，为你的项目添加 Sentry 的 React SDK 依赖。

```bash
# 使用 npm
npm install --save @sentry/react

# 或者使用 yarn
yarn add @sentry/react
```

### 步骤 2: 在 Sentry 平台创建项目并获取 DSN

1.  登录 [Sentry.io](https://sentry.io) (或你的私有化部署地址)。
2.  创建一个新项目，并选择平台为 "React"。
3.  创建成功后，你会得到一个 **DSN (Data Source Name)**。这个 DSN 是连接你的应用和 Sentry 平台的唯一凭证。

### 步骤 3: 初始化 Sentry

在你的 React 应用入口文件（通常是 `src/index.js`, `src/index.tsx` 或 `src/app.tsx`）的顶部，添加 Sentry 的初始化代码。

```javascript
// src/app.tsx 或 src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import App from './App';

// 初始化 Sentry
Sentry.init({
  dsn: 'https://你的dsn@oXXXXXX.ingest.sentry.io/XXXXXXX', // 替换成你自己的 DSN

  // 启用性能监控
  integrations: [
    Sentry.browserTracingIntegration(),
    // 启用会话重放 (可选)
    Sentry.replayIntegration({
      // 隐私设置: 'mask' 屏蔽所有文本, 'unmask' 显示所有文本
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // 设置性能监控采样率 (生产环境建议使用 0.1 到 0.5 之间的值)
  tracesSampleRate: 1.0,

  // 设置会话重放采样率
  replaysSessionSampleRate: 0.1, // 录制 10% 的正常会话
  replaysOnErrorSampleRate: 1.0, // 发生错误时 100% 录制会话
});

// ... 你的应用渲染逻辑
ReactDOM.render(<App />, document.getElementById('root'));
```

**重要**：建议将 DSN 等敏感信息存储在环境变量中，而不是硬编码在代码里。

### 步骤 4: (推荐) 使用 ErrorBoundary 捕获组件错误

为了捕获 React 组件在渲染过程中发生的错误，你可以使用 Sentry 提供的 `ErrorBoundary` 组件包裹你的应用。

```javascript
// 在你的根组件或者路由组件外层包裹
import { ErrorBoundary } from '@sentry/react';

function App() {
  return <ErrorBoundary fallback={<p>An error has occurred</p>}>{/* 你应用的其他所有组件 */}</ErrorBoundary>;
}
```

### 步骤 5: (可选) 配置 Source Maps 上传

为了能够看到可读的错误堆栈而不是压缩后的代码，你需要将 Source Maps 上传到 Sentry。这通常在构建（build）流程中完成。你需要安装 `@sentry/webpack-plugin`。

1.  安装插件：

    ```bash
    npm install --save-dev @sentry/webpack-plugin
    ```

2.  在你的构建配置中（如 `webpack.config.js` 或 `config-overrides.js`）添加插件配置，它会在每次生产构建后自动上传 sourcemaps。

完成以上步骤后，你的 React 应用就已经成功集成了 Sentry。现在，应用中发生的任何未捕获错误都将被自动上报到你的 Sentry 控制台。
