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

简单来说，Lanes 的工作流程可以分为三步：

1.  **分配 Lane**: 当一个更新（如 `setState`）发生时，React 会根据上下文为其分配一个特定的 Lane。
2.  **选择 Lane**: React 的调度器会从所有待处理的 Lanes 中，挑选出优先级最高的那个。
3.  **处理任务**: React 开始渲染工作，但只处理与所选 Lane 相关的更新。如果在渲染期间有更高优先级的任务进来，当前渲染会被中断。

下面我们来详细拆解这个过程。

### 1. 分配 Lane：为每个更新打上"优先级标签"

当你在组件中调用 `setState` 时，并不是直接开始更新。React 会先调用 `requestUpdateLane` 函数来确定这次更新的优先级。

```javascript
// packages/react-reconciler/src/ReactFiberWorkLoop.js

export function requestUpdateLane(fiber: Fiber): Lane {
  // 1. 检查是否处于并发模式
  const mode = fiber.mode
  if ((mode & ConcurrentMode) === NoMode) {
    return (SyncLane: Lane)
  }

  // 2. 检查是否在 startTransition 内部
  const isTransition = isTransitionRunning()
  if (isTransition) {
    // Transition 更新有自己的 Lane
    return getCurrentTransition()?.lane ?? DefaultLane
  }

  // 3. 根据 Scheduler 的事件优先级决定 Lane
  const schedulerPriority = getCurrentSchedulerPriorityLevel()
  switch (schedulerPriority) {
    case ImmediatePriority: // e.g. discrete user interactions like `click`
      return SyncLane
    case UserBlockingPriority: // e.g. continuous interactions like `drag`
      return InputContinuousLane
    case NormalPriority:
    case LowPriority: // e.g. `useEffect`
      return DefaultLane
    case IdlePriority:
      return IdleLane
    default:
      return DefaultLane
  }
}
```

如源码所示，`requestUpdateLane` 会根据调用时的上下文，依次检查：

1.  **是否处于旧的同步模式 (Legacy Sync Mode)？** 如果是，直接返回最高优的 `SyncLane`，确保同步行为。
2.  **是否在 `startTransition` 内部？** 如果是，则返回一个 `TransitionLane`，标记为低优先级更新。
3.  **当前的事件优先级是什么？** React 的事件系统（如 `onClick`, `onInput`）在触发回调前，会设置一个相应的优先级。`requestUpdateLane` 会将这个优先级映射到对应的 Lane，例如：
    - **离散事件** (如 `click`) → `SyncLane`
    - **连续事件** (如 `drag`) → `InputContinuousLane`
    - **其他情况** (如 `useEffect` 中的更新) → `DefaultLane`

拿到 Lane 之后，React 会通过 `scheduleUpdateOnFiber` 函数启动更新调度。在这个过程中，最关键的一步是调用 `markRootUpdated`，将新的 Lane 添加到 Fiber 树根节点的 `pendingLanes` 字段上。

```javascript
// packages/react-reconciler/src/ReactFiberWorkLoop.js

function scheduleUpdateOnFiber(fiber, lane) {
  // ...
  const root = markUpdateLaneFromFiberToRoot(fiber, lane)
  markRootUpdated(root, lane)
  // ...
}

function markRootUpdated(root, updateLane) {
  // 使用位或运算，将新的 lane 添加到待处理集合中
  root.pendingLanes |= updateLane
}
```

`pendingLanes` 就像一个任务清单，记录了所有等待处理的更新。一旦 Lane 被记录在此，调度器就知道有新的工作需要执行。

### 2. 选择 Lane：从"泳池"中挑选最紧急的赛道

当 React 准备开始一轮新的渲染时，它会查看根节点上的 `pendingLanes`——这是一个包含了所有待处理任务优先级的位掩码。

调度器会调用 `getNextLanes` 函数，该函数的核心逻辑是：**"从 `pendingLanes` 中，找出最靠右侧（数值最小，但优先级最高）的那个 '1' 所代表的 Lane。"**

```javascript
// packages/react-reconciler/src/ReactFiberLane.js
export function getNextLanes(root: FiberRoot, wipLanes: Lanes): Lanes {
  const pendingLanes = root.pendingLanes
  if (pendingLanes === NoLanes) {
    return NoLanes
  }

  // ... 其他复杂逻辑，如饥饿处理 ...

  // 核心：获取优先级最高的 Lane
  return getHighestPriorityLanes(pendingLanes)
}

function getHighestPriorityLanes(lanes: Lanes): Lanes {
  // 这个位运算技巧可以隔离出二进制数中最右边的 '1'
  return lanes & -lanes
}
```

`lanes & -lanes` 这个操作看起来很神奇，但它其实是利用了计算机补码的表示方式，能够精准且高效地找出最小的（也就是优先级最高的）Lane。

例如，如果 `pendingLanes` 是 `0b0010100` (DefaultLane 和 InputContinuousLane)，`getHighestPriorityLanes` 会返回 `0b100` (`InputContinuousLane`)，因为它是最右边的 "1"。

这个被选中的 Lane 或 Lanes 集合，会成为本次渲染的 `renderLanes`。

### 3. 执行与中断：专注高优任务，兼顾其他

在渲染阶段（Render Phase），React 会从 Fiber 树的根节点开始遍历。对于每个 Fiber 节点，它会检查：

```
// 伪代码
if ((fiber.lanes & renderLanes) !== 0) {
  // 此 Fiber 节点有与当前渲染优先级匹配的更新
  // 需要处理它...
  processFiber(fiber);
} else {
  // 没有匹配的更新，可以尝试快速跳过
  skipFiber(fiber);
}
```

通过位运算 `&`，React 可以极快地判断一个节点是否需要在此次渲染中被处理。

最关键的一点是，在处理每个 Fiber 单元后，React 都会检查是否有更高优先级的更新插入。如果 `pendingLanes` 中出现了一个比当前 `renderLanes` 更高的优先级，React 会：

1.  **抛弃** 当前的渲染进度。
2.  **回到** 第二步，重新选择最高优先级的 Lane。
3.  **开始** 新一轮的渲染。

通过这种"**检查 -> 抛弃 -> 重启**"的循环，Lanes 模型赋予了 React 精确控制任务抢占的能力。它不再仅仅是被动地等待时间片用完，而是能够主动废弃低优先级的渲染，确保最高优先级的任务（如用户输入）能第一时间获得执行权，从而在根本上保证了应用的响应性。

### 4. Lanes 的冒泡：让父节点感知子树状态

在渲染过程中，React 会从根节点开始遍历，并将渲染结果传递给父节点。如果子节点有更高优先级的更新，父节点会将其 Lane 添加到自己的 `pendingLanes` 中，从而让父节点感知子树状态的变化。
