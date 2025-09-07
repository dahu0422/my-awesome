# TypeScript 数据类型

## 原始类型的类型标注

JavaScript 内置原始类型在 TypeScript 中对应的类型注解：

```ts
const name: string = "linbudu"
const age: number = 24
const male: boolean = false
const undef: undefined = undefined
const nul: null = null
const obj: object = { name, age, male }
const bigintVar1: bigint = 9007199254740991n
const bigintVar2: bigint = BigInt(9007199254740991)
const symbolVar: symbol = Symbol("unique")
```

## 数组的类型标注

在 TypeScript 中有两种方式来声明一个数组类型，这两种方式是等价的

```ts
const arr1: string[] = []
const arr2: Array<string> = []
```

但在某种情况下，使用**元祖（Tuple）**来代替数组更妥当，比如一个数组中只存在固定长度的变量，但超出长度访问：

```ts
// 不合符预期的写法
const arr3: string[] = ["lin", "bu", "du"]
console.log(arr3[599])
```

这种情况是不符合预期的，在确定数组中只有三个成员，并越界访问时应该给出类型报错。这种情况可以使用元祖类型进行类型标注；

```ts
const arr4: [string, string, string] = ["lin", "bu", "du"]
console.log(arr4[599])
```

此时将会产生一个类型错误：**_长度为“3”的元组类型“[string, string, string]”在索引“599“处没有元素_**。除了同类型的元素以外，元组内部也可以声明多个与其位置强绑定的，不同类型的元素：

```ts
const arr5: [string, number, boolean] = ["linbudu", 599, true]
```

在这种情况下，对数组合法边界内的索引访问（即 0、1、2）将精确地获得对应位置上的类型。同时元组也支持了在某一个位置上的可选成员：

```ts
const arr6: [string, number?, boolean?] = ["linbudu"]
// 下面这么写也可以
// const arr6: [string, number?, boolean?] = ['linbudu', , ,];
```

在 TypeScript 4.0 中，有了具名元祖，可以为元祖中的元素打上类似属性的标记

```ts
const arr7: [name: string, age: number, male: boolean] = ["linbudu", 599, true]
// 具名元祖可选元素的修饰符写法
const arr7: [name: string, age: number, male?: boolean] = ["linbudu", 599, true]
```

除了显示越界访问，还可能存在隐式的越界访问，比如解构赋值的形式：

```ts
// ❌ 数组无法检查出是否存在隐式访问，因为类型层面并不知道它有多少元素
const arr8: string[] = []
const [ele1, ele2, ...rest] = arr8

// 元祖对于隐式越界访问会提出警告
const arr5: [string, number, boolean] = ["linbudu", 599, true]

// 长度为 "3" 的元组类型 "[string, number, boolean]" 在索引 "3" 处没有元素。
const [name, age, male, other] = arr5
```
