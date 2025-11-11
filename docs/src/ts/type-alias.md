# Type Alias 类型别名

类型别名是用 `type` 为一段类型表达式起“名字”。当类型较长、会复用或需要通过条件、映射等方式组合时，别名能显著提升可读性与维护性。

```ts
type UserId = string
type Point = { x: number; y: number }

// 联合
type ID = number | string
type HttpMethod = "Get" | "Post" | "Put" | "Delete"

// 交叉
type WithTimestamp = { createdAt: number; updateAt: number }
type UserBase = { id: ID; name: string }
type User = UserBase & WithTimestamp

// 交叉类型描述“可同时满足”的结构，若存在同名不兼容属性会得到 never 或不可用的类型
type A = { value: string }
type B = { value: number }
type AB = A & B
// AB 等价于 { value: string & number }，即 { value: never }

// 元组
type Pair<T> = [T, T]
const p: Pair<number> = [1, 2]

// 函数类型
type Comparator<T> = (a: T, b: T) => number

// 泛型与别名
type ApiResponse<T> = { code: number; message: string; data: T }
type Nullable<T> = T | null
type ReadonlyRecord<K extends string, V> = Readonly<Record<K, V>>
```

## 与 interface 的对比与取舍

相同点：

- 都能描述对象形状，支持泛型

不同点：

- 扩展性：`interface` 支持声明合并与 `extends` 多次扩展；`type` 无声明合并，但可用交叉类型组合。
- 表达力：`type` 能表达联合、条件、元祖等更广泛的类型表达式；`interface` 不行。

使用建议:

- 描述“可被拓展的对象协议”优先 `interface`。
- 描述“类型表达式（联合/条件/映射/元组/函数签名等）”优先 `type`。
- 团队内统一规则：能用 `interface` 的对象模型优先接口，其余使用 `type`。

```ts
// interface 更适合可扩展对象
interface Animal {
  name: string
}
interface Dog extends Animal {
  bark(): void
}

// type 更擅长联合/交叉等表达式
type Success<T> = { ok: true; data: T }
type Failure = { ok: false; error: string }
type Result<T> = Success<T> | Failure
```
