# 字面量类型与枚举类型

## 字面量类型

字面量类型代表着比原始类型更精确的类型，同时也是原始类型的字类型。它要求值必须与执行的字面量完全一致；

字面量类型主要包括：

```typescript
const str: "linbudu" = "linbudu" // 字符串字面量类型
const num: 599 = 599 // 数字字面量类型
const bool: true = true // 布尔字面量类型

// 对象字面量类型
interface Config {
  theme: {
    primary: "#1890ff"
    secondary: "#52c41a"
  }
  layout: {
    sidebar: true
    header: false
  }
}

const config: Config = {
  theme: {
    primary: "#1890ff", // 必须是这个确切的值
    secondary: "#52c41a", // 必须是这个确切的值
  },
  layout: {
    sidebar: true, // 必须是 true
    header: false, // 必须是 false
  },
}
```

## 字面量类型与联合类型

字面量类型通常与联合类型结合使用，联合类型表示一组类型的可用集合，只要最终赋值的类型属于联合类型的成员之一即可。

### 基础联合类型

```typescript
// 状态码联合类型
type StatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500

// 用户角色联合类型
type UserRole = "admin" | "user" | "guest"

// 主题模式联合类型
type ThemeMode = "light" | "dark" | "auto"
```

### 复杂联合类型

```typescript
// 混合类型联合
type MixedType = string | number | boolean | null

// 函数类型联合
type EventHandler =
  | ((event: MouseEvent) => void)
  | ((event: KeyboardEvent) => void)

// 嵌套联合类型
type ComplexType =
  | { type: "success"; data: any }
  | { type: "error"; message: string }
  | { type: "loading"; progress: number }
```

### 互斥属性模式

使用联合类型实现互斥属性，确保某些属性不能同时存在：

```typescript
interface User {
  // 普通用户或VIP用户，但不能同时是两种
  userType:
    | {
        isVip: true
        vipExpires: string
        vipLevel: "basic" | "premium" | "enterprise"
      }
    | {
        isVip: false
        trialDays: number
        upgradePrompt: string
      }
}

// 使用类型守卫进行类型收窄
function handleUser(user: User) {
  if (user.userType.isVip) {
    // 在这个分支中，TypeScript 知道 userType 是 VIP 用户类型
    console.log(user.userType.vipExpires)
    console.log(user.userType.vipLevel)
    // console.log(user.userType.trialDays); // 错误！VIP 用户没有 trialDays
  } else {
    // 在这个分支中，TypeScript 知道 userType 是普通用户类型
    console.log(user.userType.trialDays)
    console.log(user.userType.upgradePrompt)
    // console.log(user.userType.vipLevel); // 错误！普通用户没有 vipLevel
  }
}
```

## 枚举类型

枚举提供了一种将相关常量组织在一起的方式，相比传统的常量对象，枚举有更好的类型安全性和开发体验。

```typescript
// 传统常量对象方式
const PageUrl = {
  Home_Page_Url: "url1",
  Setting_Page_Url: "url2",
  Share_Page_Url: "url3",
}

// 枚举方式
enum PageUrl {
  Home_Page_Url = "url1",
  Setting_Page_Url = "url2",
  Share_Page_Url = "url3",
}

const home = PageUrl.Home_Page_Url // "url1"
```

### 数字枚举

如果不指定枚举值，TypeScript 会默认使用数字枚举，从 0 开始递增：

```typescript
enum Status {
  Pending, // 0
  Approved, // 1
  Rejected, // 2
}

console.log(Status.Pending) // 0
console.log(Status.Approved) // 1
console.log(Status.Rejected) // 2
```

### 自定义数字枚举

可以为枚举成员指定具体的数字值：

```typescript
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  InternalServerError = 500,
}

// 部分指定值，其他成员会从指定值开始递增
enum Items {
  Foo, // 0
  Bar = 599, // 599
  Baz, // 600
}
```

### 字符串枚举

使用字符串作为枚举值：

```typescript
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

enum Theme {
  Light = "light",
  Dark = "dark",
  Auto = "auto",
}
```

### 枚举的双向映射

数字枚举具有双向映射特性，可以从枚举成员映射到值，也可以从值映射到成员：

```typescript
enum Status {
  Pending, // 0
  Approved, // 1
  Rejected, // 2
}

// 成员到值
const statusValue = Status.Pending // 0
// 值到成员
const statusName = Status[0] // "Pending"

// 编译后的 JavaScript 代码
/*
var Status;
(function (Status) {
    Status[Status["Pending"] = 0] = "Pending";
    Status[Status["Approved"] = 1] = "Approved";
    Status[Status["Rejected"] = 2] = "Rejected";
})(Status || (Status = {}));
*/
```

**注意**：只有数字枚举才支持双向映射，字符串枚举只支持单向映射。
