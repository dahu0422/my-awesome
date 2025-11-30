# Electron 笔记

创建 Electron 项目，并编写一个简单的入门教程。

## Hello Electron

1. 初始化项目；
2. 在 package.json 的 `script` 字段中添加 `start` 命令；
3. 创建 main.js：main.js 是文件是 Electron 应用的入口，控制主进程，运行在 Node.js 环境中。负责控制应用的生命周期、显示原声界面、执行特殊操作并管理渲染进程。
4. 将网页挂载到 `BrowserWindow`：在 Electron 中每个窗口展示一个页面，创建 index.html，并加载到 Electron 的 `BrowserWindow`。

:::code-group

```bash
# 创建文件目录并切换至该目录
mkdir my-electron-app && cd my-electron-app

# 初始化项目
npm init

# 安装 electron 依赖
npm install electron --save
```

```json[package.json]
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .", // [!code ++]
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

```javascript[main.js]
const { app, BrowserWindow } = require('electron')
// app 是 Electron 的主进程模块，负责控制整个应用的生命周期和全局行为。
// BrowserWindow 用于创建和控制应用窗口（类似浏览器窗口），每个 `BrowserWindow` 实例代表一个独立的窗口。

// 将页面加载到 BrowserWindow 实例中
const createWindow = () => {
  const win = new BrowserWindow({ width: 800, height: 600 })
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

## 预加载脚本

预加载脚本是 Electron 中的一个概念：他在**网页内容加载之前**运行，在渲染进程中执行，可以访问 Node.js API，并且在渲染进程与主进程之间安全通信的桥梁。

为什么需要预加载脚本？

- 在默认情况下，渲染进程（网页）无法直接访问 Node.js API
- 预加载脚本可以在隔离环境中运行，并通过 contextBridge 安全地向网页暴露 API

为了演示预加载这一概念，创建一个将应用中的 Chrome、Node、Electron 版本号暴露至渲染器的预加载脚本。

1. 创建 `preload.js` 预加载脚本；
2. 配置网页首选项，添加预加载脚本路径；
3. 在渲染页面中添加 info dom 用于显示 Chrome、Node、Electron 版本信息；
4. 创建 `renderer.js` 脚本操作 info dom；

:::code-group

```javascript[preload.js]
const { contextBridge } = require("electron")
// contextBridge 用于在预加载脚本中安全地向渲染进程暴露，让网页代码可以通过 window 对象访问这些 API。

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
})

```

```javascript[main.js]
const { app, BrowserWindow } = require("electron")

const path = require("node:path")

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    // webPreferences 网页首选项配置，用于控制渲染进程的行为和安全。
    // webPreferences.preload 预加载脚本的路径，在网页加载前执行。
    webPreferences: { // [!code ++]
      preload: path.join(__dirname, "preload.js"), // [!code ++]
    }, // [!code ++]
  })

  win.loadFile("index.html")
}

app.whenReady().then(() => {
  createWindow()
})
```

```html[index.html]
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
    <p id="info"></p> <!-- [!code ++] -->
  </body>
  <script src="./renderer.js"></script> <!-- [!code ++] -->
</html>
```

```javascript[renderer.js]
const information = document.getElementById('info')
information.innerText = `本应用正在使用 Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), 和 Electron (v${versions.electron()})`
```

:::

## 进程间通信（IPC）

由于进程隔离，渲染进程无法直接访问 Node.js API 和操作系统资源，需要通过 IPC 与主进程通信。Electron 提供了 `ipcMain` 和 `ipcRenderer` 模块来进行进程间通信。从渲染进程发送消息，主进程响应。

1. 渲染进程通过预加载脚本使用 `ipcRenderer` 模块与主进程通信；
2. 主进程处理来自渲染进程的异步请求；
3. 渲染进程中发送请求并等待响应；

:::code-group

```javascript[preload.js]
const { contextBridge, ipcRenderer } = require('electron') // [!code ++]

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping') // [!code ++]
})
```

```javascript[main.js]
const { app, BrowserWindow, ipcMain } = require('electron/main')

const path = require('node:path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  // 处理来自渲染进程的异步请求（返回Promise）
  ipcMain.handle('ping', () => 'pong') // [!code ++]
  createWindow()
})

```

```javascript[renderer.js]
// 发送请求等待响应
const func = async () => {
  const response = await window.versions.ping()
  information.innerText = response
}

func()
```

:::
