# Generics 泛型

泛型（Generics）是 TypeScript 中强大的类型系统特性，允许在定义函数、接口、类型别名和类时使用类型参数（type parameter），从而提高代码的可重用性和类型安全性。

泛型通常以 `<T>` 的形式出现，`T` 作为类型占位符，在具体使用时会被实际的类型替换。

在没有泛型的情况下，如果想创建一个可以处理多种类型的函数，可能需要使用 `any` 类型，但这会失去类型检查的优势：

```typescript
// 不使用泛型 - 失去类型安全
function identity(value: any): any {
  return value
}
const result = identity("hello")
// result 的类型是 any，失去了类型信息

// 使用泛型 - 保持类型安全
function identity<T>(value: T): T {
  return value
}
const result = identity("hello")
// result 的类型是 "hello"（字面量类型），保持了完整的类型信息
```

## 泛型基础使用

### 在函数中使用泛型

函数中使用泛型是最常见的用法，通过在函数名后添加类型参数列表 `<T>` 来定义泛型函数：

```typescript
function identity<T>(value: T): T {
  return value
}
// 显式指定类型参数
let output1 = identity<number>(1) // 类型为 number
// 依赖类型推断（推荐，代码更简洁）
let output2 = identity("hello") // 类型为 "hello"（字面量类型）

// 声明多个类型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second]
}

// 结合 keyof 约束类型参数，确保类型安全
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const person = { name: "Alice", age: 30 }
const name = getProperty(person, "name") // 类型为 string
const age = getProperty(person, "age") // 类型为 number
// getProperty(person, "email") // ❌ 编译错误：不存在该属性
```

### 在接口中使用泛型

接口中可以使用泛型来定义可复用的类型结构：

```typescript
// 泛型函数接口
interface GenericIdentityFn<T> {
  (arg: T): T
}

// 键值对接口，使用多个类型参数
interface KeyValuePair<K, V> {
  key: K
  value: V
}

let stringIdentity: GenericIdentityFn<string> = identity
let pair1: KeyValuePair<string, number> = { key: "age", value: 30 }
```

#### 泛型接口的实际应用

泛型接口在实际项目中最常见的应用是 API 响应类型的定义：

```typescript
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 用户数据响应类型
type UserResponse = ApiResponse<{ id: number; name: string }>

// 列表数据响应类型
type ListResponse = ApiResponse<Array<{ id: number; title: string }>>
```

### 在类型别名中使用泛型

类型别名中的泛型常用于创建可复用的工具类型：

```typescript
type Factory<T> = T | number | string

// 常用工具类型示例
type Nullable<T> = T | null
type Optional<T> = T | undefined
type Maybe<T> = T | null | undefined

// 使用示例
type StringOrNumber = Factory<string> // 类型为 string | number（TypeScript 自动去重）
type UserId = Nullable<number> // 类型为 number | null
```

类型别名中的泛型本质上就是一个接受类型参数的函数，可以类比为函数的概念：

```typescript
// TypeScript 类型别名
type Factory<T> = T | number | string

// 伪代码等价形式（仅用于理解概念）
function Factory(typeArg) {
  return typeArg | number | string
}
```

### 在类中使用泛型

类中使用泛型可以创建可复用的数据结构，最典型的应用是容器类：

```typescript
class Stack<T> {
  private items: T[] = []

  push(item: T): void {
    this.items.push(item)
  }

  pop(): T | undefined {
    return this.items.pop()
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }
}

// 使用时指定具体类型
const numberStack = new Stack<number>()
numberStack.push(1)
numberStack.push(2)
const num = numberStack.pop() // 类型为 number | undefined

const stringStack = new Stack<string>()
stringStack.push("hello")
```

## 泛型约束 extends

泛型约束使用 `extends` 关键字来限制类型参数必须符合某些条件，从而在泛型函数内部可以使用这些约束的属性或方法：

```typescript
// 约束 T 必须是对象类型
function getKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>
}

// 约束 T 必须有 length 属性
interface Lengthwise {
  length: number
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length)
  return arg
}
logLength("hello") // ✅ string 类型有 length 属性
logLength([1, 2, 3]) // ✅ array 类型有 length 属性
// logLength(123) // ❌ 编译错误：number 类型没有 length 属性
```

### 使用 keyof 进行约束

结合 `keyof` 操作符可以确保类型参数必须是对象的键，从而实现类型安全的属性访问：

```typescript
// 确保 K 必须是 T 的键之一
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const person = { name: "Alice", age: 30 }
const name = getProperty(person, "name") // ✅ 类型为 string
// const email = getProperty(person, "email") // ❌ 编译错误：不存在该属性
```

### 泛型默认值

类似于函数参数可以有默认值，泛型类型参数也可以有默认值，当不指定类型参数时会使用默认类型：

```typescript
type Factory<T = boolean> = T | number | string

// 使用默认值（T 为 boolean）
const foo: Factory = false

// 显式指定类型参数
const bar: Factory<string> = "hello"

// 伪代码等价形式（仅用于理解概念）
function Factory(typeArg = boolean) {
  return typeArg | number | string
}
```

#### 多个泛型参数的默认值

当有多个泛型参数时，可以从左到右依次指定，未指定的参数会使用默认值：

```typescript
interface ApiResponse<T = any, K extends string = "success"> {
  code: number
  message: string
  status: K
  data: T
}

// 使用全部默认值
type DefaultResponse = ApiResponse // 等价于 ApiResponse<any, "success">

// 只指定第一个参数，第二个参数使用默认值
type UserResponse = ApiResponse<{ id: number }> // 等价于 ApiResponse<{ id: number }, "success">
```

## 条件类型与泛型

条件类型（Conditional Types）是 TypeScript 中基于类型关系的条件判断机制，常与泛型结合使用来构建复杂的类型工具：

```typescript
// 条件类型语法：T extends U ? X : Y
// 如果 T 可以赋值给 U，则类型为 X，否则为 Y

// 判断是否为数组类型
type IsArray<T> = T extends Array<any> ? true : false

type A = IsArray<string[]> // 类型为 true
type B = IsArray<number> // 类型为 false

// 提取数组元素类型（结合 infer 关键字）
type ArrayElementType<T> = T extends Array<infer U> ? U : never

type Element1 = ArrayElementType<string[]> // 类型为 string
type Element2 = ArrayElementType<number[]> // 类型为 number
```

## 总结

泛型是 TypeScript 类型系统的核心特性之一，它提供了以下关键能力：

1. **类型安全与代码复用**：通过类型参数实现代码复用，同时保持完整的类型检查能力，避免使用 `any` 类型带来的类型安全隐患。

2. **灵活的类型定义**：可以在函数、接口、类型别名和类中使用泛型，为不同的使用场景提供灵活的类型定义。

3. **类型约束**：通过 `extends` 关键字对类型参数进行约束，确保类型参数满足特定条件，从而在泛型代码中安全地使用这些类型特性。

4. **类型推断**：TypeScript 能够自动推断泛型类型参数，减少冗余的类型注解，使代码更加简洁。

5. **高级类型编程**：结合条件类型、`keyof`、`infer` 等特性，可以构建复杂的类型工具，实现强大的类型操作能力。

在实际开发中，泛型常用于：

- API 响应类型的统一封装
- 容器类数据结构（如 Stack、Queue）的实现
- 工具类型的创建（如 `Nullable`、`Partial`、`Pick` 等）
- 函数式编程中的类型安全抽象

掌握泛型能够显著提升 TypeScript 代码的类型安全性和可维护性，是现代 TypeScript 开发中不可或缺的技能。
