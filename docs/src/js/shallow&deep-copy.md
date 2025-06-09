# 深浅拷贝

## 浅拷贝

浅拷贝是指只复制对象的第一层属性。如果属性是基本类型，直接复制值；如果属性是引用类型（如对象、数组），则复制引用地址，不会复制引用对象本身。

### 常见实现方式

1. `Object.assign(target, source)`
2. 扩展运算符 `{...obj}`
3. `Array.prototype.slice()`

## 深拷贝

深拷贝会递归复制对象的所有层级，无论多少层嵌套，都会新建一份数据。深拷贝后的新对象与原对象完全独立，互不影响。

### 常见实现方式

#### 1. `JSON.parse(JSON.stringify(obj))`

**问题：**

- 无法拷贝函数、undefined、Symbol、RegExp、Date 等特殊对象；

```js
const obj = {
  num: 1,
  str: "hello",
  func: function () {
    return "I am a function"
  },
  undef: undefined,
  sym: Symbol("id"),
  reg: /abc/gi,
  date: new Date(),
}

const copy = JSON.parse(JSON.stringify(obj))

console.log(copy)
// 输出：{ num: 1, str: 'hello' }
// func、undef、sym、reg、date 属性都丢失或类型被改变

console.log(copy.func) // undefined
console.log(copy.undef) // undefined
console.log(copy.sym) // undefined
console.log(copy.reg) // "/abc/gi"（变成字符串）
console.log(copy.date) // "2024-06-10T08:00:00.000Z"（变成字符串）
```

- 会丢失对象的原型链；

```js
function Person() {
  this.name = "Tom"
}
Person.prototype.sayHi = function () {
  console.log("Hi")
}

const tom = new Person()
const copy = JSON.parse(JSON.stringify(tom))
console.log(copy.sayHi) // undefined
console.log(Object.getPrototypeOf(copy)) // Object.prototype
```

- 循环引用会报错；

```js
const obj = {}
obj.self = obj
try {
  JSON.parse(JSON.stringify(obj))
} catch (e) {
  console.log(e) // TypeError: Converting circular structure to JSON
}
```

#### 2. 递归遍历手动拷贝

**实现思路：**

1. 递归遍历：遇到对象或数组时递归拷贝，基本类型直接返回。
2. 类型判断：区分对象、数组、Date、RegExp、Map、Set、Symbol、函数等类型，分别处理。
3. 循环引用：用 Map 或 WeakMap 记录已拷贝对象，防止死循环。
4. 保留 undefined、Symbol、函数。
5. 保留原型链。

```js
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null) return null
  if (typeof obj !== "object") return obj // 基本类型直接返回

  // 处理循环引用
  if (hash.has(obj)) return hash.get(obj)

  // 处理特殊对象
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)
  if (obj instanceof Map) {
    const result = new Map()
    hash.set(obj, result)
    obj.forEach((v, k) => result.set(deepClone(k, hash), deepClone(v, hash)))
    return result
  }
  if (obj instanceof Set) {
    const result = new Set()
    hash.set(obj, result)
    obj.forEach((v) => result.add(deepClone(v, hash)))
    return result
  }

  // 创建新对象，保留原型
  const cloneObj = Array.isArray(obj)
    ? []
    : Object.create(Object.getPrototypeOf(obj))
  hash.set(obj, cloneObj)

  // 拷贝自身属性（包括 symbol 和不可枚举属性）
  const keys = Reflect.ownKeys(obj)
  for (const key of keys) {
    cloneObj[key] = deepClone(obj[key], hash)
  }

  return cloneObj
}
```

#### 3. 三方库 lodash - cloneDeep

lodash 的 `cloneDeep` 方法可以完美处理大多数深拷贝场景，包括特殊对象、循环引用、原型链等问题，实际开发中推荐使用。
