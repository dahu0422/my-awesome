# React Fiber 系列文章大纲

这是一份关于 React Fiber 架构系列文章的写作大纲，旨在帮助读者由浅入深地理解其内部工作原理。

---

### **第一篇：初识 React Fiber：为什么我们需要它？**

- **引言**
  - 当前前端开发的痛点（UI 卡顿、用户体验下降）。
  - React 16 之前的 Stack Reconciler（栈协调器）有什么问题？
    - 同步阻塞：递归调用，无法中断，长时间计算会阻塞主线程。
    - 举例说明 `setState` 引发的长列表或复杂组件树更新问题。
- **Fiber 的诞生**
  - React Fiber 的核心思想：将渲染/更新过程拆分成一系列可中断、可恢复的小任务。
  - 什么是 Fiber？
    - 它是一个工作单元（Unit of Work）。
    - 它是一种数据结构，一个描述了组件信息的普通 JavaScript 对象。
- **核心目标**
  - 增量渲染（Incremental Rendering）：将渲染任务拆分，分布到多个 `requestIdleCallback` 帧中。
  - 对不同类型的更新赋予优先级，实现更智能的调度。
  - 支持并发模式（Concurrent Mode）等新特性。
- **本篇小结**
  - 总结 Fiber 解决的核心问题和带来的优势。
  - 预告下一篇将深入 Fiber 的数据结构。

---

### **第二篇：Fiber 核心数据结构与工作循环**

- **引言**
  - 回顾上一篇中 Fiber 作为"工作单元"和"数据结构"的定义。
- **Fiber 节点 (Fiber Node)**
  - 详解 Fiber 节点的主要属性：
    - `tag`: Fiber 节点类型（FunctionComponent, ClassComponent, HostComponent 等）。
    - `key`: 唯一标识。
    - `type`: 组件构造函数或 DOM 标签名。
    - `stateNode`: 指向 Fiber 节点实例（组件实例、DOM 节点）。
    - `return`, `child`, `sibling`: 构成 Fiber 树的链表结构。
    - `pendingProps`, `memoizedProps`, `memoizedState`: 存储状态和属性。
    - `updateQueue`: 存储待处理的更新。
    - `effectTag`: 描述需要执行的副作用（DOM 操作）。
- **Fiber 树与双缓冲（Double Buffering）**
  - `current` 树：当前已渲染在屏幕上的树。
  - `workInProgress` 树：正在内存中构建的树。
  - 解释这种"双缓冲"技术如何实现原子性更新，避免用户看到渲染不完全的 UI。
- **工作循环（Work Loop）**
  - 高层次介绍 React 如何从根节点开始遍历 `workInProgress` 树。
  - `beginWork` (向下) -> `completeWork` (向上) 的基本流程。
- **本篇小结**
  - Fiber 节点是整个架构的基石。
  - 双缓冲机制是实现无缝更新的关键。
  - 预告下一篇将深入两大阶段：Render 和 Commit。

---

### **第三篇：两大阶段（一）：Render Phase 的秘密**

- **引言**
  - 明确 Render Phase 的目标：找出所有变更，并为它们打上"标签"（effectTag）。
  - 强调此阶段是**可中断**的，并且**不会产生任何用户可见的副作用**。
- **`beginWork` 详解**
  - "向下"阶段：从父节点到子节点。
  - 对于一个 Fiber 节点，`beginWork` 做了什么？
    - 与 `current` 树对应的节点进行 Diff 比较。
    - 根据比较结果，决定是否复用子节点，或创建/标记删除子节点。
    - 为产生变更的节点添加 `effectTag`。
    - 返回下一个要处理的子 Fiber 节点。
- **`completeWork` 详解**
  - "向上"阶段：当一个节点没有更多子节点时开始。
  - 对于一个 Fiber 节点，`completeWork` 做了什么？
    - 创建 DOM 实例（对于 HostComponent）。
    - 将子节点的副作用链（effect list）合并到自己的副作用链上。
    - 最终，所有变更都会被收集到根节点的 `effectList` 中。
- **副作用列表（Effect List）**
  - 它是一个单向链表，存储了所有带 `effectTag` 的节点。
  - 这个列表将在 Commit Phase 中被高效地遍历执行。
- **本篇小结**
  - Render Phase 的核心是 Diff 和构建 Effect List。
  - 正是因为此阶段的纯粹性（无副作用），它才能被安全地中断和恢复。
  - 预告下一篇将进入不可中断的 Commit Phase。

---

### **第四篇：两大阶段（二）：Commit Phase 的使命**

- **引言**
  - Commit Phase 的目标：将 Render Phase 计算出的变更一次性、同步地应用到 DOM 上。
  - 强调此阶段是**同步、不可中断**的，以保证 DOM 的一致性。
- **Commit Phase 的三个子阶段**
  - **Before Mutation Phase**
    - 主要任务：处理 `getSnapshotBeforeUpdate` 生命周期方法。
    - 可以在 DOM 变更前读取一些信息。
  - **Mutation Phase**
    - 遍历 Effect List，根据 `effectTag` 执行真正的 DOM 操作：
      - `Placement`: 插入 DOM 节点。
      - `Update`: 更新 DOM 节点的属性。
      - `Deletion`: 删除 DOM 节点。
    - 执行 `componentWillUnmount`。
  - **Layout Phase**
    - 在 DOM 变更完成后执行。
    - 遍历 Effect List，调用 `componentDidMount`、`componentDidUpdate` 和 `useLayoutEffect`。
    - 此阶段结束后，`workInProgress` 树切换为 `current` 树。
- **`useEffect` 的调度**
  - 解释为什么 `useEffect` 是在 Commit Phase 之后**异步**调度的。
  - 它不会阻塞浏览器渲染，适用于大部分副作用场景。
- **本篇小结**
  - Commit Phase 是 Fiber 工作流的终点，负责将变更渲染到屏幕上。
  - 清晰划分三个子阶段，保证了生命周期方法和 Hooks 在正确的时机执行。
  - 预告下一篇将探讨 Fiber 如何实现智能调度。

---

### **第五篇：调度、中断与抢占 (Scheduler, Interruption & Preemption)**

- **引言**
  - 仅有"可中断"的 Render Phase 是不够的。还需要一个"大脑"来决定**何时中断**、**中断后该做什么**。这个大脑就是调度器（Scheduler）。
- **时间分片 (Time Slicing) 与中断机制**
  - React 如何通过 `requestIdleCallback` 的 polyfill (`MessageChannel`) 获取浏览器空闲时间。
  - 工作循环 (Work Loop) 中的 `shouldYield` 函数：它是如何判断当前时间片是否用尽，从而决定是否需要"中断渲染"以将主线程交还给浏览器。
- **优先级的概念与 Lanes 模型**
  - 介绍不同的更新来源及其对应的优先级（Lanes）：
    - `SyncLane`: 同步，不可中断（如受控输入）。
    - `InputContinuousLane`: 连续输入（如拖拽）。
    - `DefaultLane`: 默认。
    - `TransitionLane`: `useTransition` 触发的更新。
    - `IdleLane`: 最低优先级。
- **任务抢占 (Preemption)**
  - 什么是抢占？当一个高优先级更新到来时，React 如何"抢占"并中断正在进行的低优先级渲染。
  - 源码视角：`workLoop` 中如何检查更高优先级的任务并中断当前工作。
  - 中断后发生了什么？React 如何在稍后回来继续之前未完成的工作？
- **并发特性（Concurrent Features）如何工作**
  - `useTransition` 和 `useDeferredValue` 的原理：它们是如何将更新标记为低优先级，从而允许被抢占的。
- **本篇小结**
  - 总结：可中断渲染 (Render Phase) + 调度策略 (Scheduler) = React 并发模式。
  - 抢占是实现流畅用户体验的关键。
  - 预告下一篇将深入到我们最常用的工具——Hooks。

---

### **第六篇：Hooks 是如何与 Fiber 协作的？**

- **引言**
  - Hooks 并非魔法，它的状态和逻辑都附着在 Fiber 节点上。
- **`useState` 的原理**
  - 每个函数组件对应的 Fiber 节点上，有一个 `memoizedState` 属性。
  - 这个属性是一个链表，每个节点存储一个 Hook 的状态。
  - `useState` 首次渲染时，创建链表节点；更新时，按顺序读取链表节点。
  - 解释为什么 Hooks 必须在顶层调用，不能在条件或循环中使用。
- **`useEffect` 的原理**
  - Fiber 节点上还有一个 `updateQueue` 属性。
  - `useEffect` 的 effect 函数和依赖项被存储在 `updateQueue` 中一个特殊的对象上。
  - 在 Commit Phase 的 Layout 阶段结束后，React 会异步调度执行这些 effect。
- **`useReducer`, `useRef`, `useMemo` 等**
  - 简要介绍其他核心 Hooks 也是基于类似的机制，将数据挂载到 Fiber 节点上。
- **本篇小结**
  - 揭开 Hooks 的神秘面纱，其本质是利用 Fiber 节点作为宿主来存储状态和副作用。
  - 加深对 Hooks 使用规则的理解。
  - 预告最后一篇将探讨一些高级主题和实践。

---

### **第七篇：总结与实践：如何利用 Fiber 知识优化应用？**

- **引言**
  - 回顾整个 Fiber 架构的核心思想。
- **实践指导**
  - **善用 `useTransition`**: 对于非紧急的更新（如搜索结果展示），使用 `useTransition` 可以避免阻塞用户输入，极大提升体验。
  - **理解 `memo`, `useMemo`, `useCallback`**: 它们通过 props 比较来跳过 `beginWork` 阶段，是性能优化的重要手段。现在我们更清楚地知道它作用于哪个环节。
  - **避免在 `useLayoutEffect` 中执行耗时操作**: 因为它会阻塞浏览器绘制。
  - **大型列表虚拟化（Virtualization）**: 配合 Fiber 的时间分片，可以实现极高性能的无限滚动列表。
- **展望未来**
  - React Server Components (RSC) 与 Fiber 的关系。
  - Fiber 架构为 React 的未来发展提供了坚实的基础。
- **系列总结**
  - 将所有篇章串联起来，形成一个完整的知识体系。
  - 鼓励读者在开发中带着 Fiber 的思想去思考问题。
