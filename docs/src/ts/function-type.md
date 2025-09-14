# 函数类型

在 TypeScript 中，函数类型时类型系统的重要组成部分。与变量类型类似，函数类型主要描述**函数的入参类型与返回值类型**，下面是各种形式的函数添加类型标注。

```ts
// 函数声明
function foo(name: string): number {
  return name.length
}

// 函数表达式
const foo = function (name: string): number {
  return name.length
}

// 箭头函数
const foo = (name: string): number => {
  return name.length
}
```

## 函数类型标注方式

1. 直接在函数中标注

```typescript
const foo = (name: string): number => {
  return name.length
}
```

2. 使用类型别名

```typescript
type FuncFoo = (name: string) => number

const foo: FuncFoo = (name) => {
  return name.length
}
```

3. 使用 Callable Interface

```typescript
interface FuncFooStruct {
  (name: string): number
}

const foo: FuncFooStruct = (name) => {
  return name.length
}
```

## 处理无返回值的函数

在 JavaScript 中，没有显式返回值的函数会返回 `undefined`。但在 TypeScript 中，我们有两个选择：`void` 和 `undefined`。它们虽然看起来相似，但语义上有着微妙的区别：

```typescript
// void - 表示"没有返回值"的语义
function foo(): void {
  // 没有调用 return 语句
}

function bar(): void {
  return // 调用了 return，但没有返回值
}

// undefined - 表示"返回了 undefined 值"
function baz(): undefined {
  return // 明确表示进行了返回操作，但返回的是 undefined
}
```

## 可选参数与 rest 参数

有时函数某些入参是可选的，TypeScript 提供了两种实现方式

```typescript
// 方式一：使用 ? 标记可选参数，在函数内部处理默认值
function foo1(name: string, age?: number): number {
  const inputAge = age || 18
  return name.length + inputAge
}

// 方式二：直接在参数上提供默认值（推荐）
function foo2(name: string, age: number = 18): number {
  return name.length + age
}
```

当需要处理不定量的参数是，可以使用 rest 参数：

```typescript
// 使用数组类型 - 最灵活的方式
function foo(arg1: string, ...rest: any[]) {
  console.log(rest) // rest 是一个数组
}

// 使用元组类型 - 更精确的类型控制
function bar(arg1: string, ...rest: [number, boolean]) {
  // rest 只能是 [number, boolean] 的元组
}
bar("hello", 42, true) // ✅ 正确
bar("hello", 42) // ❌ 错误：缺少 boolean 参数
```

## 函数重载

当函数有多组入参类型和返回值类型时，可以使用函数重载

```typescript
// 重载签名
function func(foo: number, bar: true): string
function func(foo: number, bar?: false): number
// 实现签名
function func(foo: number, bar?: boolean): string | number {
  if (bar) {
    return String(foo)
  } else {
    return foo * 599
  }
}

const res1 = func(599) // number
const res2 = func(599, true) // string
const res3 = func(599, false) // number
```

## 异步函数类型

```typescript
// 异步函数返回 Promise 类型
async function asyncFunc(): Promise<void> {}

// Generator 函数
function* genFunc(): Iterable<void> {}

// 异步 Generator 函数
async function* asyncGenFunc(): AsyncIterable<void> {}
```
