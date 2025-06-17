# box-sizing

box-sizing 是 css 中用来定义元素如何计算其宽度和高度的属性。

常用的属性有 `content-box（默认）` 和 `border-box`

## content-box

元素的宽高只包含 content 区域，不包括 padding 和 border。

元素实际占用宽度 = width + padding + border

元素实际占用高度 = height + padding + border

```css
.box1 {
  box-sizing: content-box; /* 默认 */
  width: 200px;
  padding: 20px;
  border: 5px solid #000;
}
```

box1 实际宽度 = 200 + 40 + 10 = 250px;

## border-box

元素的宽高包含 content、padding、和 border

元素实际占用宽度 = width

元素实际占用高度 = height

padding 和 border 会在 content 区域内挤压

```css
.box2 {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #000;
}
```

box2 实际宽度 = 200px
