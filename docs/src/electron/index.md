# Electron 笔记

## Hello Electron

从 0 到 1 创建一个 Electron 工程

```bash
# 创建文件目录并切换至该目录
mkdir my-electron-app && cd my-electron-app
# 初始化项目
npm init
# 安装 electron 依赖
npm install electron --save
```

```json{7}
// package.json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "description": "",
  "devDependencies": {
    "electron": "^39.2.3"
  }
}
```

::: code-group

```js[main.js]
const { app, BrowserWindow } = require('electron')

// 将页面加载到 BrowserWindow 实例中
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('index.html')
}

// 应用准备就绪时调用该函数，app 模块的 ready 事件触发后才能创建 BrowserWindow 实例。
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  console.log('window-all-closed')
  if (process.platform !== 'darwin') app.quit()
})
```

```html [index.html]
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <meta
      http-equiv="X-Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <title>Hello from Electron renderer!</title>
  </head>
  <body>
    <h1>Hello from Electron renderer!</h1>
    <p>👋</p>
  </body>
</html>
```

:::

### `app` - 应用程序生命周期管理器

`app` 是 Electron 的主进程模块，负责控制整个应用的生命周期和全局行为。

主要功能：

- 监听应用生命周期（启动、就绪、退出）
- 监听应用级别的事件
- 控制应用行为，例如是否退出、是否允许退出

常用方法和事件：

| 方法/事件                     | 说明                                       |
| ----------------------------- | ------------------------------------------ |
| `app.whenReady()`             | 等待应用初始化完成，返回 Promise           |
| `app.quit()`                  | 退出应用                                   |
| `app.on('ready')`             | 应用初始化完成时触发                       |
| `app.on('activate')`          | macOS 下应用被激活时触发（点击 Dock 图标） |
| `app.on('window-all-closed')` | 所有窗口关闭时触发                         |
| `app.on('before-quit')`       | 应用退出前触发                             |

### `BrowserWindow` - 窗口创建和管理器

`BrowserWindow` 用于创建和控制应用窗口（类似浏览器窗口），每个 `BrowserWindow` 实例代表一个独立的窗口。

主要功能：

- 创建和管理应用窗口
- 控制窗口大小、位置、样式等属性
- 加载网页内容到窗口中
- 管理窗口的生命周期

常用方法和属性：

| 方法/属性                          | 说明                                          |
| ---------------------------------- | --------------------------------------------- |
| `new BrowserWindow(options)`       | 创建新窗口实例                                |
| `win.loadFile(path)`               | 加载本地 HTML 文件                            |
| `win.loadURL(url)`                 | 加载远程 URL                                  |
| `win.webContents`                  | 窗口的 WebContents 对象（用于与渲染进程通信） |
| `BrowserWindow.getAllWindows()`    | 获取所有打开的窗口                            |
| `BrowserWindow.getFocusedWindow()` | 获取当前聚焦的窗口                            |

### 两者的关系

```
应用启动
    ↓
app 模块初始化
    ↓
app.whenReady() 等待应用就绪 ✅
    ↓
new BrowserWindow() 创建窗口 🪟
    ↓
win.loadFile() 加载网页内容 📄
    ↓
窗口显示给用户 👀
```

**重要提示：**

- 必须在 `app.whenReady()` 之后才能创建 `BrowserWindow` 实例
- `app` 是单例，代表整个应用
- `BrowserWindow` 可以创建多个实例，每个代表一个窗口

## 预加载脚本

预加载脚本是 Electron 中的一个概念：他在网页内容**加载之前运行**，在渲染进程中执行，可以访问 Node.js API，并且在渲染进程与主进程之间安全通信的桥梁。

为什么需要预加载脚本？

- 在默认情况下，渲染进程（网页）无法直接访问 Node.js API
- 预加载脚本可以在隔离环境中运行，并通过 contextBridge 安全地向网页暴露 API
