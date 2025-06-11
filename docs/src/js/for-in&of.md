# for...in 与 for...of

## for...in

`for...in` 是 JavaScript 最早用于遍历**对象属性**的语法，它会遍历对象**自身和原型链上**所有**可枚举属性**的键名。

主要用于对象，不推荐用于数组。

```js
const obj = { a: 1, b: 2 }
Object.prototype.c = 3

for (const key in obj) {
  console.log(key) // 输出：a, b, c（包括原型上的 c）
}
```

## for...of

`for...of` 是 ES6 引入的新语法，用于遍历**可迭代对象**（iterable），例如数组、字符串、Set、Map 等，它遍历的是值。

```js
const arr = ["a", "b", "c"]

for (const val of arr) {
  console.log(val) // 输出 a, b, c
}
```

## 为什么对象不能直接使用 for...of

对象不是可迭代对象，没有实现 `[Symbol.iterator]` 方法。

```js
const obj = { a: 1, b: 2 }

for (const item of obj) {
  // ❌ TypeError: obj is not iterable
}
```

可以通过给对象添加自定义的 `[Symbol.iterator]` 方法，使其成为一个可迭代对象。

```js
const person = {
  name: "张三",
  age: 20,
  gender: "male",

  [Symbol.iterator]() {
    // 将对象转换成 `[key, value]`数组
    const entries = Object.entries(this)
    let index = 0

    return {
      // next 返回一个值，控制迭代进度
      next() {
        if (index < entries.length) {
          const [key, value] = entries[index++]
          return { value: [key, value], done: false }
        } else {
          return { done: true }
        }
      },
    }
  },
}

// 依赖 [Symbol.iterator]() 函数返回的迭代器
for (const [key, value] of person) {
  console.log(key, value)
}
```
