# Fiber 链表结构 & Wook Loop

在上一篇文章中，讲述了**为什么** React 需要 Fiber 架构——主要是为了解决同步更新带来的性能瓶颈。接下来将深入 Fiber 的内部，本文将详细介绍：

- Fiber 节点究竟是一个怎样的 JavaScript 对象，它如何将组件树变成一个链表？
- React 如何巧妙地利用"双缓存"技术实现流畅、无闪烁的 UI 更新？
- "Work Loop"是如何以可中断的方式遍历组件树，并划分出"渲染"和"提交"两大核心阶段的？

理解这些底层机制，是掌握 React 并发特性和性能优化的关键。

## Fiber 节点：一个链表结构

从本质上讲，Fiber 节点是一种将组件树层级关系转换为**链表**的数据结构。它通过 `return`, `child`, `sibling` 三个指针，将所有节点连接起来，使得 React 可以用非递归的方式遍历整个树，从而实现可中断、可恢复的更新过程。

一个 Fiber 节点的数据结构可以用以下 JavaScript 对象来描述，它包含了调度、协调和最终渲染所需的所有信息：

```javascript
const FiberNode = {
  // --- 实例属性 (Instance) ---
  // Fiber 节点的类型，如 FunctionComponent, ClassComponent, HostComponent (div) 等
  tag: any,
  // 元素的 key，用于 diff 算法
  key: any,
  // 组件的构造函数、函数本身或 DOM 元素的标签名
  type: any,
  // Fiber 节点对应的实例，如组件实例、DOM 节点
  stateNode: any,

  // --- 链表结构 (Linked List Structure) ---
  // 指向父级 Fiber 节点
  return: FiberNode | null,
  // 指向第一个子 Fiber 节点
  child: FiberNode | null,
  // 指向下一个兄弟 Fiber 节点
  sibling: FiberNode | null,

  // --- 工作单元属性 (Unit of Work) ---
  // 即将应用到组件的新 props
  pendingProps: any,
  // 上一次渲染时使用的 props
  memoizedProps: any,
  // 上一次渲染时组件的状态，对于函数组件是 Hooks 的链表
  memoizedState: any,
  // 存储待处理的状态更新、回调等
  updateQueue: any,

  // --- 双缓冲 (Double Buffering) ---
  // 指向另一个缓冲区的 Fiber 节点（current <-> workInProgress）
  alternate: FiberNode | null,

  // --- 副作用 (Side Effects) ---
  // 描述需要对 DOM 执行的操作，如 Placement (插入)、Update (更新)、Deletion (删除)
  effectTag: number,
}
```

## Fiber 树与双缓存（Double Buffering）

React Fiber 对 UI 更新的管理，巧妙地借鉴了**计算机图形学**中的经典技术——"双缓存"（Double Buffering），这种技术常用于优化 Canvas 动画或游戏开发，以防止画面闪烁。

其核心思想是**在内存中准备好下一帧的内容，然后一次性地将其呈现出来**。

在 React 中，这两棵树扮演了"缓存"的角色：

1.  **`current` 树 (前台缓存)**: 这是当前已经渲染在屏幕上的 UI 所对应的 Fiber 树。它是用户看到的样子，是稳定的。

2.  **`workInProgress` 树 (后台缓存)**: 这是一棵正在内存中构建的、代表即将到来的更新的 Fiber 树。就像在离屏的 Canvas 上进行绘制一样，React 的所有协调（Diffing）和计算都在这棵树上悄然发生，完全不影响前台。

这两棵树的节点通过 `alternate` 属性相互指向。`current` 树中节点的 `alternate` 指向 `workInProgress` 树中对应的节点，反之亦然。

**工作流程如下：**

- 当一次更新发生时，React 会从 `current` 树克隆出一个 `workInProgress` 树（或者复用上一轮的 `workInProgress` 树）。
- 所有的变更和计算都应用在 `workInProgress` 树上。这个过程是可中断的，并且不会影响屏幕上显示的 `current` 树。
- 当 `workInProgress` 树构建完成，并且所有副作用都计算完毕后，在最后的"提交"阶段 (Commit Phase)，React 会将 `workInProgress` 树原子性地切换为新的 `current` 树。

这种机制的最大优势在于，它保证了用户永远不会看到一个只渲染了一半的、不完整的 UI，确保了更新过程的流畅和一致性，这与图形学中双缓存的目标如出一辙。

## Work Loop & 两大阶段

有了 Fiber 树这种可遍历的链表结构和双缓存机制后，React 就可以启动它的核心—— Work Loop 来构建 `workInProgress` 树。

这个过程，也被称为**渲染阶段 (Render Phase)**，其最终目标是找出所有状态变更，并生成一份待执行的"副作用列表" (Effect List)。最关键的是，**这个阶段是异步、可中断的**。React 可以根据时间片或更高优先级的任务，随时暂停或恢复此阶段的工作，而不会产生任何用户可见的 UI 变化。

渲染阶段主要包含两个交替进行的核心步骤：

1.  **`beginWork` (递进)**：从树的顶端"向下"遍历。对于每个节点，它会进行 Diff 运算，计算出需要进行的变更，并为需要更新的节点打上 `effectTag` 标记。
2.  **`completeWork` (归并)**：当遍历到树的最深处后，开始"向上"归并。它会为节点创建 DOM 实例（如果需要），并将子节点的副作用列表合并到父节点上。

当 Work 最终回到根节点时，渲染阶段结束。此时，React 已经拥有了一棵完整的 `workInProgress` 树和一条记录了所有 DOM 操作的副作用链表。

紧接着，React 会进入第二个不可中断的阶段——**提交阶段 (Commit Phase)**。在这个阶段，React 会一次性、同步地遍历副作用链表，并将所有变更应用到真实的 DOM 上。
