# Interface 接口

在 TypeScript 中，对象类型是最常用的类型之一，使用 `interface` 来描述对象的结构和类型。

## 使用 interface 定义对象类型

```ts
interface IDescription {
  name: string
  age: number
  male: boolean
}

const obj1: IDescription = {
  name: "张三",
  age: 599,
  male: true,
}
```

`interface IDescription` 指：

- 每一个属性的值必须**一一对应**到接口的属性类型
- 不能有多的属性，也不能有少的属性，包括直接在对象内部声明，或是 `obj1.other = 'xxx'` 这样属性访问赋值的形式

## 属性修饰符

除了声明属性以及属性的类型以外，可以对属性进行修饰，常见修饰包括：**可选 Optional** 和 **只读 Readonly** 两种。

### 可选属性 (Optional)

使用 `?` 来标记一个属性为可选：

```typescript
interface IDescription {
  name: string
  age: number
  male?: boolean
  func?: Function
}

const obj2: IDescription = {
  name: "张三",
  age: 599,
  male: true,
  // 无需实现 func 也是合法的
}
```

使用可选属性进行赋值时，TypeScript 仍然会使用**接口的描述为准**进行类型检查。可以使用类型断言、非空断言或可选链来解决。

```typescript
interface Config {
  host?: string
  port?: number
}

function connect(config: Config) {
  // 需要类型保护
  if (config.host) {
    console.log(config.host.toUpperCase()) // 类型收窄为 string
  }

  // 或使用可选链
  console.log(config.host?.toUpperCase())

  // 或使用非空断言（需要确保值存在）
  console.log(config.host!.toUpperCase())
}
```

### 只读属性 (Readonly)

只读属性 `readonly` 防止对象的属性被再次赋值：

```typescript
interface IDescription {
  readonly name: string
  age: number
}

const obj3: IDescription = {
  name: "张三",
  age: 599,
}

// ❌ 无法分配到 "name" ，因为它是只读属性
// obj3.name = "李四"
```

注意：`readonly` 只在编译时起作用，运行时不会阻止修改。对于数组，可以使用 `ReadonlyArray` 类型。

## 索引签名 (Index Signatures)

当对象属性的键名无法提前确定时，可以使用索引签名：

```typescript
// 字符串索引签名
interface StringRecord {
  [key: string]: string
}

const record: StringRecord = {
  name: "张三",
  age: "599", // 所有值都必须是 string
}

// 数字索引签名
interface NumberRecord {
  [key: number]: string
}

const arr: NumberRecord = {
  0: "first",
  1: "second",
}

// 索引签名可以与具体键值对并存
interface MixedRecord {
  propA: number // 具体属性
  propB: boolean // 具体属性
  [key: string]: number | boolean // 索引签名，必须包含所有属性的类型
}
```

**注意**：如果同时存在具体属性和索引签名，具体属性的类型必须是索引签名类型的子类型。

```typescript
// ❌ 错误：propA 的类型 string 不兼容索引签名的 number | boolean
interface BadRecord {
  propA: string
  [key: string]: number | boolean
}

// ✅ 正确
interface GoodRecord {
  propA: number
  propB: boolean
  [key: string]: number | boolean
}
```

## 接口继承 (Interface Extends)

接口可以继承其他接口，实现类型的复用：

```typescript
interface Animal {
  name: string
  age: number
}

interface Dog extends Animal {
  breed: string
  bark(): void
}

const dog: Dog = {
  name: "旺财",
  age: 3,
  breed: "金毛",
  bark() {
    console.log("汪汪!")
  },
}
```

接口可以同时继承多个接口：

```typescript
interface CanFly {
  fly(): void
}

interface CanSwim {
  swim(): void
}

interface Duck extends Animal, CanFly, CanSwim {
  quack(): void
}
```

## 接口合并 (Interface Merging)

当多次声明同名接口时，TypeScript 会自动合并这些声明：

```typescript
interface User {
  name: string
}

interface User {
  age: number
}

// 等价于
// interface User {
//   name: string
//   age: number
// }

const user: User = {
  name: "张三",
  age: 599,
}
```

**注意**：合并时如果存在同名的非函数成员，类型必须相同；对于函数成员，会被视为函数重载。

## 对象类型访问

### 索引类型访问

可以通过索引访问接口的属性类型，这在某些高级类型操作中很有用：

```typescript
interface User {
  name: string
  age: number
  email: string
}

// 通过索引访问获取属性类型
User["name"] // string
User["age"] // number
User["email"] // string

// 使用联合类型访问多个属性
User["name" | "age"] // string | number
```

### keyof 操作符

使用 `keyof` 可以获取接口的所有键：

```typescript
interface User {
  name: string
  age: number
  email: string
}

// keyof User 表示 "name" | "age" | "email"
function getProperty(obj: User, key: keyof User) {
  return obj[key] // 类型安全
}

// 结合索引访问获取所有属性值的联合类型
User[keyof User] // string | number
```
