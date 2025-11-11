# 基础类型

## 原始类型

原始类型（Primitive Types）对应 JavaScript 中的基本值：

- `string`：表示文本数据。
- `number`：表示整数或浮点数。
- `boolean`：表示布尔值。
- `bigint`：表示任意长度的整数，使用 `n` 结尾字面量。
- `symbol`：表示唯一标识符。
- `undefined`：表示未定义的值。
- `null`：表示空值或无值。

```ts
const userName: string = "Alice"
const userAge: number = 28
const isAdmin: boolean = false
const total: bigint = 9007199254740993n
const uniqueKey: symbol = Symbol("key")
```

## 特殊类型

除了原始类型，TypeScript 还提供了几个在类型系统中具有特殊意义的类型：

- `any`：关闭类型检查，适用于暂时无法确定类型的场景，但应谨慎使用。
- `unknown`：表示未知类型，只能在类型收窄后使用，安全性高于 `any`。
- `void`：常用于没有返回值的函数。
- `never`：表示永远不会发生的值，例如函数抛出异常或无限循环。

```ts
function logMessage(message: unknown): void {
  if (typeof message === "string") {
    console.log(message.toUpperCase())
  }
}

function fail(): never {
  throw new Error("Something went wrong")
}
```

## 字面量类型

字面量类型可以把某个值限定为具体的字面量，而不是宽泛的类型集合。常见的有字符串字面量、数字字面量和布尔字面量。

```ts
type Direction = "north" | "south" | "east" | "west"
type StatusCode = 200 | 404 | 500

function setDirection(dir: Direction) {
  // ...
}

setDirection("north") // ✅
setDirection("up") // ❌ 类型错误
```

字面量类型经常和联合类型、类型别名一起使用，让描述业务状态更加精确。
