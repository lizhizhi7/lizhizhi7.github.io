ES6新特性6：模块Module
本文摘自ECMAScript6入门，转载请注明出处。

 

一、Module简介

　　ES6的Class只是面向对象编程的语法糖，升级了ES5的构造函数的原型链继承的写法，并没有解决模块化问题。Module功能就是为了解决这个问题而提出的。

　　历史上，JavaScript一直没有模块（module）体系，无法将一个大程序拆分成互相依赖的小文件，再用简单的方法拼装起来。其他语言都有这项功能。

　　在ES6之前，社区制定了一些模块加载方案，最主要的有CommonJS和AMD两种。前者用于服务器，后者用于浏览器。ES6在语言规格的层面上，实现了模块功能，而且实现得相当简单，完全可以取代现有的CommonJS和AMD规范，成为浏览器和服务器通用的模块解决方案。

 　　ES6模块的设计思想，是尽量的静态化，使得编译时就能确定模块的依赖关系（这种加载称为“编译时加载”），以及输入和输出的变量。CommonJS和AMD模块，都只能在运行时确定这些东西。

　　浏览器使用ES6模块的语法如下。

<script type="module" src="fs.js"></script>
　　上面代码在网页中插入一个模块fs.js，由于type属性设为module，所以浏览器知道这是一个ES6模块。

// ES6加载模块
import { stat, exists, readFile } from 'fs';
　　上面代码通过import去加载一个Module，加载其中的一些方法。

 

二、import 和 export

　　模块功能主要由两个命令构成：export和import。export命令用于规定模块的对外接口，import命令用于输入其他模块提供的功能。

　　一个模块就是一个独立的文件。该文件内部的所有变量，外部无法获取。如果你希望外部能够读取模块内部的某个变量，就必须使用export关键字输出该变量。下面是一个JS文件，里面使用export命令输出变量。

// profile.js
export var firstName = 'Michael';
export var lastName = 'Jackson';
export var year = 1958;
　　

　　export的写法，除了像上面这样，还有另外一种。(推荐这种，因为这样就可以在脚本尾部，一眼看清楚输出了哪些变量。)

复制代码
// profile.js
var firstName = 'Michael';
var lastName = 'Jackson';
var year = 1958;

export {firstName, lastName, year};
复制代码
 

　　export命令除了输出变量，还可以输出函数或类（class）。通常情况下，export输出的变量就是本来的名字，但是可以使用as关键字重命名。

复制代码
function v1() { ... }
function v2() { ... }

export {
    v1 as streamV1,
    v2 as streamV2,
    v2 as streamLatestVersion
};
复制代码
 

　　使用export命令定义了模块的对外接口以后，其他JS文件就可以通过import命令加载这个模块（文件）。

复制代码
// main.js

import {firstName, lastName, year} from './profile';

function setName(element) {
    element.textContent = firstName + ' ' + lastName;
}
复制代码
　　上面代码的import命令，就用于加载profile.js文件，并从中输入变量。import命令接受一个对象（用大括号表示），里面指定要从其他模块导入的变量名。大括号里面的变量名，必须与被导入模块（profile.js）对外接口的名称相同。

　　如果想为输入的变量重新取一个名字，import命令要使用as关键字，将输入的变量重命名。

import { lastName as surname } from './profile';
 

　　import命令具有提升效果，会提升到整个模块的头部，首先执行。

foo();

import { foo } from 'my_module';
 

三、模块的整体加载

　　除了指定加载某个输出值，还可以使用整体加载，即用星号（*）指定一个对象，所有输出值都加载在这个对象上面。

　　有一个circle.js文件，它输出两个方法area和circumference。

　　现在，加载这个模块。

复制代码
// main.js

import { area, circumference } from './circle';

console.log('圆面积：' + area(4));
console.log('圆周长：' + circumference(14));
复制代码
　　上面写法是逐一指定要加载的方法，整体加载的写法如下。

import * as circle from './circle';

console.log('圆面积：' + circle.area(4));
console.log('圆周长：' + circle.circumference(14));
 

四、export default

　　为了给用户提供方便，让他们不用阅读文档就能加载模块，就要用到export default命令，为模块指定默认输出。

// export-default.js
export default function () {
    console.log('foo');
}
　　上面代码是一个模块文件export-default.js，它的默认输出是一个函数。

　　其他模块加载该模块时，import命令可以为该匿名函数指定任意名字。

// import-default.js
import customName from './export-default';
customName(); // 'foo'
　　需要注意的是，这时import命令后面，不使用大括号。

　　本质上，export default就是输出一个叫做default的变量或方法，然后系统允许你为它取任意名字。它后面不能跟变量声明语句。

复制代码
// 正确
var a = 1;
export default a;

// 错误
export default var a = 1;
复制代码
 

五、ES6模块加载的实质

　　ES6模块加载的机制，与CommonJS模块完全不同。CommonJS模块输出的是一个值的拷贝，而ES6模块输出的是值的引用。

　　CommonJS模块输出的是被输出值的拷贝，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。请看下面这个模块文件lib.js的例子。

复制代码
// lib.js
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  counter: counter,
  incCounter: incCounter,
};
复制代码
　　上面代码输出内部变量counter和改写这个变量的内部方法incCounter。然后，在main.js里面加载这个模块。

复制代码
// main.js
var mod = require('./lib');

console.log(mod.counter);  // 3
mod.incCounter();
console.log(mod.counter); // 3
复制代码
　　上面代码说明，lib.js模块加载以后，它的内部变化就影响不到输出的mod.counter了。这是因为mod.counter是一个原始类型的值，会被缓存。除非写成一个函数，才能得到内部变动后的值。

复制代码
// lib.js
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  get counter() {
    return counter
  },
  incCounter: incCounter,
};
复制代码
　　上面代码中，输出的counter属性实际上是一个取值器函数。现在再执行main.js，就可以正确读取内部变量counter的变动了。

 

　　ES6模块的运行机制与CommonJS不一样，它遇到模块加载命令import时，不会去执行模块，而是只生成一个动态的只读引用。等到真的需要用到时，再到模块里面去取值，换句话说，ES6的输入有点像Unix系统的“符号连接”，原始值变了，import输入的值也会跟着变。因此，ES6模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。

　　还是举上面的例子。

复制代码
// lib.js
export let counter = 3;
export function incCounter() {
  counter++;
}

// main.js
import { counter, incCounter } from './lib';
console.log(counter); // 3
incCounter();
console.log(counter); // 4
复制代码
　　上面代码说明，ES6模块输入的变量counter是活的，完全反应其所在模块lib.js内部的变化。

 

　　由于ES6输入的模块变量，只是一个“符号连接”，所以这个变量是只读的，对它进行重新赋值会报错。

复制代码
// lib.js
export let obj = {};

// main.js
import { obj } from './lib';

obj.prop = 123; // OK
obj = {}; // TypeError
复制代码
　　上面代码中，main.js从lib.js输入变量obj，可以对obj添加属性，但是重新赋值就会报错。因为变量obj指向的地址是只读的，不能重新赋值，这就好比main.js创造了一个名为obj的const变量。

　　最后，export通过接口，输出的是同一个值。不同的脚本加载这个接口，得到的都是同样的实例。

复制代码
// mod.js
function C() {
  this.sum = 0;
  this.add = function () {
    this.sum += 1;
  };
  this.show = function () {
    console.log(this.sum);
  };
}

export let c = new C();
复制代码
　　上面的脚本mod.js，输出的是一个C的实例。不同的脚本加载这个模块，得到的都是同一个实例。

复制代码
// x.js
import {c} from './mod';
c.add();

// y.js
import {c} from './mod';
c.show();

// main.js
import './x';
import './y';
复制代码
　　现在执行main.js，输出的是1。这就证明了x.js和y.js加载的都是C的同一个实例。