# TypeScript 类型层级

TypeScript 的类型系统有一个清晰的层级结构，理解这个层级对于正确使用类型系统和避免类型错误非常重要。

## 类型层级概述

类型层级从上到下可以这样理解：

```
Top Types (顶层类型)
  ↓
Union Types (联合类型)
  ↓
├─ Primitive Types (原始类型) ─ Literal Types (字面量类型)
│    例如：string → "hello"
│
└─ Object Types (对象类型)
      例如：Animal → Dog
  ↓
Bottom Types (底层类型)
```

类型层级的高低是根据**类型包含的可能值的集合大小**来排序的：

1. **集合越大（包含的可能值越多）→ 层级越高**
2. **集合越小（包含的可能值越少）→ 层级越低**
3. **子集可以赋值给超集** ✅（子类型可以赋值给父类型）
4. **超集不能直接赋值给子集** ❌（父类型不能赋值给子类型）

## Top Types (顶层类型)

顶层类型是所有其他类型的超类型，可以表示任何值。

### `any` 类型

`any` 是最顶层的类型，它**关闭了 TypeScript 的类型检查**。

```ts
let value: any = "hello"
value = 42
value = true
value.foo.bar // 不会报错，但运行时可能出错
```

**特点：**

- 可以赋值给任何类型，任何类型都可以赋值给它
- 跳过所有类型检查，**不推荐使用**，会失去类型安全

### `unknown` 类型

`unknown` 是类型安全的顶层类型，需要先进行类型检查才能使用。

```ts
let value: unknown = "hello"

// ❌ 错误：不能直接使用 unknown 类型
value.toUpperCase()

// ✅ 正确：需要先进行类型检查
if (typeof value === "string") {
  value.toUpperCase() // 类型收窄为 string
}
```

**特点：**

- 可以赋值给任何类型，任何类型都可以赋值给它
- **必须先进行类型检查才能使用**，推荐使用 `unknown` 替代 `any`

**对比 any 和 unknown：**

```ts
// any - 不安全的顶层类型
function processAny(data: any) {
  data.foo.bar // 不会报错，但可能运行时出错
}

// unknown - 安全的顶层类型
function processUnknown(data: unknown) {
  // data.foo.bar // ❌ 错误：需要先检查类型

  if (typeof data === "object" && data !== null && "foo" in data) {
    // 类型收窄后才能使用
    ;(data as { foo: { bar: string } }).foo.bar
  }
}
```

## Bottom Types (底层类型)

底层类型是所有其他类型的子类型，表示"永远不存在的值"。

### `never` 类型

`never` 表示永远不会出现的值的类型。

```ts
// 1. 永远不会返回的函数
function throwError(): never {
  throw new Error("Error")
}

function infiniteLoop(): never {
  while (true) {
    // 永远不会结束
  }
}

// 2. 联合类型的穷尽性检查
type Status = "success" | "error" | "pending"

function handleStatus(status: Status) {
  switch (status) {
    case "success":
      return "ok"
    case "error":
      return "fail"
    case "pending":
      return "waiting"
    default:
      // status 在这里的类型是 never
      const exhaustiveCheck: never = status
      return exhaustiveCheck
  }
}

// 如果添加了新的 status 类型，上面的 default 会报错，提示需要处理新的情况
```

**特点：**

- 任何类型都不能赋值给 `never`（除了 `never` 本身），`never` 可以赋值给任何类型
- 用于表示不可能的情况，常用于穷尽性检查（Exhaustive Check）

**联合类型与 never：**

```ts
// 不可能的交集
type Impossible = string & number // never

// 空联合类型
type Empty = never | never // never
```

## 类型层级关系演示

通过代码示例展示不同层级类型之间的赋值关系，验证类型层级排序：

### 1. 字面量类型 → 原始类型

```ts
// 集合大小："hello" (1个值) < string (无数个值)
type LiteralStr = "hello" // 字面量类型：集合 { "hello" }
type PrimitiveStr = string // 原始类型：集合 { 所有可能的字符串 }

const literal: LiteralStr = "hello"
const primitive: PrimitiveStr = literal // ✅ 字面量可以赋值给原始类型

// 反过来不行
const someString: string = "world"
// const literal2: LiteralStr = someString // ❌ 错误：string 不能赋值给 "hello"
```

### 2. 原始类型 → 联合类型

```ts
// 集合大小：string (无数个值) < string | number (更多值)
const strValue: string = "hello"
const union: string | number = strValue // ✅ 原始类型可以赋值给联合类型

// 反过来不行
const unionValue: string | number = 42
// const str: string = unionValue // ❌ 错误：string | number 不能赋值给 string
```

### 3. 联合类型 → Top Types

```ts
// 集合大小：string | number < unknown (所有类型值)
const unionValue: string | number = "hello"
const anyVal: any = unionValue // ✅ 联合类型可以赋值给 any
const unknownVal: unknown = unionValue // ✅ 联合类型可以赋值给 unknown

// 反过来不行
const unknownType: unknown = "hello"
// const union: string | number = unknownType // ❌ 错误：unknown 不能直接赋值给联合类型
// 因为 unknown 可能是其他类型（如 boolean），需要先进行类型检查
```

### 4. never → 所有类型

```ts
// 集合大小：never (空集) < 所有其他类型
function getNever(): never {
  throw new Error()
}

const neverVal: never = getNever()

// never 可以赋值给任何类型（空集是任何集合的子集）
let str: string = neverVal // ✅ { } ⊆ { 所有字符串 }
let num: number = neverVal // ✅ { } ⊆ { 所有数字 }
let union: string | number = neverVal // ✅ { } ⊆ { 所有字符串 } ∪ { 所有数字 }
let anyVal: any = neverVal // ✅ { } ⊆ { 所有类型值 }
let unknownVal: unknown = neverVal // ✅ { } ⊆ { 所有类型值 }

// 但任何类型都不能赋值给 never（除了 never 本身）
let stringValue: string = "hello"
// let neverVar: never = stringValue // ❌ 错误：{ "hello" } ⊄ { }
```

### 5. 对象类型的层级关系

```ts
// 集合大小：Dog (更具体的对象集合) < Animal (更通用的对象集合)
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string // Dog 比 Animal 多一个属性，更具体
}

const dog: Dog = { name: "Buddy", breed: "Lab" }
const animal: Animal = dog // ✅ 子类型可以赋值给父类型
// 因为 { Dog 的所有可能值 } ⊆ { Animal 的所有可能值 }
// Dog 对象一定有 name 属性，满足 Animal 的要求

// 反过来不行
const animal2: Animal = { name: "Animal" }
// const dog2: Dog = animal2 // ❌ 错误：缺少 breed 属性
// 因为 { Animal 的所有可能值 } ⊄ { Dog 的所有可能值 }
// Animal 对象可能没有 breed 属性，不满足 Dog 的要求
```
