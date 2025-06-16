# Virtual List 虚拟列表

虚拟列表是一种前端性能优化技术，主要用于高性能地渲染大量列表数据。

当列表数据非常多时，如果一次性将所有数据都渲染到页面上，会导致浏览器卡顿、内存占用高、滚动不流畅等问题。

虚拟列表的做法是：

- 只渲染可视区域内的少量元素；
- 随着用户滚动，动态地复用和替换这些元素，始终只渲染“看得见”的部分；
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

## Easy Demo 实现列表项高度固定虚拟列表

核心思路

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
