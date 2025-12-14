# 注册自定义指令并挂载到菜单中

VS Code 扩展通过 `vscode.commands.registerCommand()` 注册自定义命令，并在 `package.json` 的 `contributes.commands` 中声明，通过 `contributes.menus` 将命令挂载到不同的菜单位置。

## 文本转大写

该指令可以格式化选中内容，将英文小写转为大写

:::code-group

```typescript [extension.ts]
// 注册指令格式化代码
const upperTextDisposable = vscode.commands.registerCommand(
  "vscode-extension-demo.upperText",
  () => {
    // 获取当前活动的文本编辑器
    const editor = vscode.window.activeTextEditor

    if (!editor) {
      vscode.window.showInformationMessage("No active editor found!")
      return
    }

    const selection = editor.selection
    const text = editor.document.getText(selection)
    const upperText = text.toUpperCase()

    // 编辑文档（需通过edit方法，VS Code统一管理编辑事务）
    editor.edit((editBuilder) => {
      editBuilder.replace(selection, upperText)
    })
  }
)

context.subscriptions.push(upperTextDisposable)
```

```json[package.json]
{
  "contributes": {
    // 注册指令
    "commands": [
      {
        "command": "vscode-extension-demo.upperText",
        "title": "Uppercase Text"
      }
    ],
    // 将命令挂载到菜单中
    "menus": {
      "editor/context": [
        {
          "command": "vscode-extension-demo.upperText",
          "when": "editorTextFocus",
          "group": "navigation"
        }
      ]
    }
  }
}
```

:::

![uppertext-menu](../images/uppertext-menu.png)

## 命令注册详解

### 1. 命令注册方法

`vscode.commands.registerCommand()` 方法签名：

```typescript
registerCommand(
  command: string,           // 命令ID（需与package.json中的command一致）
  callback: (...args: any[]) => any,  // 命令执行的回调函数
  thisArg?: any              // 可选：回调函数的this上下文
): vscode.Disposable
```

### 2. 命令参数传递

命令可以接收参数，参数可以通过以下方式传递：

- **命令面板调用**：不支持参数
- **快捷键调用**：不支持参数
- **编程式调用**：`vscode.commands.executeCommand('commandId', arg1, arg2)`

```typescript
// 注册带参数的命令
const commandWithArgs = vscode.commands.registerCommand(
  "vscode-extension-demo.commandWithArgs",
  (arg1: string, arg2: number) => {
    vscode.window.showInformationMessage(`参数1: ${arg1}, 参数2: ${arg2}`)
  }
)

// 在其他地方调用
vscode.commands.executeCommand(
  "vscode-extension-demo.commandWithArgs",
  "hello",
  123
)
```

### 3. 异步命令处理

命令回调可以返回 `Promise`，VS Code 会等待 Promise 完成：

```typescript
const asyncCommand = vscode.commands.registerCommand(
  "vscode-extension-demo.asyncCommand",
  async () => {
    // 显示进度提示
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "处理中...",
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0 })

        // 模拟异步操作
        await new Promise((resolve) => setTimeout(resolve, 2000))

        progress.report({ increment: 100 })
        vscode.window.showInformationMessage("处理完成！")
      }
    )
  }
)
```
