# Class 从原型继承到现代类语法

## 类语法的诞生背景

在 ES6 之前，JavaScript 使用原型链实现面向对象编程：

```javascript
// ES5 原型继承
function Person(name, age) {
  this.name = name
  this.age = age
}

Person.prototype.greet = function () {
  return `Hello, I'm ${this.name}`
}

var john = new Person("John", 30)
```

<!-- TODO:这种写法的问题是什么 -->

## 类的基本结构

1. 类声明

```javascript
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  greet() {
    return `Hello, I'm ${this.name} and I'm ${this.age} years old.`
  }
}

const alice = new Person("Alice", 25)
console.log(alice.greet()) // Hello, I'm Alice and I'm 25 years old.
```

2. 类表达式

```javascript
const Animal = class {
  constructor(name) {
    this.name = name
  }

  speak() {
    console.log(`${this.name} makes a noise.`)
  }
}

const dog = new Animal("Dog")
dog.speak() // Dog makes a noise.
```

## 类的核心特性

1. 构造方法 Constructor

`constructor` 方法是类的特殊方法，用于创建和初始化对象实例

```javascript
class Rectangle {
  name = "rectangle" // 类字段，会被添加到每个实例上

  constructor(height, width) {
    this.height = height
    this.width = width
    this.area = height * width // 可以在构造函数中计算属性
  }
}
```

2. 实例方法

定义在类中法方法会成为原型方法，被所有实例共享

```javascript
class Calculator {
  add(a, b) {
    return a + b
  }

  multiply(a, b) {
    return a * b
  }
}

const calc = new Calculator()
console.log(calc.add(2, 3)) // 5
```

3. 静态方法

使用 `static` 关键字定义的方法属于类本身，而不是实例，所有实例共享一份数据。

```javascript
class MathUtils {
  static square(x) {
    return x * x
  }

  static PI = 3.14159
}

// 通过类名访问
console.log(MathUtils.square(5)) // 25
console.log(MathUtils.PI) // 3.14159

const utils = new MathUtils()
// utils.square(5); // 错误：静态方法不能通过实例调用
```

4. 私有字段和方法

ES2022 引入了真正的私有字段和方法，使用 `#` 前缀。私有字段每个实例都有，但只能在类内部访问。

```javascript
class BankAccount {
  #balance = 0 // 私有字段

  constructor(initialBalance) {
    this.#balance = initialBalance
  }

  // 私有方法
  #validateAmount(amount) {
    return amount > 0
  }

  deposit(amount) {
    if (this.#validateAmount(amount)) {
      this.#balance += amount
      return true
    }
    return false
  }

  getBalance() {
    return this.#balance
  }
}

const account = new BankAccount(100)
// account.#balance; // 错误：私有字段无法在类外部访问
console.log(account.getBalance()) // 100
```

5. Getter 和 Setter

根据需要定义任意名称的 getter 和 setter：Getter 像访问属性一样调用，不需要括号。Setter 像赋值属性一样调用。

```javascript
class Temperature {
  constructor(celsius) {
    this._celsius = celsius
  }

  // Getter：定义访问器
  get celsius() {
    return this._celsius
  }

  // Setter：定义设置器
  set celsius(value) {
    if (value < -273.15) {
      console.log("Temperature below absolute zero is not possible")
      return
    }
    this._celsius = value
  }

  get fahrenheit() {
    return (this._celsius * 9) / 5 + 32
  }
}

const temp = new Temperature(25)
console.log(temp.fahrenheit) // 77
temp.celsius = 30
console.log(temp.fahrenheit) // 86
```

## 继承

1. 基本继承语法 `extends` 和 `super`

使用 `extend` 关键字实现继承，继承是面向对象编程的核心，允许子类继承父类属性和方法。

`super` 关键字用于调用父类的方法和构造函数，在不同场景有不同用法：

```javascript
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    console.log(`${this.name} makes a noise.`)
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name) // 必须首先调用父类构造函数，在 this 之前
    this.breed = breed
  }

  // 如果没有定义构造函数，会自动调用 super()

  speak() {
    super.speak() // 调用父类的 speak 方法
    console.log(`${this.name} barks.`)
  }

  describe() {
    return `${this.name} is a ${this.breed}`
  }
}

const dog = new Dog("Rex", "German Shepherd")
dog.speak() // Rex barks.
console.log(dog.describe()) // Rex is a German Shepherd
```

2. 方法重写 Override

子类可以重写父类的方法，实现自己的逻辑

```javascript
class Shape {
  area() {
    return 0
  }

  describe() {
    return "I am a shape"
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super()
    this.width = width
    this.height = height
  }

  // 重写父类方法，方法名相同 隐式重写
  area() {
    return this.width * this.height
  }

  // 调用父类方法并扩展
  describe() {
    return `${super.describe()}, specifically a rectangle`
  }
}

const rect = new Rectangle(10, 20)
console.log(rect.area()) // 200
console.log(rect.describe()) // I am a shape, specifically a rectangle
```

3. 其他

- 静态方法和字段也会被继承
- Getter 和 Setter 也会被继承和重写
- 私有字段有继承中特殊规则：子类无法直接访问父类的私有字段，但可以定义自己的私有字段；

```javascript
class Animal {
  #name

  constructor(name) {
    this.#name = name
  }

  getName() {
    return this.#name // 只能在类内部访问
  }
}

class Dog extends Animal {
  #breed

  constructor(name, breed) {
    super(name)
    this.#breed = breed
  }

  getBreed() {
    return this.#breed
  }

  // 无法直接访问父类的 #name，但可以通过父类的方法访问
  getInfo() {
    return `${this.getName()} is a ${this.#breed}` // 通过 getName() 访问
  }
}

const dog = new Dog("Rex", "German Shepherd")
console.log(dog.getInfo()) // Rex is a German Shepherd
// dog.#name   // ❌ 错误：无法访问父类的私有字段
// dog.#breed  // ❌ 错误：无法在类外部访问私有字段
```

## 类 vs 构造函数

JavaScript 的类本质上是语法糖，仍然是基于原型继承。然而，类语法提供了更清晰、易读的代码结构，并且有一些重要的区别：

1. 类声明不会被提升，而函数声明会被提升
2. 类中的所有代码都默认在严格模式下执行
3. 类方法不可枚举
4. 调用类构造函数必须使用 `new` 关键字
