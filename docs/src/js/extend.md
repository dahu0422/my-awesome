# 继承

## 原型链继承

原型链继承是最基本的继承方式，通过将子类的原型指向父类的实例来实现继承。

```js
// 父类构造函数
function Animal(name) {
  this.name = name
  this.colors = ["red", "blue", "green"]
}

// 父类方法
Animal.prototype.sayName = function () {
  console.log("My name is " + this.name)
}

// 子类构造函数
function Dog(name, breed) {
  this.breed = breed
}

// 原型链继承 ‼️
Dog.prototype = new Animal()

// 添加子类方法
Dog.prototype.bark = function () {
  console.log("Woof! I am a " + this.breed)
}

// 使用示例
var dog1 = new Dog("Buddy", "Golden Retriever")
var dog2 = new Dog("Max", "Labrador")

dog1.sayName() // My name is Buddy
dog1.bark() // Woof! I am a Golden Retriever

// 问题：引用类型属性被共享
dog1.colors.push("yellow")
console.log(dog2.colors) // ['red', 'blue', 'green', 'yellow']
```

问题：

- 引用类型属性被所有实例共享
- 无法向父类构造函数传递参数
- 原型链过长会影响性能

## 构造函数继承

造函数继承通过在子类构造函数中调用父类构造函数来实现继承。

```js
function Animal(name) {
  this.name = name
  this.colors = ["red", "blue", "green"]
}

Animal.prototype.sayName = function () {
  console.log("My name is " + this.name)
}

function Dog(name, breed) {
  // 调用父类构造函数 ‼️
  Animal.call(this, name)
  this.breed = breed
}

Dog.prototype.bark = function () {
  console.log("Woof! I am a " + this.breed)
}

// 使用示例
var dog1 = new Dog("Buddy", "Golden Retriever")
var dog2 = new Dog("Max", "Labrador")

// dog1.sayName(); // 报错：dog1.sayName is not a function
dog1.bark() // Woof! I am a Golden Retriever

// 引用类型属性不再共享
dog1.colors.push("yellow")
console.log(dog2.colors) // ['red', 'blue', 'green']
console.log(dog1.colors) // ['red', 'blue', 'green', 'yellow']
```

优点：

- 解决了引用类型属性共享问题
- 可以向父类构造函数传递参数
- 每个实例都有独立的属性副本

问题：

- 无法继承父类原型上的方法；
- 每个子类实例都会创建父类方法的副本，浪费内存；

## 组合继承

组合继承结合了原型链继承和构造函数继承的优点，是最常用的继承模式。

```javascript
function Animal(name) {
  this.name = name
  this.colors = ["red", "blue", "green"]
}

Animal.prototype.sayName = function () {
  console.log("My name is " + this.name)
}

function Dog(name, breed) {
  // 构造函数继承
  Animal.call(this, name)
  this.breed = breed
}

// 原型链继承
Dog.prototype = new Animal()
// 修复构造函数指向
Dog.prototype.constructor = Dog

// 添加子类方法
Dog.prototype.bark = function () {
  console.log("Woof! I am a " + this.breed)
}

// 使用示例
var dog1 = new Dog("Buddy", "Golden Retriever")
var dog2 = new Dog("Max", "Labrador")

dog1.sayName() // My name is Buddy
dog1.bark() // Woof! I am a Golden Retriever

// 引用类型属性不共享
dog1.colors.push("yellow")
console.log(dog2.colors) // ['red', 'blue', 'green']
console.log(dog1.colors) // ['red', 'blue', 'green', 'yellow']
```

**优点：**

- 结合了原型链继承和构造函数继承的优点
- 可以继承父类原型上的方法
- 引用类型属性不共享
- 可以向父类构造函数传递参数

**缺点：**

- 父类构造函数被调用了两次
- 子类原型上会有多余的父类属性

## 寄生组合继承

寄生组合继承是 ES5 中最理想的继承方式，解决了组合继承的问题。

**只继承父类的原型，而不继承父类的实例属性**。避免继承父类构造函数被调用两次。

```javascript
function Animal(name) {
  this.name = name
  this.colors = ["red", "blue", "green"]
}

Animal.prototype.sayName = function () {
  console.log("My name is " + this.name)
}

function Dog(name, breed) {
  // 构造函数继承
  Animal.call(this, name)
  this.breed = breed
}

// 寄生组合继承
function inheritPrototype(subType, superType) {
  var prototype = Object.create(superType.prototype)
  prototype.constructor = subType
  subType.prototype = prototype
}

inheritPrototype(Dog, Animal)

// 添加子类方法
Dog.prototype.bark = function () {
  console.log("Woof! I am a " + this.breed)
}

// 使用示例
var dog1 = new Dog("Buddy", "Golden Retriever")
var dog2 = new Dog("Max", "Labrador")

dog1.sayName() // My name is Buddy
dog1.bark() // Woof! I am a Golden Retriever

// 引用类型属性不共享
dog1.colors.push("yellow")
console.log(dog2.colors) // ['red', 'blue', 'green']
console.log(dog1.colors) // ['red', 'blue', 'green', 'yellow']
```

**优点：**

- 只调用一次父类构造函数
- 避免了在子类原型上创建不必要的属性
- 保持了原型链的正确性

## class 继承

```javascript
// 父类
class Animal {
  constructor(name) {
    this.name = name
    this.colors = ["red", "blue", "green"]
  }

  sayName() {
    console.log("My name is " + this.name)
  }
}

// 子类
class Dog extends Animal {
  constructor(name, breed) {
    // 调用父类构造函数
    super(name)
    this.breed = breed
  }

  bark() {
    console.log("Woof! I am a " + this.breed)
  }
}

// 使用示例
const dog1 = new Dog("Buddy", "Golden Retriever")
const dog2 = new Dog("Max", "Labrador")

dog1.sayName() // My name is Buddy
dog1.bark() // Woof! I am a Golden Retriever

// 引用类型属性不共享
dog1.colors.push("yellow")
console.log(dog2.colors) // ['red', 'blue', 'green']
console.log(dog1.colors) // ['red', 'blue', 'green', 'yellow']
```
