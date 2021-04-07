---
layout:     post
title:      JS Reflect
date:       2020-12-1
author:     Oliver Li
catalog:    true
tags:
    - JavaScript
    - Reflect
---

# JS Reflect

### 1.2.1 Reflect.apply(target, thisArgument [, argumentsList])

该方法类同于[Function.prototype.apply()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply),二者的对比如下：

```js
var ages = [11, 33, 12, 54, 18, 96];

// Function.prototype style:
var youngest = Math.min.apply(Math, ages);
var oldest = Math.max.apply(Math, ages);
var type = Object.prototype.toString.call(youngest);

// Reflect style:
var youngest = Reflect.apply(Math.min, Math, ages);
var oldest = Reflect.apply(Math.max, Math, ages);
var type = Reflect.apply(Object.prototype.toString, youngest, []);
```

上面的`Math.min.apply`可以参考这篇文章：[call&apply&bind的学习](https://link.zhihu.com/?target=https%3A//blog.5udou.cn/blog/callapplybindDe-Xue-Xi-61)

Reflect提供这个方法的最大好处可以避免别人也写了一个同名的`apply`函数的时候，我们不会需要去写一大长串的代码，比如：

```
Function.prototype.apply.call(context, ...args)/Function.apply.call(context, ...args)
```

而是依然是简单的：

```
Reflect.apply()
```

### 1.2.2 Reflect.construct(target, argumentsList [, constructorToCreateThis])

这个方法等价于调用[new target(...args)](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new)。

二者的对比实现如下：

```js
class Greeting {
    constructor(name) {
        this.name = name;
    }
    greet() {
      return `Hello ${name}`;
    }

}

// ES5 style factory:
function greetingFactory(name) {
    var instance = Object.create(Greeting.prototype);
    Greeting.call(instance, name);
    return instance;
}

// ES6 style factory
function greetingFactory(name) {
    return Reflect.construct(Greeting, [name], Greeting);
}

// Or, omit the third argument, and it will default to the first argument.
function greetingFactory(name) {
  return Reflect.construct(Greeting, [name]);
}

// Super slick ES6 one liner factory function!
const greetingFactory = (name) => Reflect.construct(Greeting, [name]);
```

### 1.2.3 Reflect.defineProperty ( target, propertyKey, attributes )

类同于[Object.defineProperty()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)，不同的是该方法返回的是布尔值，而不需要你像以前那样去捕捉异常(因为Object.defineProperty是在执行出错的时候直接抛错的)

### 1.2.4 Reflect.getOwnPropertyDescriptor ( target, propertyKey )

类同于[Object.getOwnPropertyDescriptor()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor),如果对应的属性存在则返回给定属性的属性描述符，否则返回未定义。比如：

```js
var myObject = {};
Object.defineProperty(myObject, 'hidden', {
  value: true,
  enumerable: false,
});
var theDescriptor = Reflect.getOwnPropertyDescriptor(myObject, 'hidden');
Reflect.getOwnPropertyDescriptor(1, 'foo')
```

### 1.2.5 Reflect.deleteProperty ( target, propertyKey )

等同于调用[delete target[name\]](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete)

### 1.2.6 Reflect.getPrototypeOf ( target )

等同于[Object.getPrototypeOf()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf),唯一不同的是当传参`target`不是一个对象的时候：前者会强制将target转为一个对象。

```js
// Number {constructor: function, toExponential: function, toFixed: function, toPrecision: function,
// toString: function…}
Object.getPrototypeOf(1);

// Uncaught TypeError: Reflect.getPrototypeOf called on non-object
// at Object.getPrototypeOf (<anonymous>)
//  at <anonymous>:1:9
Reflect.getPrototypeOf(1); // TypeError
```

### 1.2.7 Reflect.setPrototypeOf ( target, proto )

等同于[Object.setPrototypeOf](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf),差别的地方和刚才的`getPrototypeOf`是一样的。如果传参没有错，那么Reflect是直接返回布尔值来标识是否成功，而后者则直接抛错来表明失败。

### 1.2.8 Reflect.isExtensible (target)

等同于[Object.isExtensible()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible),区别也是在于返回值。

### 1.2.9 Reflect.preventExtensions ( target )

类同于[Object.preventExtensions()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)。区别也是在于返回值。

### 1.2.10 Reflect.get ( target, propertyKey [ , receiver ])

该方法用来获取对象中某个属性的方法。这是一个全新的方法，不过该方法也是很简单的，如下：

```js
const testObject = {
  a: 'you',
  b: 'like'
}
Reflect.get(testObject, 'a') === 'you' // true
Reflect.get(testObject, 'b') === 'like' // true
```

### 1.2.11 Reflect.set ( target, propertyKey, V [ , receiver ] )

类同于上面的`get`方法。比如：

```js
const testObject = {
  a: 'you',
  b: 'like'
}
Reflect.set(testObject, 'c', 'javascript') // true
Reflect.get(testObject, 'c') === 'javascript' // true
```

### 1.2.12 Reflect.has ( target, propertyKey )

该方法类似于[in操作符](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in)，返回布尔值来表明该属性是否存在该对象上或者其原型链上。比如：

```js
let testObject = {
  foo: 1,
};
Object.setPrototypeOf(testObject, {
  get bar() {
    return 2;
  },
  baz: 3,
});

Reflect.has(myObject, 'foo') === true
Reflect.has(myObject, 'baz') === true
```

### 1.2.13 Reflect.ownKeys ( target )

该方法在之前说过了，它返回了目标对象已有的所有属性(不包括原型链)的一个数组。