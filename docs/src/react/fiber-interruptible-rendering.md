# Fiber 实现可中断渲染

Fiber 的渲染过程分为两个阶段：Reconciliation 和 Commit

在 **Reconciliation** 协调阶段 React 会构建一颗新的“在建”（`workInProgress tree`）Fiber 树，找出所有状态变更，并生成一个包含所有 DOM 更新、删除、插入操作的“**副作用列表**”

这个过程是完全在**内存中运行**，不涉及任何真实 DOM 操作。因此，它是可以被**暂停、重启**的。即使计算到一半被丢弃，也不会对用户界面产生任何可见的影响。

在 **Commit** 提交阶段 React 遍历在上一阶段生成的“副作用”列表，并一次性地、同步地将所有变更应用到真实 DOM 上。这个阶段涉及到真实的 DOM 增删改，所以不可中断。

## 暂停：在 Reconciliation 阶段让出控制权

"暂停"的核心在于 React 放弃了之前的递归遍历方式，使用了**基于链表的 `while` 循环**来遍历 Fiber 节点。这个循环的执行与否，取决于外部的调度器.

下面是一段 React 源码中关于这个循环概念的伪代码，大致说明核心思想

```js
// 位于 react-reconciler/packages/react-reconciler/src/ReactFiberWorkLoop.js
let workInProgress = null // 当前正在处理的 Fiber 节点

function workLoop(deadline) {
  // shouldYieldToHost 用来判断是否应该让出主线程
  let shouldYield = false

  while (workInProgress !== null && !shouldYield) {
    // performUnitOfWork 会处理当前的 Fiber 节点，
    // 并返回下一个要处理的节点（子节点或兄弟节点）。
    workInProgress = performUnitOfWork(workInProgress)

    // 检查是否还有剩余时间
    // 在真实源码中，这个检查由 Scheduler 包完成
    if (deadline.timeRemaining() < 1) {
      shouldYield = true
    }
  }
}
```

`workLoop` 是一个 while 循环，不断的处理下一个工作单元，其中 `performUnitOfWork` 函数是关键，它的职责是**处理当前的 Fiber 节点，并找出下一个要处理的节点**。

它内部的逻辑由 `beginWork` 和 `completeWork` 组成，模拟了递归的"递"与"归"过程。

```js
// 位于 packages/react-reconciler/src/ReactFiberWorkLoop.js
function performUnitOfWork(unitOfWork: Fiber): Fiber | null {
  // 获取当前 fiber 的 alternate，并传入 beginWork
  const current = unitOfWork.alternate

  // 1. "递"的过程 -> 向下探索
  // beginWork 会处理当前节点，并返回它的第一个子节点
  let next = beginWork(current, unitOfWork, renderLanes)

  // 将 props/state 等固化下来
  unitOfWork.memoizedProps = unitOfWork.pendingProps

  if (next === null) {
    // 如果 next 为 null，说明没有子节点了，我们到达了叶子节点
    // 2. "归"的过程 -> 向上回溯
    next = completeUnitOfWork(unitOfWork)
  }
  return next
}
```

### `begin` 向下走，创建子节点

`begin` 函数是"递"的过程，核心任务是：

- **Diff & 计算**：比较当前 Fiber 节点的 `pendingProps` 和 `memoized`，判断该组件是否需要重新渲染；
- **调用 render**：如果需要，调用类组件的 `render()` 方法或执行函数组件，获取其子 React Elements；
- **创建子 Fiber**：将返回的 React Elements 与 旧的子 Fiber 节点进行 diff，**创建出新的子 Fiber 节点（workInProgress.child）**
- **返回下一个工作单元**：最后，返回创建的第一个子节点作为下一个要进入 `performUnitOfWork` 的单元。如果该组件没有渲染任何子节点，返回 `null`

### `completeUnitOfWork` 和 `completeWork` 向上走，完成工作并收集副作用；

当 `beginWork` 返回 `null` 时，意味着当前节点是一个叶子节点，无法再"向下“了。此时`performUnitOfWork` 就会调用 `completeUnitOfWork` 并开始"向上回溯" 的 "归" 过程。

`completeUnitOfWork` 本身是一个循环，它会不断完成当前节点，然后尝试移动到其兄弟节点或父节点，核心是调用 `completeWork`

`completeWork` 函数的核心任务是：

- **创建实例**：对于 HostComponent (如 `<div>`)，正是在 completeWork 阶段创建了真实的 DOM 节点实例 (document.createElement('div')) 并设置其属性；
- **收集副作用**：这是至关重要的一步。completeWork 会检查当前 Fiber 节点是否有副作用标记（如 Placement 表示插入，Update 表示更新）。然后，它**会将当前节点所有子节点的副作用链表，和它自己的副作用，合并到其父节点的副作用链表中**。
- **构建副作用链表**：经过自下而上的 `completeWork` 过程，最终在根节点上会形成一个**完整的、线性的副作用链表 (effect list)**，记录了所有需要进行的 DOM 操作。

### 暂停是如何发生的

Fiber 实现可中断渲染的核心，并非真正地“挂起”程序，而是一种协作式的调度机制。它通过将渲染工作分解为小单元，在完成每个单元后检查是否还有时间，然后决定是继续工作还是“暂停”以将控制权交还给浏览器。

“暂停”这一行为的发生，依赖于以下几个关键步骤：

- **时间切片 (Time Slicing)**: 在 workLoop 的每一次循环中，调度器（Scheduler）都会通过类似 deadline.timeRemaining() 的机制检查当前帧是否还有剩余时间。
- **让出主线程 (Yielding)**: 一旦发现时间不足（例如，小于 1 毫秒），一个 shouldYield 标志位就会被设为 true。这将导致 while 循环在当前迭代结束后立即终止。
- **保存进度**: 循环虽然停止了，但 workInProgress 变量（即指向下一个工作单元的指针）已经被更新并保留在内存中。因此，React 精确地知道下一次应该从哪个 Fiber 节点继续开始工作。
- **返回控制权**: 当 workLoop 循环退出后，JavaScript 的执行栈变空，主线程的控制权就自然交还给了浏览器。浏览器此时可以自由地去处理更高优先级的任务，比如响应用户输入或渲染动画。

实例演示：在遍历过程中暂停

假设 React 正在处理一个 `Parent` -> `ChildA` -> `Grandchild` 的组件结构：

1. `performUnitOfWork(Parent)` -> 执行 `beginWork(Parent)`，返回其子节点 `ChildA`。
2. `performUnitOfWork(ChildA)` -> 执行 `beginWork(ChildA)`，返回其子节点 `Grandchild`。
3. `performUnitOfWork(Grandchild)` -> 执行 `beginWork(Grandchild)`，由于 `Grandchild` 是叶子节点，返回 `null`。
4. 由于 `beginWork` 返回 `null`，程序转而执行 `completeUnitOfWork(Grandchild)` 来完成该节点的工作。
5. `completeUnitOfWork` 发现 `Grandchild` 没有兄弟节点，于是向上回溯，开始处理其父节点 ChildA 的完成工作。
6. 就在此时！调度器发现当前帧的时间已经用完了！

这时，“暂停”就发生了：

- `workLoop` 的 while 循环条件变为 false，循环终止。
- 当前的执行状态被完整地保存在内存中。React 知道下一个任务是继续完成 `ChildA` 的工作，或者移动到 `ChildA` 的兄弟节点 `ChildB`（如果存在）。这个指向下一个工作单元的指针被安全地保存了下来。
- 主线程的控制权被交还给浏览器。

## 重新开始：调度器在下一轮空闲时触发工作

“重新开始”的过程则依赖于 React 的调度器（Scheduler package）。

- **调度下一次工作**: 当 workLoop 因为时间用尽而暂停时，React 会使用调度器来安排一次新的宏任务（Macrotask），通常是通过 MessageChannel 来实现。这相当于告诉浏览器：“嘿，当你忙完手头的事情后，请调用我安排的这个函数。”
- **进入新的 workLoop**: 当浏览器主线程再次空闲时，事件循环会执行这个被安排好的宏任务，从而再次调用 workLoop 函数。
- **无缝衔接**: 新的 workLoop 启动后，它会找到上次被中断时保存的 workInProgress 引用。由于这个引用精确地指向了下一个需要处理的 Fiber 节点，渲染工作就能从上次中断的地方无缝地继续下去，而不是从头开始。

这个“暂停 -> 让出 -> 调度 -> 恢复”的循环会一直持续，直到整棵 Fiber 树的所有节点都被处理完毕（即 workInProgress 最终变为 null）。

## 从 Reconciliation 到 Commit

当 `workLoop` 成功遍历完所有节点并构建了完整的 `workInProgress` 树和副作用列表后，Reconciliation 阶段就结束了。
此时，React 会调用 `commitRoot` (位于 ReactFiberWorkLoop.js) 函数，进入不可中断的 Commit 阶段，将所有变更一次性应用到 DOM 上。这个阶段是同步的，不会再有任何暂停。

## 总结

结合源码逻辑，Fiber 的可中断渲染可以归纳为：

- `阶段分离`: 将渲染分为“可中断的内存计算”和“不可中断的 DOM 操作”，这是实现一切的基础。
- `循环代替递归`: 用 while 循环和链表遍历（通过 child, sibling, return 指针）代替了无法中断的递归调用栈。
- `时间切片与协作调度`: 在循环的每个单元工作后检查时间，如果时间不足就保存当前进度指针并让出主线程。
- `任务调度与恢复`: 利用 MessageChannel 等宏任务调度机制，在浏览器空闲时根据保存的进度指针恢复工作。
