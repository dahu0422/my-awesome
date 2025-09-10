# 数组的类型标注

在 TypeScript 中有两种方式声明数组类型，这两种方式完全等价

```ts
const arr1: string[] = []

const arr2: Array<string> = []
```

某些情况，使用**元祖 Tuple** 来代替数组更加妥当，比如声明一个数组中只存放固定长度的变量，但超出长度地访问：

```ts
const arr3: string[] = ["lin", "bu", "du"]
console.log(arr3[599])
```

这种情况不符合预期，当越界访问时希望给出类型报错，此时可以使用元祖类型进行标注：

```ts
const arr4: [string, string, string] = ["lin", "bu", "du"]
console.log(arr4[599])
```

此时将会产生一个类型错误：**_长度为“3”的元组类型“[string, string, string]”在索引“599“处没有元素_**。除了同类型的元素以外，元组内部也可以声明多个与其位置强绑定的，不同类型的元素：

```ts
const arr5: [string, number, boolean] = ["linbudu", 599, true]
```

在这种情况下，对数组合法边界内的索引访问（即 0、1、2）将精确地获得对应位置上的类型。同时元组也支持了在某一个位置上的可选成员：

```typescript
const arr6: [string, number?, boolean?] = ["linbudu"]
// 下面这么写也可以
// const arr6: [string, number?, boolean?] = ['linbudu', , ,];
```

在 TypeScript4.0 中有了**具名元祖**，可以为元祖中的元素打上类似属性的标记：

```ts
const arr7: [name: string, age: number, male: boolean] = ["linbudu", 599, true]
// 具名元祖可选修饰符
const arr7: [name: string, age: number, male?: boolean] = ["linbudu", 599, true]
```

除了显示越界访问，还可能存在隐式越界访问，比如解构赋值

```ts
const arr8: string[] = []
const [ele1, ele2, ...rest] = arr8
```

对于数组仍然无法检查出是否存在隐式访问，因为类型层面并不知道有多少元素。但对于元祖，隐式的越界访问可以给出警告

```typescript
const arr8: [string, number, boolean] = ["linbudu", 599, true]

// 长度为 "3" 的元组类型 "[string, number, boolean]" 在索引 "3" 处没有元素。
const [name, age, male, other] = arr8
```
