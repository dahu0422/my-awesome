# 性能优化

## 网络层面的优化

### 1. 减少请求数量

- 合理合并资源（如 JS/CSS 合并、雪碧图、SVG Sprite）
- 使用 HTTP/2 多路复用，减少连接数
- 懒加载（图片、长列表、路由组件按需加载）
- 预加载/预取（preload、prefetch）关键资源

### 2.减小资源体积

- 代码压缩（JS/CSS/Uglify/Tree Shaking）。
- 图片压缩（WebP、压缩工具、SVG 优化）。
- 使用字体子集、精简第三方库。

### 3. 利用缓存

- 合理设置 HTTP 缓存（Cache-Control、ETag、Last-Modified）
- 利用 Service Worker 做离线缓存和资源更新
- 静态资源加 hash，保证缓存有效性和更新

### 4.CDN 加速

静态资源分发到离用户更近的节点，降低延迟

## 渲染原理层面的优化

### 1. 减少重排（Reflow）和重绘（Repaint）

- 避免频繁操作会影响布局的属性（如 width、height、left、top、margin）。
- 动画优先用 transform、opacity，只触发合成，不引发重排。
- 批量操作 DOM，合并多次修改，使用 DocumentFragment 或虚拟 DOM。
- 避免在动画过程中读取布局信息（如 offsetHeight），防止强制同步布局。

### 2. 优化 CSS 和 JS 的加载顺序

- CSS 放在 `<head>`，防止阻塞渲染。
- JS 脚本加 defer 或 async，避免阻塞页面解析和渲染。
- 拆分大 JS 包，按需加载（如路由懒加载、动态 import）

### 3. 资源优先级管理

- 关键资源有限加载（如首屏 CSS/JS/图片）
- 非关键资源延后加载（如广告、统计脚本）

### 4. 虚拟化渲染

- 长列表、复杂表格采用虚拟滚动技术，只渲染可视区域内容，极大减少 DOM 数量。

### 5. 图片懒加载与占位

- 图片未进入视口时不加载，提升首屏速度。
- 使用低分辨率占位图，减少布局抖动。
