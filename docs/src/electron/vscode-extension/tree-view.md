# Tree View 树视图

在 VS Code 中，树视图是核心 UI 组件，几乎所有侧边栏功能都基于树视图实现。它不仅是 VS Code 内置功能的重要载体，也通过扩展 API 向开发者开放，支持自定义树视图的开发。

## VS Code 树视图的核心特性

VS Code 对树视图做了深度定制，核心特性包括：

- **层级化渲染**：支持无限嵌套的节点结构，父节点可通过 `collapsed（折叠）`/ `Expanded（展开）`状态控制子节点的显示与隐藏；
- **节点定制**：每个节点可配置标签、图标（内置主题图标/自定义图标）、描述、颜色、工具提示等属性；
- **交互能力**：
  - 点击节点：触发自定义命令（打开文件、跳转代码位置等）；
  - 右键菜单：自定义上下文操作（如重命名、删除、刷新等）；
  - 拖拽：支持节点拖拽操作；
  - 多选：支持按住 `Ctrl+Shift` 选择多个节点；
- **异步数据加载**：支持从文件、网络、数据库等异步数据源获取节点数据，避免 UI 阻塞；
- **实时更新**：监听数据变化（如文件修改、扩展事件），动态刷新单个节点或整个树结构；
- **集成 VS Code 生态**：支持主题适配、命令面板联动、快捷键绑定等。

## 注册树视图 TreeView

创建一个自定义树视图需要以下三个核心步骤：

1. **配置 package.json**：声明视图容器和视图 ID
2. **实现 TreeDataProvider**：提供树节点的数据和方法
   - **TreeItem**：树视图的单个节点，包含标签、图标、操作、是否可折叠等属性；
   - **TreeDataProvider**：树视图的数据提供器，负责提供树的节点数据、节点展开/折叠逻辑、节点渲染等核心功能；
3. **注册树视图**：通过 VS Code API `vscode.window.registerTreeDataProvider` 将数据提供器与视图 ID 关联。

## package.json 配置

在编写代码之前，首先需要在 `package.json` 中声明视图容器和视图，VS Code 才能识别并在侧边栏显示：

```json [package.json]
{
  "contributes": {
    // 1. 定义视图容器（侧边栏中的图标和容器）
    "viewsContainers": {
      "activitybar": [
        {
          "id": "customViewContainer", // 容器 ID，用于关联视图
          "title": "自定义容器", // 鼠标悬停时显示的标题
          "icon": "resources/tree.svg" // 侧边栏图标路径（相对于扩展根目录）
        }
      ]
    },
    // 2. 定义视图（容器内的具体视图）
    "views": {
      "customViewContainer": [
        // 对应上面的容器 ID
        {
          "id": "myCustomTreeView", // 视图 ID，代码中注册时使用
          "name": "我的树视图" // 视图显示的名称
        }
      ]
    }
  }
}
```

**关键配置说明**：

- `viewsContainers.activitybar`：定义在活动栏（Activity Bar）中显示的容器图标
- `views.customViewContainer`：定义容器内包含的所有视图，数组形式，可包含多个视图
- `id`：视图 ID，必须与代码中 `registerTreeDataProvider` 的第一个参数一致
- `icon`：支持 SVG、PNG 等格式，推荐使用 SVG 以获得更好的缩放效果

## 实现 TreeDataProvider

实现自定义树视图的核心是创建 `TreeDataProvider`，它负责为树视图提供数据。在实现之前，需要定义树节点的数据结构。

### 自定义树节点类

`vscode.TreeItem` 是 VS Code 提供的基础节点类，但它不包含子节点列表，也无法存储业务相关的自定义数据。因此需要创建一个自定义节点类来扩展这些功能。

**为什么需要自定义节点类？**

1. **存储子节点关系**：`vscode.TreeItem` 没有 `children` 属性，无法表示节点间的父子关系
2. **绑定业务数据**：可以添加文件路径、业务 ID 等自定义属性，方便后续操作
3. **扩展节点行为**：可以添加自定义方法来处理节点特有的逻辑

```typescript
// TreeItemNode.ts
import * as vscode from "vscode"

// 自定义树节点类：继承自 VS Code 内置的 TreeItem
export class TreeItemNode extends vscode.TreeItem {
  // 配置节点的所有属性
  constructor(
    // 1. 节点显示的文本标签
    public readonly label: string,
    // 2. 节点的折叠状态
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    // 3. 自定义属性：当前节点的子节点列表
    public readonly children?: TreeItemNode[]
  ) {
    // 4. 调用父类（vscode.TreeItem）的构造函数，初始化基础属性
    super(label, collapsibleState)
    // 5. 将自定义的 children 赋值给当前实例
    this.children = children
  }
}
```

**TreeItemCollapsibleState 三种状态**：

- `vscode.TreeItemCollapsibleState.None`：节点不可折叠，没有子节点
- `vscode.TreeItemCollapsibleState.Collapsed`：节点初始状态为折叠（有子节点但默认不显示）
- `vscode.TreeItemCollapsibleState.Expanded`：节点初始状态为展开（有子节点且默认显示）

**扩展节点属性示例**：

如果需要添加更多属性（如点击命令、图标、工具提示等），可以在构造函数中配置：

```typescript
export class TreeItemNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly children?: TreeItemNode[],
    // 扩展属性：文件路径、业务 ID 等
    public readonly filePath?: string,
    public readonly nodeId?: string
  ) {
    super(label, collapsibleState)
    this.children = children

    // 配置点击节点时执行的命令
    this.command = {
      command: "tree-view-demo.clickNode",
      title: "点击节点",
      arguments: [label, filePath], // 传递给命令的参数
    }

    // 配置图标（使用 VS Code 内置图标主题）
    this.iconPath = new vscode.ThemeIcon("file")

    // 配置工具提示（鼠标悬停时显示）
    this.tooltip = `文件路径: ${filePath || "未知"}`

    // 配置描述（在标签右侧显示灰色文本）
    this.description = "描述文本"
  }
}
```

### 实现 TreeDataProvider 接口

`TreeDataProvider` 接口定义了树视图运行所需的四个核心方法：

| 方法                    | 说明                                                        | 是否必需 |
| ----------------------- | ----------------------------------------------------------- | -------- |
| `getChildren(element?)` | 获取节点的子节点列表，`element` 为 `undefined` 时返回根节点 | ✅ 必需  |
| `getTreeItem(element)`  | 获取节点的渲染配置（标签、图标、折叠状态等）                | ✅ 必需  |
| `onDidChangeTreeData`   | 事件属性，当数据变化时通知 VS Code 刷新视图                 | ✅ 必需  |
| `getParent(element)`    | 返回节点的父节点，用于精准刷新和节点定位                    | ⭕ 可选  |

下面是一个完整的实现示例：

```typescript
// CustomTreeDataProvider.ts
import * as vscode from "vscode"
import { TreeItemNode } from "./TreeItemNode"

// 实现数据提供器
export class CustomTreeDataProvider
  implements vscode.TreeDataProvider<TreeItemNode>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItemNode | undefined | null | void
  > = new vscode.EventEmitter<TreeItemNode | undefined | null | void>()
  readonly onDidChangeTreeData: vscode.Event<
    TreeItemNode | undefined | null | void
  > = this._onDidChangeTreeData.event

  // 刷新机制：事件发射器和事件
  // EventEmitter 用于触发事件，Event 用于 VS Code 监听
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItemNode | undefined | null | void
  > = new vscode.EventEmitter<TreeItemNode | undefined | null | void>()
  readonly onDidChangeTreeData: vscode.Event<
    TreeItemNode | undefined | null | void
  > = this._onDidChangeTreeData.event

  // 刷新树视图方法：可传入单个节点进行局部刷新，不传则刷新整个树
  refresh(node?: TreeItemNode): void {
    this._onDidChangeTreeData.fire(node)
  }

  // getTreeItem：VS Code 渲染每个节点时调用，返回节点的显示配置
  // 通常直接返回节点本身即可，因为 TreeItemNode 已经包含了所有渲染信息
  getTreeItem(element: TreeItemNode): vscode.TreeItem | Thenable<TreeItemNode> {
    return element
  }

  // getChildren：VS Code 获取节点子列表时调用，是树视图数据加载的核心
  // - element 为 undefined：表示请求根节点，返回第一层节点
  // - element 不为 undefined：表示请求该节点的子节点
  // 支持同步返回数组、异步返回 Promise，或者返回 null/undefined 表示无子节点
  getChildren(element?: TreeItemNode): vscode.ProviderResult<TreeItemNode[]> {
    if (!element) {
      // 情况1：请求根节点，返回第一层节点列表
      return [
        new TreeItemNode(
          "一级节点1",
          vscode.TreeItemCollapsibleState.Collapsed,
          [
            new TreeItemNode(
              "二级节点1-1",
              vscode.TreeItemCollapsibleState.None
            ),
            new TreeItemNode(
              "二级节点1-2",
              vscode.TreeItemCollapsibleState.None
            ),
          ]
        ),
        new TreeItemNode(
          "一级节点2",
          vscode.TreeItemCollapsibleState.Collapsed,
          [
            new TreeItemNode(
              "二级节点2-1",
              vscode.TreeItemCollapsibleState.None
            ),
          ]
        ),
      ]
    } else {
      // 情况2：请求子节点，返回该节点的子节点列表
      return element.children || []
    }
  }
}
```

#### 核心方法工作原理

**1. getChildren(element?) - 数据加载核心**

这是树视图数据加载的核心方法。VS Code 会在以下时机调用：

- **首次打开视图**：调用 `getChildren(undefined)` 获取根节点列表
- **展开节点**：调用 `getChildren(node)` 获取该节点的子节点
- **刷新后**：重新调用对应节点的 `getChildren`

方法支持同步返回数组、异步返回 Promise（如从文件系统或网络加载），或返回 `null`/`undefined` 表示无子节点。

**2. getTreeItem(element) - 节点渲染配置**

VS Code 渲染每个节点前会调用此方法，获取节点的显示配置（标签、图标、折叠状态等）。在大多数情况下，直接返回节点本身即可，因为 `TreeItemNode` 已经包含了所有渲染所需的信息。

**3. 刷新机制 - onDidChangeTreeData**

树视图的刷新采用事件驱动机制：

```typescript
// 私有事件发射器：用于触发事件
private _onDidChangeTreeData: vscode.EventEmitter<...> = new vscode.EventEmitter<...>()

// 公开的事件：VS Code 监听此事件，感知数据变化
readonly onDidChangeTreeData: vscode.Event<...> = this._onDidChangeTreeData.event
```

**工作原理**：

1. **EventEmitter**：提供 `fire()` 方法用于触发事件
2. **Event**：提供订阅接口，VS Code 通过它监听数据变化
3. **刷新触发**：调用 `refresh()` → `_onDidChangeTreeData.fire(node)` → VS Code 监听到事件 → 重新调用 `getChildren()` 和 `getTreeItem()`

**刷新参数说明**：

- 传递 `undefined/null/void`：刷新整个树视图，重新获取所有节点
- 传递具体的 `TreeItemNode` 实例：只刷新该节点及其子节点，其他节点不受影响

使用 `readonly` 修饰 `onDidChangeTreeData` 确保外部只能监听事件，不能修改事件对象本身，只能通过内部的 `_onDidChangeTreeData.fire()` 触发。

## 注册树视图和命令

```typescript
// treeViewCommand.ts
import * as vscode from "vscode"
import { CustomTreeDataProvider } from "./CustomTreeDataProvider"

export function registerTreeViewCommand(
  context: vscode.ExtensionContext,
  treeDataProvider: CustomTreeDataProvider
): void {
  // 1. 注册树视图：将数据提供器与 package.json 中定义的视图 ID 关联
  // 视图 ID 必须与 package.json 中的 "views" 配置完全一致
  vscode.window.registerTreeDataProvider("myCustomTreeView", treeDataProvider)

  // 2. 注册刷新命令：用户可以通过此命令手动刷新树视图
  const refreshCommand = vscode.commands.registerCommand(
    "tree-view-demo.refresh",
    () => {
      treeDataProvider.refresh() // 触发刷新事件，VS Code 会重新获取数据
    }
  )

  // 3. 注册节点点击命令：当用户在 TreeItemNode 中配置了 command 属性时触发
  const clickNodeCommand = vscode.commands.registerCommand(
    "tree-view-demo.clickNode",
    (label) => {
      vscode.window.showInformationMessage(`你点击了：${label}`)
    }
  )

  // 4. 将命令注册到扩展上下文：确保扩展卸载时自动释放资源，避免内存泄漏
  context.subscriptions.push(refreshCommand, clickNodeCommand)
}
```

```typescript
// extension.ts
// 扩展激活入口：当 VS Code 触发激活条件时（如打开编辑器、执行命令）执行
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-extension-demo" is now active!'
  )

  // 1. 创建树视图数据提供器实例
  // 注意：此时不会立即加载数据，数据是按需懒加载的
  const treeDataProvider = new CustomTreeDataProvider()

  // 2. 注册树视图和所有相关命令
  // 这一步会将数据提供器与视图 ID 关联，并注册刷新、点击等命令
  registerTreeViewCommand(context, treeDataProvider)
}
```
