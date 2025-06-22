# 深入两大阶段（一）：Render Phase 的秘密

在上一篇文章中我们了解到，React Fiber 的更新过程分为两大核心阶段：**渲染阶段 (Render Phase)** 和 **提交阶段 (Commit Phase)**。本文将深入第一个阶段，揭开 Render Phase 是如何找出所有变更，并为最终的 DOM 操作做准备的。

## Render Phase 的目标与特性

Render Phase 的核心目标非常纯粹：**找出虚拟 DOM 中的所有变更，并生成一个"副作用列表"（Effect List）**。

它具备以下关键特性：

- **异步可中断**：这是 Fiber 架构的精髓。React 可以在执行过程中随时暂停 Render Phase，响应更高优先级的任务，稍后再回来继续。
- **无副作用**：在整个 Render Phase 中，React 只会进行计算和内存中的操作（构建 `workInProgress` 树），**绝对不会去操作真实的 DOM**。这保证了即使过程被中断，用户也不会看到渲染不完整的 UI。

:::tip 中断是如何发生的？
在每处理完一个 Fiber 节点（一个工作单元）后，React 都会通过一个名为 `shouldYield()` 的函数进行检查。这个函数会判断当前时间片是否已经用完。

后面文章再详细介绍
:::

## `beginWork`：向下的"递"阶段

`beginWork` 是工作循环 (Work Loop) 的第一步，它是一个"向下"递进的过程。从根节点开始，React 会为路径上的每一个 Fiber 节点执行 `beginWork` 函数。

它的核心任务是**进行 Diff 运算**，找出当前节点与其子节点之间的差异。

`beginWork` 的源码是一个巨大的 `switch` 语句，根据 `fiber.tag` 的不同类型，执行不同的协调逻辑。对于我们最关心的 `HostComponent` (如 `<div>`)，其逻辑可以简化如下：

```javascript
// beginWork 函数的高度简化版
function beginWork(current, workInProgress, renderLanes) {
  // ...

  // 根据 fiber.tag 进入不同的处理逻辑
  switch (workInProgress.tag) {
    case HostComponent:
      // 对于 <div>, <p> 等原生 DOM 元素
      return updateHostComponent(current, workInProgress, renderLanes)
    case FunctionComponent:
    // 对于函数组件
    // ...
    // ... 其他 case
  }
}

// updateHostComponent 的核心是协调子节点
function updateHostComponent(current, workInProgress, renderLanes) {
  const type = workInProgress.type // "div"
  const nextProps = workInProgress.pendingProps // 新的 props

  // ... 处理 props ...

  // 【核心】协调子节点
  // 这个函数会 diff 旧的子节点 (current.child) 和新的子节点 (nextProps.children)
  // 并为 workInProgress 创建新的子 Fiber 节点
  reconcileChildren(current, workInProgress, nextProps.children, renderLanes)

  // 返回创建的第一个子节点，作为下一个工作单元
  return workInProgress.child
}
```

`reconcileChildren` 函数是 Diffing 算法的体现。它会比较后决定：

- 如果子节点可复用，就克隆一个 Fiber 节点并标记为更新 (`Update`)。
- 如果出现新的子节点，就创建一个新的 Fiber 节点并标记为插入 (`Placement`)。
- 如果某个子节点消失了，就将旧的 Fiber 节点标记为删除 (`Deletion`)。

这些标记 (`Placement`, `Update`, `Deletion`) 就是**副作用标签 (`effectTag`)**，它们被记录在 Fiber 节点上。

## `completeWork`：向上的"归"阶段

当 `beginWork` 执行到一个没有子节点的叶子节点时，"递"的过程就结束了。此时，工作循环会进入 `completeWork` 阶段，开始"向上"归并。

它的核心任务有两个：

1.  **创建 DOM 实例**：对于 `HostComponent` 类型的 Fiber，正是在 `completeWork` 阶段创建了真实的 DOM 元素。
2.  **构建副作用列表**：将当前 Fiber 节点上有 `effectTag` 的、以及其所有子孙节点上有 `effectTag` 的节点，串成一个高效的单向链表。

同样，`completeWork` 也是一个根据 `fiber.tag` 进行不同处理的 `switch` 语句。

```javascript
// completeWork 函数的高度简化版
function completeWork(current, workInProgress, renderLanes) {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case HostComponent: {
      // ...

      // 【核心一：创建 DOM】
      // 如果 workInProgress 对应的 DOM 节点不存在，就创建它
      const instance = createInstance(workInProgress.type, newProps, ...);
      // 将子 DOM 节点 append 到父 DOM 节点上
      // 注意：这里只是在内存中构建 DOM 树，并不会插入到页面中
      appendAllChildren(instance, workInProgress);
      workInProgress.stateNode = instance;

      // 【核心二：构建副作用列表】
      // 如果 workInProgress 上有副作用标签，
      // 将它添加到副作用链表的末尾
      if (workInProgress.effectTag !== NoEffect) {
        // ... 将 workInProgress 添加到链表中 ...
      }
      return null;
    }
    // ... 其他 case
  }
}
```

在 `completeWork` 阶段，每个拥有 `effectTag` 的 Fiber 节点会被串联起来。父节点的 `completeWork` 会负责将子节点收集到的副作用链表，连接到自己这里，最终在根节点形成一条完整的链表。

## 本篇小结

Render Phase 是一个纯粹的计算阶段。它通过 `beginWork` 的"递进"和 `completeWork` 的"归并"，完成了两件大事：

1.  **Diffing**：找出所有变更，并为需要操作的 Fiber 节点打上 `effectTag`。
2.  **构建 Effect List**：生成一条只包含有副作用的节点的链表，供下一阶段使用。

正是因为这个阶段的纯粹和可中断性，React 才得以实现并发更新。

在下一篇文章中，我们将进入不可中断的 Commit Phase，看看 React 是如何高效地执行这个副作用列表，将变更渲染到屏幕上的。
