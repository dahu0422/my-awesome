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

### 插入、查找、删除性能对比

- **Map**：底层为哈希表，专为频繁的增删查操作优化，插入、查找、删除的性能都非常高，且不会受到原型链影响。
- **Object**：同样基于哈希表，但属性查找和删除会受到原型链、属性特性等影响，尤其是 `delete` 操作会导致性能下降。

### 遍历性能

- **Map**：遍历顺序就是插入顺序，且遍历速度快（如 `for...of map`、`map.forEach`）。
- **Object**：遍历顺序不保证，需用 `Object.keys/values/entries`，性能略逊。

在现代 JavaScript 引擎中，Map 在插入、查找、删除和遍历大量数据时，性能通常优于 Object，尤其是当键不是字符串时。Object 适合用作结构化数据存储，而 Map 更适合用作高性能的键值对集合。

底层实现上，Map 专为哈希表优化，Object 还涉及原型链和属性特性。因此，推荐在需要频繁操作或键类型多样时使用 Map。

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
