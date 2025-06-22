# 深入并发之核：调度、中断与抢占

前几篇文章我们已经了解，React Fiber 的 Render Phase 是"可中断"的。但这立刻带来了三个新问题：

1.  **何时中断？** React 如何知道主线程正忙，应该把控制权交还给浏览器？
2.  **中断后做什么？** 如果有多个更新任务，应该先做哪一个？
3.  **如何恢复？** 之前被中断的工作该如何继续？

要回答这些问题，我们必须深入 React 并发模式的真正大脑——**调度器 (Scheduler)**，并理解其三大核心机制：**时间分片**、**Lanes 模型**和**任务抢占**。

## 时间分片 (Time Slicing) 与中断机制

时间分片是实现并发更新的核心机制。它的目标，是确保 React 的更新过程不会长时间霸占主线程，从而让浏览器有机会处理用户输入或渲染动画等更高优先级的任务。

这个机制的实现，是**协调器 (Reconciler)** 和 **调度器 (Scheduler)** 紧密协作的结果：

- **协调器 (Reconciler)**: 拥有一个名为 `workLoop` 的工作循环，负责处理 Fiber 节点。
- **调度器 (Scheduler)**: 提供一个名为 `shouldYield` 的函数，用于判断当前时间片是否耗尽。

在 `workLoop` 的每一轮循环中，`Reconciler` 在处理完一个 Fiber 节点后，都会调用 `shouldYield` 来"看一眼"时间：

```javascript
// 伪代码，融合了 Reconciler 和 Scheduler 的核心逻辑

// --- Reconciler 内部 ---
let workInProgress = null // 当前正在处理的 Fiber 节点

function workLoop() {
  // 只要还有工作，并且调度器告知我们无需中断，就继续
  while (workInProgress !== null && !shouldYield()) {
    // performUnitOfWork 会处理当前的 Fiber 节点，
    // 并返回下一个要处理的节点（子节点或兄弟节点）。
    workInProgress = performUnitOfWork(workInProgress)
  }
}

// --- Scheduler 提供的能力 ---
function shouldYield() {
  // 它的逻辑是检查当前时间是否已经超过了预设的截止时间 (deadline)。
  // 背后是基于 MessageChannel 实现的宏任务调度，比 requestIdleCallback 更可靠。
  return Date.now() > deadline
}
```

当 `shouldYield` 返回 `true` 时，意味着当前帧的剩余时间已经不足，`workLoop` 就会停止。Reconciler 会保存当前的工作进度，并由 Scheduler 安排一个新的宏任务，在下一次事件循环中继续执行。

通过这种"做一点，歇一下"的模式，一个漫长的更新任务就被切分成了多个不连续的小任务，实现了**时间分片**。

## 优先级的概念与 Lanes 模型

既然任务可以中断，那么当有新的更新到来时，React 需要一种机制来判断新任务和旧任务哪个更紧急。这就是**优先级**。

在旧版的 React 中，优先级是一个简单的数字。但在并发模式下，这种模型不够灵活。因此，React 引入了**Lanes (车道) 模型**。

Lanes 本质上是一个用 31 位的二进制数表示的**位掩码 (bitmask)**。每一位（或多位）代表一种更新的优先级。

```javascript
// Lanes 的简化表示 (实际值不同)
const NoLane = 0b00000000
const SyncLane = 0b00000001 // 同步，最高优先级
const InputLane = 0b00000010 // 用户输入
const TransitionLane = 0b00000100 // useTransition 触发的更新
const DefaultLane = 0b00001000 // 默认，如网络请求
const IdleLane = 0b00010000 // 最低优先级
```

使用位掩码的好处是可以通过**位运算**快速地检查和操作多个优先级。例如，用 `&` (按位与) 运算可以判断某个任务是否包含某种优先级的更新。

## 任务抢占 (Preemption)

**抢占**指的是**一个高优先级的更新，可以中断一个正在进行的低优先级更新**。

假设 React 正在进行一个低优先级的 `TransitionLane` 更新（比如渲染一个庞大的数据列表）。这时，用户在输入框里打字，触发了一个高优先级的 `InputLane` 更新。

抢占发生在工作循环的入口处。在开始或恢复工作循环前，React 会检查是否有比当前正在渲染的优先级更高的任务。

```javascript
// 调度更新的入口函数 (高度简化)
function scheduleUpdateOnFiber(fiber, lane, eventTime) {
  // ...

  // 1. 将新的 lane 添加到 Fiber 节点的 lanes 集合中
  fiber.lanes = mergeLanes(fiber.lanes, lane)

  // 2. 检查是否有正在进行的工作
  if (workInProgress !== null) {
    // 获取当前正在渲染的优先级
    const currentlyRenderingLanes = workInProgressRootRenderLanes

    // 3.【抢占检查】
    // 如果新任务的优先级 > 正在渲染的优先级
    if (isSubsetOfLanes(lane, currentlyRenderingLanes)) {
      // 不抢占，继续当前工作
    } else {
      // 【抢占发生】
      // 标记当前工作为已中断，并从头开始一个新的渲染循环
      // 来处理更高优先级的任务。
      interrupted = true
      ensureRootIsScheduled(root, eventTime)
    }
  }

  // ...
}
```

当抢占发生时，React 会**废弃**掉当前正在进行的低优先级渲染进度，然后从头开始，以**高优先级**重新启动一次 Render Phase。当这次高优先级的渲染完成后，React 会再次决定接下来做什么，可能会重新开始之前被废弃的低优先级渲染。

## `useTransition` 如何工作？

现在我们可以理解 `useTransition` 的魔力了。

```javascript
const [isPending, startTransition] = useTransition()

startTransition(() => {
  // 这里的状态更新会被标记为 TransitionLane
  setCount((c) => c + 1)
})
```

`startTransition` 的作用就是将闭包内触发的所有状态更新，标记为一个低优先级的 `TransitionLane`。正因为它的优先级低，所以它渲染的过程可以被用户的输入等高优先级任务**抢占**，从而保证了页面的响应性。

## 本篇小结

我们将 Fiber 的核心机制串联了起来：

- **Render Phase** 提供了"可中断"的能力。
- **Scheduler** 提供了"时间分片"的能力，知道"何时"中断。
- **Lanes 模型**提供了"优先级"的规则，知道"为何"要中断。
- **抢占机制**提供了中断后处理高优任务的能力，是并发模式最终的用户体验保障。

至此，我们已经深入了 Fiber 架构最核心、最复杂的腹地。在下一篇中，我们将回到一个更熟悉的话题：Hooks，看看它是如何与 Fiber 精巧地结合在一起的。
