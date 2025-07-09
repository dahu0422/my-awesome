# JavaScript 数据类型

## 原始类型 Primitive Types

- Number：整数和浮点数，如 42、3.14
- String：文本数据，如 "hello"
- Boolean：逻辑值 true/false
- Null：表示空值（null）
- Undefined：未定义值（undefined）
- Symbol（ES6+）：唯一且不可变的值
- BigInt（ES2020+）：大整数，如 123n

## 对象类型 Object Types

- Object：普通对象 {}
- Array：数组 []
- Function：函数 function(){}
- Date：日期时间
- RegExp：正则表达式
- Map/Set（ES6+）
- WeakMap/WeakSet（ES6+）

## 原始类型 VS 对象类型

### 存储方式

- 原始类型：直接存储在栈内存中，赋值和传递时是值的拷贝，互不影响；
- 对象类型：存储在堆内存中，变量保存的是对象的引用地址。赋值和传递时是引用的拷贝，多个变量可能指向同一个对象。

### 可变性

- 原始类型：不可变，一旦创建，值不能被改变；
- 对象类型：可变，对象的属性和内容可以被修改；

## 数据类型检测方法

### typeof 操作符

```js
typeof 42 // "number"
typeof "hello" // "string"
typeof true // "boolean"
typeof undefined // "undefined"
typeof Symbol() // "symbol"
typeof 123n // "bigint"
typeof {} // "object"
typeof [] // "object"
typeof null // "object" (历史遗留bug)
typeof function () {} // "function"
```

### instanceof 操作符

用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。不能用于原始类型的检测

```js
[] instanceof Array;    // true
{} instanceof Object;   // true
new Date() instanceof Date; // true
```

### Object.prototype.toString.call()

JavaScript 每个对象都有一个隐藏的 `[[Class]]` 内部属性（ES6+ 规范中称为 `@@toStringTag`），它标识了对象的类型。`Object.prototype.toString` 的工作就是返回这个属性的字符串表示，格式为 `[object [[Class]]]`。

`.call()`作用：

- 改变 this 指向：通过 .call() 将方法内部的 this 强制指向我们要检测的对象
- 触发原始行为：绕过对象可能重写的 toString 方法，直接调用最原始的 Object.prototype.toString
- 自动装箱：对原始值（如 123, "abc"）会自动转换成包装对象

```js
Object.prototype.toString.call(42) // "[object Number]"
Object.prototype.toString.call("hello") // "[object String]"
Object.prototype.toString.call(true) // "[object Boolean]"
Object.prototype.toString.call(null) // "[object Null]"
Object.prototype.toString.call(undefined) // "[object Undefined]"
Object.prototype.toString.call([]) // "[object Array]"
Object.prototype.toString.call({}) // "[object Object]"
Object.prototype.toString.call(function () {}) // "[object Function]"
```

自定义对象默认返回 `"[object Object]"`，但可以通过 `Symbol.toStringTag` 自定义

```js
const obj = {
  [Symbol.toStringTag]: "MyCustomType",
}
Object.prototype.toString.call(obj) // "[object MyCustomType]"
```

### 专用检测方法

- `Array.isArray()` 是否为数组
- `Number.isNaN()` 是否为 NaN
- `Number.isInteger()` 是否为整数

## 判断两个对象相等

### 引用相等

使用 `===` 或 `==` 判断引用是否相同，即两个变量是否指向同一个对象；

```js
const a = { x: 1 }
const b = { x: 1 }
const c = a

a === b // false（不是同一个引用）
a === c // true（同一个引用）
```

### 浅层属性比较

如果要判断两个对象的属性值是否相等（只比较第一层），可以使用如下方法

```js
function shallowEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) return false
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false
  }
  return true
}

shallowEqual({ x: 1, y: 2 }, { x: 1, y: 2 }) // true
shallowEqual({ x: 1 }, { x: 1, y: 2 }) // false
```

### 深度比较

如果对象嵌套了更多层级，需要递归比较每一层的属性

```js
function deepEqual(a, b) {
  if (a === b) return true
  if (typeof a !== "object" || typeof b !== "object" || a == null || b == null)
    return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (let key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false
  }
  return true
}

deepEqual({ x: 1, y: { z: 2 } }, { x: 1, y: { z: 2 } }) // true
deepEqual({ x: 1 }, { x: 1, y: 2 }) // false
```
