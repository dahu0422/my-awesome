# Virtual List 虚拟列表

虚拟列表是一种前端性能优化技术，主要用于高性能地渲染大量列表数据。

当列表数据非常多时，如果一次性将所有数据都渲染到页面上，会导致浏览器卡顿、内存占用高、滚动不流畅等问题。

虚拟列表的做法是：

- 只渲染可视区域内的少量元素；
- 随着用户滚动，动态地复用和替换这些元素，始终只渲染"看得见"的部分；
- 对于不可见的部分，不进行实际的 DOM 渲染，只是用占位的方式撑起滚动条

优点：大幅减少 DOM 节点数量，提到渲染性能，滚动流程，内存占用低。

常见应用场景：长列表（比如聊天记录、商品列表、评论区等）、表格组件（大数据量的表格）

```txt
|---------------------------|
| 只渲染可见的10条数据      |
|---------------------------|
| ...（未渲染的部分）        |
|---------------------------|
| 总高度撑起滚动条           |
|---------------------------|
```

## 列表项高度固定虚拟列表

核心思路：

1. 用一个容器包裹所有内容，通过设置容器的高度来撑起滚动条；
2. 只渲染可视区域内的列表项，其余的用空白占位撑起滚动条；
3. 监听滚动事件，根据滚动位置动态计算和渲染可见的数据片段；

```html
<div id="container" style="height:400px;overflow:auto;position:relative;">
  <!-- 撑起滚动条，不显示内容 -->
  <div id="phantom" style="position:absolute; width: 100%;"></div>
  <!-- 只渲染一小段数据，通过 transform 放到正确位置 -->
  <div id="list"></div>
</div>
```

```js
const itemHeight = 40 // 每项高度
const total = 1000 // 总条数
const visibleCount = Math.ceil(400 / itemHeight) // 可视区域容纳的条数
const buffer = 5 // 缓冲区, 防止滚动太快白屏

const container = document.getElementById("container")
const list = document.getElementById("list")
const phantom = document.getElementById("phantom")

// 计算总高度
phantom.style.height = total * itemHeight + "px"

function render() {
  const scrollTop = container.scrollTop
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer) // 起始索引
  const end = Math.min(
    total,
    Math.floor(scrollTop / itemHeight) + visibleCount + buffer
  ) // 结束索引

  // 生成可见项
  let html = ""
  for (let i = start; i < end; i++) {
    html += `<div style="height:${itemHeight}px;line-height:${itemHeight}px;">Item ${i}</div>`
  }
  list.innerHTML = html
  list.style.transform = `translateY(${start * itemHeight}px)`
}

// 初始化
render()

// 监听滚动事件
container.addEventListener("scroll", render)
```

## 列表项高度不固定虚拟列表

核心思路：

1. 只渲染可视区域及前后 buffer 区域的列表项，其余项不渲染，极大减少 DOM 数量，提升性能；
2. 每次渲染后，动态测量每个已渲染项的真实高度，并记录到 `heights` 数组中；
3. 通过累加每项高度，维护每一项的累积偏移量（offsets）即每项距离列表顶部的像素距离；
4. 滚动时，利用二分法查找在 offsets 中快速定位第一个出现可视区域的项；
5. 只渲染可见及 buffer 区域的项，并用 transform:translateY(...)把渲染内容放到正确的垂直位置，保持视觉上的连贯性；
6. 用一个不可见的"展位元素"撑起整个滚动条，让滚动条行为与真实列表一致；
7. 如果测量到某项高度发生变化，自动修正 heights 和 offsets 并重新渲染，保证显示和滚动条的准确性；

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>virtual list height not fixed</title>
    <style>
      #container {
        height: 400px;
        width: 320px;
        border: 1px solid #ccc;
        overflow: auto;
        position: relative;
      }

      #phantom {
        width: 100%;
        opacity: 0;
      }

      #list {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        will-change: transform;
      }

      .item {
        box-sizing: border-box;
        border-bottom: 1px solid #eee;
        padding: 8px;
        background: #fff;
        font-size: 15px;
      }
    </style>
  </head>

  <body>
    <div id="container">
      <div id="phantom"></div>
      <div id="list"></div>
    </div>
  </body>

  <script>
    const total = 1000
    const buffer = 5
    const containerHeight = 400

    // 生成模拟数据（内容行数随机，导致高度不等）
    const data = Array.from({ length: total }, (_, i) => {
      const lines = Math.floor(Math.random() * 8) + 1
      return `消息 ${i}<br>${"内容内容内容 ".repeat(lines)}`
    })

    // DOM
    const container = document.getElementById("container")
    const phantom = document.getElementById("phantom")
    const list = document.getElementById("list")

    // 记录每项高度和累积偏移量
    let heights = new Array(total).fill(40) // 初始估算高度
    let offsets = new Array(total + 1).fill(0)

    // 计算 offsets：从 0 到 total 的累加高度
    function updateOffsets() {
      offsets[0] = 0
      for (let i = 1; i <= total; i++) {
        offsets[i] = offsets[i - 1] + heights[i - 1]
      }
    }

    // 二分查找第一个可见项：在当前滚动位置 scrollTop 下，第一个"出现在可视区"的列表项索引
    function findStartIndex(scrollTop) {
      let left = 0,
        right = total
      while (left < right) {
        let mid = (left + right) >> 1
        if (offsets[mid] < scrollTop) left = mid + 1
        else right = mid
      }
      return Math.max(0, left - buffer)
    }

    // 核心逻辑
    // 1. 计算可视区能显示多少项
    // 2. 渲染
    // 3. 渲染后测量实际高度
    // 4. 重新渲染，防止高度变化导致错位
    function render() {
      // 计算可视区能显示多少项
      const scrollTop = container.scrollTop
      const start = findStartIndex(scrollTop) // 开始索引
      let end = start // 结束索引
      let acc = offsets[start] // 累加高度

      // 累加高度小于可视区高度 + 缓冲区则继续累加，end 不断后移
      while (end < total && acc < scrollTop + containerHeight + buffer * 100) {
        acc += heights[end]
        end++
      }

      // 渲染
      let html = ""
      for (let i = start; i < end; i++) {
        html += `<div class="item" data-index="${i}">${data[i]}</div>`
      }
      list.innerHTML = html
      list.style.transform = `translateY(${offsets[start]}px)`
      phantom.style.height = `${offsets[total]}px`

      // 渲染后测量实际高度
      requestAnimationFrame(() => {
        const children = list.children
        let changed = false
        for (let i = 0; i < children.length; i++) {
          const idx = start + i
          const h = children[i].offsetHeight
          if (heights[idx] !== h) {
            heights[idx] = h
            changed = true
          }
        }
        if (changed) {
          updateOffsets()
          // 重新渲染，防止高度变化导致错位
          render()
        }
      })
    }

    // 事件绑定
    container.addEventListener("scroll", render)

    // 初始化
    updateOffsets()
    render()
  </script>
</html>
```

## 开源解决方案

虚拟列表作为前端性能优化的重要手段，在社区中有许多成熟的开源实现，以下是 Vue3 和 React 生态中最常用的虚拟列表库：

### Vue3 生态

- **[vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller)**

  - 特点：支持动态高度、表格、横向滚动、无限加载等，API 简单易用，社区活跃。
  - 适用场景：大数据量的列表、表格、聊天窗口等。
  - 安装：`npm install vue-virtual-scroller`
  - 使用示例：
    ```vue
    <template>
      <virtual-scroller :items="items" :item-height="50">
        <template #default="{ item }">
          <div>{{ item.text }}</div>
        </template>
      </virtual-scroller>
    </template>
    ```

- **[v-vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list)**
  - 特点：轻量、性能优异，支持动态高度，兼容 Vue2/Vue3。
  - 适用场景：长列表、评论区、消息流等。

### React 生态

- **[react-window](https://github.com/bvaughn/react-window)**

  - 特点：体积小、性能高，支持固定/动态高度和宽度，API 简洁。
  - 适用场景：大数据量的表格、列表、网格等。
  - 安装：`npm install react-window`
  - 使用示例：

    ```jsx
    import { FixedSizeList as List } from "react-window"
    ;<List height={400} itemCount={1000} itemSize={35} width={300}>
      {({ index, style }) => <div style={style}>Row {index}</div>}
    </List>
    ```

- **[react-virtualized](https://github.com/bvaughn/react-virtualized)**
  - 特点：功能丰富，支持列表、表格、无限加载、窗口化等，适合复杂场景。
  - 适用场景：需要虚拟化的表格、列表、瀑布流等。

这些库都经过大量生产环境验证，推荐在实际项目中优先选用。
