# DocumentFragment（DOM Fragment）详解

## 什么是 DocumentFragment？

`DocumentFragment` 是一种轻量级的 DOM 容器节点，本身不属于主 DOM 树。它可以像普通节点一样添加子节点，但这些子节点不会立即渲染到页面上。

**核心特性：**

- 对 fragment 的操作不会引发页面重排和重绘（reflow/repaint）。
- 适合批量构建和插入节点，提升性能。
- 一旦将 fragment 插入到页面，fragment 本身会被销毁，子节点会被"搬运"到目标位置。

## 为什么要用 DocumentFragment？

在需要批量插入大量 DOM 节点时，频繁操作主 DOM 会导致页面多次回流和重绘，影响性能。DocumentFragment 允许你在内存中构建好所有节点，最后一次性插入页面，大幅减少性能损耗。

## 常见用法对比

### 1. 直接多次操作 DOM（性能差）

```js
const container = document.querySelector(".container")
for (let i = 0; i < 10000; i++) {
  const div = document.createElement("div")
  div.className = "item"
  div.textContent = `Item ${i}`
  container.appendChild(div) // 每次都操作主 DOM
}
```

### 2. 字符串拼接后一次性 innerHTML（性能较好）

```js
const container = document.querySelector(".container")
let html = ""
for (let i = 0; i < 10000; i++) {
  html += `<div class="item">Item ${i}</div>`
}
container.innerHTML = html // 只操作一次主 DOM
```

### 3. 使用 DocumentFragment（性能最佳，结构安全）

```js
const container = document.querySelector(".container")
const fragment = document.createDocumentFragment()
for (let i = 0; i < 10000; i++) {
  const div = document.createElement("div")
  div.className = "item"
  div.textContent = `Item ${i}`
  fragment.appendChild(div)
}
container.appendChild(fragment) // 只操作一次主 DOM
```

## Vue2.x 中的 DocumentFragment 应用

在 Vue2.x 渲染真实 DOM 的过程中，DocumentFragment 被大量用作中间层，主要目的是提升批量插入节点时的性能。

**典型场景：**

- v-for 渲染大量子节点时，先将节点批量插入 fragment，最后整体插入页面，避免频繁操作主 DOM。
- slot 返回多个元素、组件挂载阶段的真实 DOM 构建等，都会用 fragment 承载。

### 为什么 Vue2.x 使用 DocumentFragment？

1. **性能优化需求**

   - 批量插入 DOM 节点时，使用 DocumentFragment 可以避免频繁触发页面重排和重绘。
   - 特别是在 v-for 渲染大量列表、动态组件等场景下，性能提升明显。

2. **单根节点限制的解决方案**

   - Vue2.x 要求组件模板必须有且只有一个根节点（单根节点限制）。
   - 这个限制源于虚拟 DOM 的 diff 算法设计。
   - 但在内部处理多节点时（如 v-for、slot），需要一种机制来批量处理这些节点。

3. **编译优化**
   - 在模板编译阶段，需要一种机制来临时存储和批量处理节点。
   - DocumentFragment 提供了理想的解决方案。

## Vue3 为什么不再需要 Fragment？

### 1. 支持多根节点模板（Fragment 作为原生特性）

- **模板自由**：Vue3 允许模板有多个根节点（即 Fragment），这是官方支持的特性。
  ```html
  <template>
    <div>A</div>
    <div>B</div>
    <!-- 合法，无需包裹父节点 -->
  </template>
  ```
- **显式优化**：开发者可以显式使用多根节点，避免不必要的 DOM 包裹，减少渲染开销。

### 2. 虚拟 DOM 的扁平化优化

- **Patch Flag 机制**：Vue3 的虚拟 DOM 在编译时会标记动态节点（如 `1 /* TEXT */`），在 diff 过程中可以直接跳过静态节点。多根节点场景下，每个根节点可以独立追踪变化，无需额外的 Fragment 包裹。
- **Block Tree 结构**：Vue3 将模板划分为动态区块（Block），每个区块内部通过数组管理子节点。多根节点天然适合这种结构，无需像 Vue2 那样强制合并为一个根。

### 3. 编译器生成的代码更简洁

- Vue3 的编译器会直接生成包含多个根节点的虚拟 DOM 数组，例如：
  ```js
  // 编译后的渲染函数
  return [_createVNode("div", "A"), _createVNode("div", "B")]
  ```
- 而 Vue2 需要生成类似：
  ```js
  return _createVNode("fragment", null, [child1, child2])
  ```

### 4. Vue3 中"不用 Fragment"的本质

- **不是完全移除**：Vue3 仍然有 Fragment 的概念（如 `<template>` 包裹的多节点），但不再需要编译器隐式生成 Fragment 来解决单根限制，因为多根节点已是合法输入。
- **性能提升**：省去了不必要的 Fragment 节点，减少了虚拟 DOM 的层级和 diff 成本。

### 5. 对比示例

**Vue2 处理多节点：**

```html
<template>
  <div v-if="ok">A</div>
  <div>B</div>
</template>
```

编译后：

```js
// 隐式包裹 Fragment
return _createVNode("fragment", null, [
  ok ? _createVNode("div", "A") : null,
  _createVNode("div", "B"),
])
```

**Vue3 处理多节点：**

```html
<template>
  <div v-if="ok">A</div>
  <div>B</div>
</template>
```

编译后：

```js
// 直接返回数组
return [ok ? _createVNode("div", "A") : null, _createVNode("div", "B")]
```
