# 性能指标

| 指标                    | 说明                                                                                     | 优化方向                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| FCP（首次渲染绘）       | 页面首次渲染出任何内容（如文本、图片、SVG 等）的时间。反映用户第一次看到页面内容的速度。 | 优化服务器响应、减少阻塞资源、使用懒加载、压缩图片和字体等。  |
| LCP（最大内容绘制）     | 页面主视区内最大内容元素渲染完成时间，影响用户"页面加载完成"感知。                       | 优化图片/视频加载、减少主线程阻塞、使用高效缓存策略。         |
| CLS（累计布局偏移）     | 页面加载过程中所有意外布局移动的总和，反映页面视觉稳定性。                               | 为图片/广告等预留空间、避免动态插入内容、使用稳定布局。       |
| TTFB（首字节时间）      | 浏览器请求资源到接收到第一个字节的时间，反映服务器响应速度。                             | 优化后端性能、使用 CDN、减少重定向、压缩服务器响应。          |
| TTI（可交互时间）       | 页面变得完全可交互（用户可点击、输入且页面响应迅速）的时间。                             | 优化 JS 执行、拆分代码、延迟非关键 JS、减少长任务。           |
| TBT（总阻塞时间）       | FCP 和 TTI 之间主线程被任务阻塞超过 50ms 的总时间，衡量加载过程中的"卡顿"。              | 拆分长任务、优化 JS、减少第三方脚本、使用 Web Worker。        |
| Speed Index（速度指数） | 衡量页面内容在可视区域内显示的速度，数值越低越好。                                       | 优化关键渲染路径、减少阻塞资源、提升首屏渲染速度。            |
| FID（首次输入延迟）     | 用户首次与页面交互到浏览器实际响应的时间，反映页面响应速度。                             | 优化 JS 执行、减少主线程阻塞、拆分大任务、减少第三方脚本。    |
| loadEvent（加载事件）   | 页面所有资源加载完成并触发 load 事件的时间。                                             | 减少资源数量、优化资源加载顺序、使用异步/延迟加载非关键资源。 |
