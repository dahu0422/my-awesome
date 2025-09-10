# 对象的类型标注

在 TypeScript 中使用 interface 来描述对象类型

```ts
interface IDescription {
  name: string
  age: number
  male: boolean
}

const obj1: IDescription = {
  name: "linbudu",
  age: 599,
  male: true,
}
```

`interface IDescription` 指：

- 每一个属性的值必须**一一对应**到接口的属性类型
- 不能有多的属性，也不能有少的属性，包括直接在对象内部声明，或是 `obj1.other = 'xxx'` 这样属性访问赋值的形式

除了声明属性以及属性的类型意外，可以对属性进行修饰，常见修饰包括：**可选 Optional** 和 **只读 Readonly**两种

使用 `?` 来标记一个属性为可选

```typescript
interface IDescription {
  name: string
  age: number
  male?: boolean
  func?: Function
}

const obj2: IDescription = {
  name: "linbudu",
  age: 599,
  male: true,
  // 无需实现 func 也是合法的
}
```

使用可选属性进行赋值 TypeScript 仍然会使用**接口的描述为准**进行类型检查。可以使用了类型断言、非空断言或可选链解决。

只读属性 `readonly` 防止对象的属性被再次赋值

```typescript
interface IDescription {
  readonly name: string
  age: number
}

const obj3: IDescription = {
  name: "linbudu",
  age: 599,
}

// 无法分配到 "name" ，因为它是只读属性
obj3.name = "林不渡"
```

:::tip type vs interface
interface 用来描述对象、类的结构，type 用来讲一个函数签名、一组联合类型、一个工具类型等等抽离成一个完整独立的类型。
