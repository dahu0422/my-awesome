# Map 与 Object 的深入对比

## 键的类型：Map 更灵活

在 `Object` 中，键只能是字符串或 Symbol。如果设置一个对象作为键，他会被隐式转换为字符串`"[object object]"`，导致不同对象使用用一个键。

```js
const obj = {}
const key1 = { id: 1 }
const key2 = { id: 2 }

obj[key1] = "value1"
obj[key2] = "value2"

console.log(obj) // { '[object Object]': 'value2' }
```

`Map` 能使用任意类型作为键、包括对象、函数、数字等，且不会发生覆盖的问题。

```js
const map = new Map()
map.set(key1, "value1")
map.set(key2, "value2")

console.log(map.get(key1)) // 'value1'
```

## 键值对的顺序：Map 保证插入顺序

`Object` 无法保证属性的遍历顺序，虽然现代 JS 引擎对数字键做了一定排序优化，但字符串键仍无法绝对顺序保障。

相比之下，`Map` 明确规定了保持**键值对的插入顺序**，在需要顺序遍历时更加可靠。

```js
const map = new Map()
map.set("a", 1)
map.set("b", 2)

for (const [key, val] of map) {
  console.log(key, val) // 顺序输出 a 1 和 b 2
}
```

## 性能：Map 优于 Object（在大量操作时）

当涉及大量键值对的增删查改操作时，`Map` 在绝大多数 JS 引擎中的表现都优于 `Object`。这是因为 `Map` 是专为这种用途优化的数据结构，底层通常使用哈希表实现。

此外，`Map` 的 `.size` 属性可以**立即获取键值对数量**，而 `Object` 需要 `Object.keys(obj).length` 这种额外操作。

```js
const map = new Map()
map.set("a", 1)
console.log(map.size) // 1

const obj = { a: 1 }
console.log(Object.keys(obj).length) // 1
```

## 原型污染问题：Map 更安全

`Object` 的属性继承自 `Object.prototype`，这意味着默认情况下你无法保证对象本身没有被原型链上的属性干扰。例如

```js
const obj = {}
console.log(obj.toString) // function toString() {...}
```

虽然可以通过 `Object.create(null)` 创建一个无原型对象来解决，但使用 Map 则天然不存在这类问题：

```js
const safeMap = new Map()
console.log(safeMap.get("toString")) // undefined，没有继承属性
```

## 序列化能力：Object 更适合 JSON 结构

一个明显的限制是，Map 不能直接被 JSON.stringify() 序列化：

```js
const map = new Map([["a", 1]])
console.log(JSON.stringify(map)) // "{}" —— 丢失数据
```

而 Object 与 JSON 结构天然契合，是接口数据交互的首选格式。

```js
const obj = { a: 1 }
console.log(JSON.stringify(obj)) // '{"a":1}'
```
