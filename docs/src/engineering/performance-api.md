# Performance API

[Performance API](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance) 是浏览器原生提供的一套接口，用于测量和采集网页加载过程中的各种关键性能指标。它可以帮助前端开发者更深入地了解页面渲染、资源加载、交互响应等阶段的耗时，并为性能优化提供数据依据。

## 常用 Performance API

- `performance.now` 获取高精度的时间戳，相对于页面加载起点；
- `performance.getEntriesByType(type)` 获取某类性能条目，如 `navigation`、`paint`、`resource` 等；
- `performanceObserver` 用于监听性能指标的变化，如 FCP、LCP、CLS 等；

## 性能埋点（原生 JS）

### 1. 获取导航性能指标

```js
window.addEventListener("load", () => {
  const nav = performance.getEntriesByType("navigation")[0]
  if (nav) {
    const metric = {
      type: "navigation",
      ttfb: nav.responseStart - nav.requestStart,
      domInteractive: nav.domInteractive,
      domComplete: nav.domComplete,
      loadEventEnd: nav.loadEventEnd,
      url: location.href,
      ua: navigator.userAgent,
      ts: Date.now(),
    }
    reportPerformance(metric)
  }
})
```

### 2. 使用 PerformanceObserver 监听关键指标

```js
const observer = new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    const metric = {
      type: entry.entryType,
      name: entry.name,
      value: entry.startTime || entry.value,
      url: location.href,
      ua: navigator.userAgent,
      ts: Date.now(),
    }
    reportPerformance(metric)
  }
})

observer.observe({ type: "paint", buffered: true }) // FP, FCP
observer.observe({ type: "largest-contentful-paint", buffered: true }) // LCP
observer.observe({ type: "layout-shift", buffered: true }) // CLS
```

### 3. 数据上报逻辑

```js
function reportPerformance(data) {
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/perf", JSON.stringify(data))
  } else {
    fetch("/api/perf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    })
  }
}
```

### 4. 页面卸载清理

```js
window.addEventListener("beforeunload", () => {
  if (observer) observer.disconnect()
})
```
