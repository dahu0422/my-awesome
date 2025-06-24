# CSS 属性值计算过程

CSS 属性值的计算过程遵循特定的规则和顺序，这个过程被称为 **CSS 级联（Cascade）**。当多个样式规则作用于同一个元素时，浏览器需要确定最终应用哪个样式值。

## 级联顺序

CSS 属性值的计算按照以下顺序进行：

1. **用户代理样式表（User Agent Stylesheet）**

用户代理样式表是浏览器内置的默认样式，为 HTML 元素提供基础样式，确保页面有基本的可读性。所有浏览器都有这些默认样式，但可能略有差异。它们的优先级最低（普通声明），且不能被用户或开发者完全禁用。

浏览器默认样式示例：

```css
/* 浏览器默认样式示例 */
body {
  margin: 8px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
h1 {
  font-size: 2em;
  margin: 0.67em 0;
}
p {
  margin: 1em 0;
}
```

2. **用户样式表（User Stylesheet）**

用户样式表是用户为了改善浏览体验而自定义的 CSS 样式，用于覆盖网站样式，满足个人需求，如可访问性改进、个性化定制等。它们的优先级高于作者样式表（普通声明），通常使用 `!important` 确保生效，可以影响所有网站。

用户自定义样式示例：

```css
/* 用户自定义样式 */
body {
  font-size: 18px !important; /* 增大字体 */
  line-height: 1.6 !important; /* 增加行高 */
}
.advertisement {
  display: none !important; /* 隐藏广告 */
}
```

3. **作者样式表（Author Stylesheet）**

作者样式表是网站开发者编写的 CSS 样式，用于定义网站的外观和布局。它们的优先级高于用户代理样式表，但低于用户样式表（普通声明）。作者样式表包含外部样式表、内部样式表和行内样式三种形式。

作者样式表示例：

```css
/* 外部样式表 */
.header {
  background-color: #333;
  color: white;
  padding: 1rem;
}

/* 内部样式表 */
<style>
.content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

/* 行内样式 */
<div style="color: red; font-weight: bold;">重要信息</div>
```

## 优先级计算

当多个规则作用于同一元素时，按以下优先级排序：

**!important 声明优先级**

1. **用户代理的 !important 声明**
2. **用户的 !important 声明**
3. **作者的 !important 声明**

**普通声明优先级**

1. **作者样式表**
2. **用户样式表**
3. **用户代理样式表**

## 选择器特异性（Specificity）

在相同优先级级别内，选择器的特异性决定哪个规则生效。CSS 权重通常用四个等级来表示：

| 选择器类型           | 权重值（从高到低） |
| -------------------- | ------------------ |
| 行内样式             | 1,0,0,0            |
| ID 选择器            | 0,1,0,0            |
| 类、伪类、属性选择器 | 0,0,1,0            |
| 元素、伪元素选择器   | 0,0,0,1            |

**特异性计算规则**

- 权重从左到右比较，前面位数大的优先级高
- 继承的样式、通配符选择器权重为 0
- !important 并不改变权重，但会让样式强制生效

**特异性示例**

```css
/* 特异性：0,0,0,1 */
p {
  color: red;
}

/* 特异性：0,0,1,0 */
.class {
  color: blue;
}

/* 特异性：0,1,0,0 */
#id {
  color: green;
}

/* 特异性：0,0,1,1 */
p.class {
  color: yellow;
}
```

## 声明顺序

当特异性和优先级都相同时，**后声明的规则**会覆盖先声明的规则：

```css
p {
  color: red;
}
p {
  color: blue;
} /* 最终生效 */
```

## 继承机制

某些属性会从父元素继承到子元素：

```css
body {
  color: red;
}
/* 所有子元素都会继承红色文字，除非被覆盖 */
```
