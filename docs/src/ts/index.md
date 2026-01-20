# TypeScript

## 为什么需要引入 TypeScript

JavaScript 作为一门动态类型语言，在开发大型应用时存在以下问题：

- 类型不安全：变量类型在运行时才确定，容易产生类型错误；
- 缺乏编译时检查：错误只在运行时发现；
- 代码可读性差：没有类型注解，难以理解函数参数和返回值；
- IDE 支持有限：智能提示和自动补全功能弱

随着前端项目规模增长，团队协作和代码维护变得越来越重要：

- 团队协作：多人开发时需要明确的接口定义；
- 代码维护：长期维护需要更好的代码结构和类型安全；
- 错误预防：在开发阶段就能发现潜在问题；

## TypeScript 好处

### 类型安全

```ts
// 编译时类型检查
function add(a: number, b: number): number {
  return a + b
}

// 错误：类型不匹配
add("1", "2") // ❌ ts 会报错
add(1, 2) // ✅
```

### 更好的开发体验

```ts
interface User {
  id: number
  name: string
  email: string
}

function getUser(id: number): User {
  // IDE 会提供智能提示
  return {
    id,
    name: "张三",
    email: "xxx@example.com",
  }
}

// 使用时有完整的类型提示
const user = getUser(1)
console.log(user.name) // IDE 知道 user 有 name 属性
```

### 编译时错误检查

```ts
function processUser(user: User) {
  // ❌ 错误：属性 age 不存在
  console.log(user.age)

  // ✅ 正确：使用存在的属性
  console.log(user.name)
}
```

TypeScript 类型系统
├── 基础类型
│ ├── 原始类型 (string, number, boolean...)
│ ├── 特殊类型 (any, unknown, never, void)
│ └── 字面量类型
├── 对象类型
│ ├── 接口 (interface)
│ ├── 类型别名 (type)
│ ├── 数组与元组
│ └── 函数类型
├── 类型组合
│ ├── 联合类型 (|)
│ ├── 交叉类型 (&)
│ └── 类型操作
├── 泛型系统
│ ├── 泛型约束
│ ├── 泛型默认值
│ └── 条件类型
├── 高级特性
│ ├── 映射类型
│ ├── 模板字面量类型
│ └── 递归类型
└── 类型工具
├── 内置工具类型
├── 类型守卫
└── 类型推断
