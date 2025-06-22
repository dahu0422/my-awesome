# React Fiber Lanes 模型：任务优先级的实现

在 React Fiber 架构中，我们知道渲染过程可以被中断，以响应更紧急的任务。但 React 是如何判断哪个任务更"紧急"的呢？比如，用户输入的响应显然比页面加载一个非关键部分的数据更重要。

这就是 **Lanes (泳道) 模型** 发挥作用的地方。你可以把 Lanes 想象成一个包含 31 条泳道的游泳池，不同的更新被分配到不同的泳道中，每条泳道代表一个优先级。

## 什么是 Lanes？

Lanes 本质上是一个用 31 位二进制数表示的**位掩码 (bitmask)**。每一位（每一条"泳道"）代表一个不同的优先级。React 通过**位运算**来检查、合并和比较不同更新的优先级。

```javascript
// packages/react-reconciler/src/ReactFiberLane.js

// 同步执行，最高优先级
export const SyncLane: Lane = /* ... */ 0b0000000000000000000000000000001

// 用户交互相关，如拖拽
export const InputContinuousLane: Lane = /* ... */ 0b0000000000000000000000000000100

// 默认优先级，大部分更新
export const DefaultLane: Lane = /* ... */ 0b0000000000000000000000000010000

// 过渡（Transition）优先级
const TransitionLanes: Lanes = /* ... */ 0b0000000001111111111111111100000

// 空闲（Idle）优先级，最低
export const IdleLane: Lane = /* ... */ 0b0100000000000000000000000000000
```

基于源码，我们可以将这些优先级归纳为以下几类，从高到低排列：

### 1. 同步优先级 (Synchronous Priority)

- **典型场景**: 受控的用户输入（如 `input` 的 `onChange`）、离散的点击事件 (`click`)。
- **核心特点**: 这是最高优先级，必须**立即、同步地执行**，会中断任何正在进行的低优先级渲染。

### 2. 连续事件优先级 (Continuous Priority)

- **典型场景**: 需要连续响应的事件，如拖拽 (`drag`)、滚动 (`scroll`)、鼠标移动 (`mousemove`)。
- **核心特点**: 优先级略低于 `SyncLane`。React 会尝试尽快响应，但若事件触发过于频繁，可能会对更新进行批处理 (batching)。

### 3. 默认优先级 (Default Priority)

- **典型场景**: 大部分的标准更新，如 `useEffect` 中的数据获取、普通的 `setState`。
- **核心特点**: 标准的异步渲染优先级，不会阻塞用户输入，可被高优任务中断。

### 4. 过渡优先级 (Transition Priority)

- **典型场景**: 被 `startTransition` 或 `useTransition` API 包裹的更新，如视图切换。
- **核心特点**: 优先级较低，其渲染过程可以被轻松中断，从而在等待渲染时保持 UI 的可交互性。

### 5. 空闲优先级 (Idle Priority)

- **典型场景**: 优先级最低的任务，如离屏内容的渲染（使用了实验性的 `<Offscreen>` 组件）。
- **核心特点**: 只有在浏览器完全空闲、且没有其他更高优先级的任务时才会执行。

## Lanes 如何工作？

### 1. 分配 Lane (Assigning a Lane)

React 之所以能知道更新的“来源”，是因为它在执行你的代码前，会先设置一个“执行上下文”（`executionContext`）。

例如，在处理像 `click` 这样的离散事件时，React 会先设置一个高优先级的上下文：

```javascript
// packages/react-dom/src/events/ReactDOMEventListener.js (简化后)
function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
  const previousExecutionContext = executionContext;
  // 设置一个高优先级的上下文
  executionContext |= DiscreteEventContext;
  try {
    // 在这个上下文中，执行你的事件回调
    batchedEventUpdates(dispatchEvent, ...);
  } finally {
    // 恢复上下文
    executionContext = previousExecutionContext;
  }
}
```

当你的 `setState` 在这个上下文中被调用时，React 内部的 `requestUpdateLane` 函数就会检查到 `DiscreteEventContext`，并返回一个高优先级的 `SyncLane`。同理，`startTransition` 也会设置一个 `Transition` 上下文，从而分配 `TransitionLane`。

### 2. 选择渲染的 Lanes (Selecting Render Lanes)

在每次准备启动或恢复渲染工作时，React 会调用 `getNextLanes` 函数来决定本次要处理的优先级批次。

```javascript
// packages/react-reconciler/src/ReactFiberWorkLoop.js (简化后)
function performConcurrentWorkOnRoot(root) {
  // ...
  // 1. 从根节点的所有待处理更新中，计算出本次要渲染的 Lanes
  const lanes = getNextLanes(root, NoLanes)

  if (lanes === NoLanes) {
    // 没有工作可做
    return
  }

  // 2. 将计算出的 lanes 作为 renderLanes 传入，并开始渲染
  renderRootConcurrent(root, lanes)
  // ...
}
```

`getNextLanes` 的核心逻辑是 `pendingLanes & -pendingLanes`，这是一个位运算技巧，用于获取所有待处理（`pendingLanes`）任务中，优先级最高的那一个（即最右边的二进制位 `1`）。这样就确保了最紧急的任务总是被最先选中。

### 3. 按优先级处理 (Processing Updates by Priority)

在 `workLoop` 循环中，当 React 处理一个组件的状态更新时，它会遍历该组件的更新队列。`processUpdateQueue` 函数会用当前的 `renderLanes` 来“过滤”这些更新。

```javascript
// packages/react-reconciler/src/ReactUpdateQueue.js (简化后)
function processUpdateQueue(workInProgress, props, instance, renderLanes) {
  const queue = workInProgress.updateQueue
  // ...
  let firstUpdate = queue.shared.pending
  if (firstUpdate !== null) {
    let update = firstUpdate
    do {
      const updateLane = update.lane

      // 检查当前更新的优先级，是否包含在本次渲染的批次中
      if (!isSubsetOfLanes(updateLane, renderLanes)) {
        // 优先级不够，跳过这个更新
        // ...
      } else {
        // 优先级足够，处理这个更新，计算新 state
        // ...
      }
      update = update.next
    } while (update !== null)
  }
  // ...
}
```

`isSubsetOfLanes(updateLane, renderLanes)` 同样是一个位运算 `(updateLane & renderLanes) === updateLane`。如果一个更新的 `lane` 不在 `renderLanes` 这个批次里，它就会被跳过，并保留在队列中，等待它自己的优先级被选中时再处理。

---

## 优先级抢占 (Interruption)

Lanes 模型最强大的地方在于它实现了**优先级抢占**。

设想一个场景：React 正在进行一个低优先级的渲染（比如一个 `TransitionLane` 的更新）。

> 突然，用户点击了一个按钮！

1.  一个高优先级的 `SyncLane` 更新被创建，并被添加到组件的 `pendingLanes` 中。
2.  React 会立刻调度一个新的渲染任务。在选择 `renderLanes` 时，它发现 `SyncLane` 的优先级远高于正在进行的 `TransitionLane`。
3.  这时，React 会**丢弃当前的低优先级渲染进度**。
4.  它会发起一次全新的渲染，这次的 `renderLanes` 会是高优先级的 `SyncLane`。
5.  这个新的 `workLoop` 会极速完成，只处理与用户点击相关的状态变更，从而保证了界面的即时响应。

当高优先级任务完成后，React 会再次检查是否还有待处理的低优先级任务，并在浏览器空闲时继续完成它们。

通过这种方式，React 确保了高优先级的任务（如用户交互）能够"插队"，中断正在进行的低优先级任务，从而避免了界面卡顿。

---

## 总结

Lanes 模型是 Fiber 架构下实现精细化任务调度的关键。它通过位掩码为不同更新分配优先级，并允许高优先级任务抢占低优先级任务，从而在保证界面响应性的同时，高效地完成各种渲染工作。
