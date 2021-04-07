# 使用 D8 分析 javascript 如何被 V8 引擎优化的

在上一篇文章中我们讲了[如何使用 GN 编译 V8 源码](https://zhuanlan.zhihu.com/p/25120909)，文章最后编译完成的可执行文件并不是 V8，而是 D8。这篇我们讲一下如何使用 D8 调试 javascript 代码。

**如果没有 d8，可以使用 node 代替。**

新建文件 [add-of-ints.js](https://github.com/justjavac/v8-source-read/blob/master/src/add-of-ints.js)，输入以下内容：

```
function add(obj) {
    return obj.prop + obj.prop;
}

const length = 1000 * 1000;

const o = { prop: 1 };

for (let i = 0; i < length; i++) {
    add(o);

}
```

运行：

```
d8 --trace-opt-verbose add-of-ints.js
或
node --trace-opt-verbose add-of-ints.js
```

输出结果为：

![image-20200923143703939](https://pic.intellizhi.cn/blogimg/image-20200923143703939.png)

![img](https://justjavac.com/assets/images/trace-opt-verbose-1.png)

从输出结果我们可以看到 add 函数被编译器优化了，并且解释了优化的原因。ICs 是 [inline caches](https://en.wikipedia.org/wiki/Inline_caching) 的缩写，内联缓存是一种很常见的优化技术，这段简短的代码被 V8 引擎优化了两次，但是原因却不同。

- 第一次优化的原因是 small function，add 函数是小函数，为了减小函数调用的开销，V8 引擎对 add 做了优化。
- 第二次的原因是 hot and stable，我在知乎另一个问题中曾说过，V8 有两个编译器，一个通用编译器，负责将 javascript 代码编译为机器码，另一个是优化编译器。从上面的输出可以看出 V8 使用的优化编译器引擎是 Crankshaft。Crankshaft 负责找出经常被调用的代码，做内联缓存优化，后面的信息进一步说明了这个情况：ICs with typeinfo: 7/7 (100%), generic ICs: 0/7 (0%)。

在此再纠正之前的 2 个问题。

一个是 ~~V8 没有解释器，只有编译器，代码是直接编译成机器吗执行的~~，这是之前的 V8，而网络上关于 V8 的文章也大多比较老旧。这几天为了阅读 V8 源码查看了网上很多关于 V8 的论文和文章，发现 V8 已经引进了[解释器](https://docs.google.com/document/d/11T2CRex9hXxoJwbYqVQ32yIPMh0uouUZLdyrtmMoL44/edit#)。因为 V8 不仅仅可以优化代码，还可以去优化（deopt），引入解释器可以省去一些代码的重编译时间，另一个原因是解释器不仅仅可以解释 javascript 代码，还可以解释 asm 或者其他二进制中间码。

另一个错误就是关于 V8 优化的，之前写过 [JavaScript 函数式编程存在性能问题么？](https://www.zhihu.com/question/54637225/answer/140362071) 中道：

> 永远不可能被优化的有：
>
> - Functions that contain a debugger statement
> - Functions that call literally eval()
> - Functions that contain a with statement

这个也是之前的文章，是以 Crankshaft 引擎为标准得出的结论。而 V8 已经开发了新的优化引擎——[TurboFan](http://v8project.blogspot.de/2015/07/digging-into-turbofan-jit.html)。

我们再创建另一个文件 add-of-mixed.js，输入：

```
// flag: --trace-opt-verbose

function add(obj) {
    return obj.prop + obj.prop;
}

var length = 1000 * 1000;

var objs = new Array(length);

var i = 0;

for (i = 0; i < length; i++) {
    objs[i] = Math.random();
}

var a = { prop: 'a' };
var b = { prop: 1 };

for (i = 0; i < length; i++) {
    add(objs[i] > 0.5 ? a : b);

}
```

运行：

```
d8 --trace-opt-verbose add-of-mixed.js
或
node --trace-opt-verbose add-of-mixed.js
```

输出结果为：

![image-20200923144304306](https://pic.intellizhi.cn/blogimg/image-20200923144304306.png)

![img](https://justjavac.com/assets/images/trace-opt-verbose-2.png)

![img](https://justjavac.com/assets/images/trace-opt-verbose-3.png)

可以看到这段代码能不能做内联缓存优化全看 RP(人品) 了。

我们再使用 `--trace-opt --trace-deopt` 参数看看 V8 引擎如何**去优化**。

新建文件 [add-of-mixed-dep.js](https://github.com/justjavac/v8-source-read/blob/master/src/add-of-mixed-dep.js)，输入：

```
// flags: --trace-opt --trace-deopt

function add(obj) {
    return obj.prop + obj.prop;
}

var length = 10000;
var i = 0;
var a = { prop: 'a' };
var b = { prop: 1 };

for (i = 0; i < length; i++) {
    add(i !== 8000 ? a : b);

}
```

运行：

```
d8 --trace-opt --trace-deopt add-of-mixed-dep.js
或
node --trace-opt --trace-deopt add-of-mixed-dep.js
```

结果为：

![image-20200923150509252](https://pic.intellizhi.cn/blogimg/image-20200923150509252.png)

![img](https://justjavac.com/assets/images/trace-opt-verbose-4.png)

V8 引擎内部使用 [Hidden Classes](http://blog.twokul.io/hidden-classes-in-javascript-and-inline-caching/) 来表示 Object，关于 Hidden Classes 的文章已经很多了，我就不累述了。

运行 `d8 --help` 可以查看所有的 d8 命令行参数。如果使用 node，直接运行 `node --help` 输出的是 node 的命令行参数，如果想查看 V8 的，需要使用 `node --v8-options`。

后面章节会介绍 V8 的 GC（命令行参数 `--trace-gc`）以及最有意思的 `--allow-natives-syntax`。

推荐阅读一下 V8 的 [bailout-reason.h](https://github.com/v8/v8/blob/84b9c6301e4e01bb084f467bc8582826cdf55e28/src/bailout-reason.h) 源码，这是一个 C++ 的头文件，里面几乎没有任何代码逻辑，定义了所有 javascript 代码不能被 V8 引擎优化的原因，比如：

```
"Array index constant value too big"
"eval"
"ForOfStatement"
"Too many parameters"
"WithStatement"
……
```

后面章节介绍的 `--allow-natives-syntax` 相关 C++ 头文件是 [runtime.h](https://github.com/v8/v8/blob/84b9c6301e4e01bb084f467bc8582826cdf55e28/src/runtime/runtime.h#L856-L919)，通过 `--allow-natives-syntax` 参数可以在 javascript 中使用 V8 的运行时函数。我们在之前的文章中已经使用过了，例如 `HasFastProperties`。







```TypeScript
type PublicInterfaceOf<Class> = {
    [Member in keyof Class]: Class[Member];
}

class ListComponent {
    private itemCount: number;
    
    getFilteredList(): string[] {
        // ... snip
    }
}

class MockListComponent implements PublicInterfaceOf<ListComponent> {
    getFilteredList(): string[] {
        // ... mock snip
    }
}


type LifecycleMethods = 'ngOnInit' | 'ngOnChanges' | 'ngOnDestroy'; // etc.
```

Let’s use `Exclude` in our mapped type to give us an interface of all public, non-lifecycle members of our `ListComponent`:

```TypeScript
type MockOf<Class> = {
    [Member in Exclude<keyof Class, LifecycleMethods>]: Class[Member];
};

class MockListComponent implements MockOf<ListComponent> {
    getFilteredList(): string[] {
        // ... mock snip
    }
}
```

## General Solution

To round up, here’s a full listing of a general mocking solution for TypeScript 2.8 and above:

```TypeScript
/**
* This is the class we want to mock. It includes a mix of private and public members,
* including some public members that we don't care about for the purposes of our mock.
*/
class MyClass {
    
    unimportantField: number;
    private someInternalState: string;
    
    constructor(banana: BananaWithGorillaAndJungle) {
        banana.peel();
    }
    
    importantMethod(input: string): string {
        // important stuff that we'd like to stub when it comes to testing
        return 'a real string';
    }
    
    unimportantMethod(): void {
        // does something or other
    }
    
    private privateMethod(): void {
        // we don't care about this at all
    }
    
}

/**
* The MockOf type takes a class and an optional union of 
* public members which we don't want to have to implement in
* our mock.
*/
type MockOf<Class, Omit extends keyof Class = never> = {
    [Member in Exclude<keyof Class, Omit>]: Class[Member];
}

/**
 * Our mock need only implement the members we need. Note that even the omitted members
 * are still type-safe: changing the name of "unimportantField" in MyClass will
 * result in a compiler error in the mock.
 */
class MockMyClass implements MockOf<MyClass, 'unimportantField' | 'unimportantMethod'> {
    importantMethod(input: string): string {
        return 'a test string';
    }
}
```

### 常量折叠

V8 引擎使用了常量折叠（const folding）。常量折叠是一种编译器的编译优化技术。

考虑如下代码：

```
for (let i = 0; i < 100*100*100; i++){
  // 循环体
}
```

该循环的条件 `i<100*100*100` 是一个表达式（expression），如果放到判断时再求值那么 `100*100*100` 的计算将会进行 1000000 次。 如果编译器在语法分析阶段进行常量合并，该循环将会变为这样：

```
for (let i = 0; i < 1000000; i++){
  // 循环体
}
```

而上文中提到的 `99 ** 99` 的计算也使用到了常量折叠。也就是说 `99 ** 99` 是在编译时进行计算（常量折叠），而 `Math.pow` 总是在运行时进行计算。 当我们使用变量进行幂运算时（例 `a ** b`）此时不存在常量折叠，因此 `a ** b` 的值在运行时进行计算，`**` 会被编译成 `Math.pow` 调用。

### 隐藏类

JavaScript 限制编译时的类型信息：类型可以在运行时被改变，可想而知这导致 JS 类型在编译时代价昂贵。那么你一定会问：JavaScript 的性能有机会和 C++ 相提并论吗？尽管如此，V8 在运行时隐藏了内部创建对象的类型，隐藏类相同的对象可以使用相同的生成码以达到优化的目的。

比如：

```
function Point(x, y) {
  this.x = x;
  this.y = y;
}

var p1 = new Point(11, 22);
var p2 = new Point(33, 44);
// 这里的 p1 和 p2 拥有共享的隐藏类
p2.z = 55;
// 注意！这时 p1 和 p2 的隐藏类已经不同了！
```

在我们为 `p2` 添加 `z` 这个成员之前，`p1` 和 `p2` 一直共享相同的内部隐藏类——所以 V8 可以生成一段单独版本的优化汇编码，这段代码可以同时封装 `p1` 和 `p2` 的 JavaScript 代码。我们越避免隐藏类的派生，就会获得越高的性能。

结论

- 在构造函数里初始化所有对象的成员(所以这些实例之后不会改变其隐藏类)
- 总是以相同的次序初始化对象成员

### 数字

当类型可以改变时，V8 使用标记来高效的标识其值。V8 通过其值来推断你会以什么类型的数字来对待它。因为这些类型可以动态改变，所以一旦 V8 完成了推断，就会通过标记高效完成值的标识。不过有的时候改变类型标记还是比较消耗性能的，我们最好保持数字的类型始终不变。通常标识为有符号的 31 位整数是最优的。

比如：

```
var i = 42; // 这是一个31位有符号整数
var j = 4.2; // 这是一个双精度浮点数
```

结论

尽量使用可以用 31 位有符号整数表示的数。

### 数组

为了掌控大而稀疏的数组，V8 内部有两种数组存储方式：

- 快速元素：对于紧凑型关键字集合，进行线性存储
- 字典元素：对于其它情况，使用哈希表

最好别导致数组存储方式在两者之间切换。

结论

- 使用从 0 开始连续的数组关键字

- 别预分配大数组(比如大于 64K 个元素)到其最大尺寸，令其尺寸顺其自然发展就好

- 别删除数组里的元素，尤其是数字数组

- 别加载未初始化或已删除的元素： 　 

  ```javascript
  a = new Array();
  for (var b = 0; b < 10; b++) {
  	a[0] |= b;	// 杯具
  }
  // vs.
  a = new Array();
  a[0] = 0;
  for (var b = 0; b < 10; b++) {
  	a[0] |= b; // 比上面快 2 倍
  }
  ```

同样的，双精度数组会更快——数组的隐藏类会根据元素类型而定，而只包含双精度的数组会被拆箱(unbox)，这导致隐藏类的变化。对数组不经意的封装就可能因为装箱/拆箱(boxing/unboxing)而导致额外的开销。比如：

```javascript
var a = new Array();
a[0] = 77; // 分配
a[1] = 88;
a[2] = 0.5; // 分配，转换
a[3] = true; // 分配，转换
```

下面的写法效率更高：

```
var a = [77, 88, 0.5, true];
```

因为第一个例子是一个一个分配赋值的，并且对 `a[2]` 的赋值导致数组被拆箱为了双精度。但是对 `a[3]` 的赋值又将数组重新装箱回了任意值(数字或对象)。第二种写法时，编译器一次性知道了所有元素的字面上的类型，隐藏隐藏类可以直接确定。

结论

- 初始化小额定长数组时，用字面量进行初始化
- 小数组(小于 64k)在使用之前先预分配正确的尺寸
- 请勿在数字数组中存放非数字的值(对象)
- 如果通过非字面量进行初始化小数组时，切勿触发类型的重新转换

## JavaScript 编译

尽管 JavaScript 是个非常动态的语言，且原本的实现是解释性的，但现代的 JavaScript 运行时引擎都会进行编译。V8(Chrome 的 JavaScript)有两个不同的运行时(JIT)编译器：

- “完全”编译器，可以为任何 JavaScript 生成优秀的代码
- 优化编译器，可以为大部分 JavaScript 生成伟大(汗一下自己的翻译)的代码，但会更耗时。

## 完全编译器

在 V8 中，完全编译器会以最快的速度运行在任何代码上，快速生成优秀但不伟大的代码。该编译器在编译时几乎不做任何有关类型的假设——它预测类型在运行时会发生改变。完全编译器的生成码通过内联缓存(ICs)在程序运行时提炼类型相关的知识，以便将来改进和优化。

内联缓存的目的是，通过缓存依赖类型的代码进行操作，更有效率的掌控类型。当代码运行时，它会先验证对类型的假设，然后使用内联缓存快速执行操作。这也意味着可以接受多种类型的操作会变得效率低下。

### 结论

- 单态操作优于多态操作

如果一个操作的输入总是相同类型的，则其为单态操作。否则，操作调用时的某个参数可以跨越不同的类型，那就是多态操作。比如 `add()` 的第二个调用就触发了多态操作：

function add(x, y) { return x + y; }

add(1, 2); // add 中的 + 操作是单态操作 add(“a”, “b”); // add 中的 + 操作变成了多态操作

## 优化编译器

V8 有一个和完全编译器并行的优化编译器，它会重编那些最“热门”(即被调用多次)的函数。优化编译器通过类型反馈来使得编译过的代码更快——事实上它就是使用了我们之前谈到的 ICs 的类型信息！

在优化编译器里，操作都是内联的(直接出现在被调用的地方)。它加速了执行(拿内存空间换来的)，同时也进行了各种优化。单态操作的函数和构造函数可以整个内联起来(这是 V8 中单态操作的有一个好处)。

你可以使用单独的“d8”版本的 V8 引擎来获取优化记录：

```
d8 --trace-opt primes.js
```

(其会把被优化的函数名输出出来)

不是所有的函数都可以被优化，有些特性会阻止优化编译器运行一个已知函数(bail-out)。目前优化编译器会排除有 try/catch 的代码块的函数。

### 结论

- 如果存在 try/catch 代码快，则将性能敏感的代码放到一个嵌套的函数中： 　 

  ```javascript
  function perf_sentitive() {
  // 把性能敏感的工作放置于此
  }
  try {
  perf_sentitive()
  } catch (e) {
  // 在此处理异常
  }
  ```

  这个建议可能会在未来发生改变，因为我们会在优化编译器里开启 try/catch 代码块。你可以通过使用上述的 d8 选项 `--trace-opt` 得到更多有关这些函数的信息来检验优化编译器如何排除这些函数。

```
d8 –trace-opt primes.js

```

## 取消优化

最终，编译器的性能优化是有针对性的——有时它的变现并不好，我们就不得不回退。“取消优化”的过程实际上就是把优化过的代码扔掉，恢复执行完全编译器的代码。重优化可能稍后再打开，但是短期内性能会下降。尤其是取消优化的发生会导致其函数的变量的隐藏类的变化。

### 结论

- 回避在优化过后函数内隐藏类改变

你可以像其它优化一样，通过 V8 的一个日志标识来取消优化。

```
d8 –trace-deopt primes.js
```

## 其它V8工具

顺便提一下，你还可以在Chrome启动时传递V8跟踪选项：

```
“/Applications/Google Chrome.app/Contents/MacOS/Google Chrome” –js-flags=”–trace-opt –trace-deopt”
```

额外使用开发者工具分析，你可以使用 d8 进行分析：

```
% out/ia32.release/d8 primes.js –prof 
```

它通过内建的采样分析器，对每毫秒进行采样，并写入 v8.log。

## 回到摘要……

重要的是认识和理解 V8 引擎如何处理你的代码，进而为优化 JavaScript 做好准备。再次强调我们的基础建议：

- 首先，未雨绸缪
- 然后，找到症结
- 最后，修复它

这意味着你应该通过 PageSpeed 之类的工具先确定你的 JavaScript 中的问题，在收集指标之前尽可能减少至纯粹的 JavaScript(没有 DOM)，然后通过指标来定位瓶颈所在，评估重要程度。希望 Daniel 的分享会帮助你更好的理解V8如何运行 JavaScript ——但是也要确保专注于优化你自身的算法！





### 为什么 `++[[]][+[]]+[+[]] = 10`

下面看看高人的题解：

```javascript
++[[]][+[]]+[+[]]
```

如果把这段表达式拆分开来，它相等于：

```javascript
++[[]][+[]]
+
[+[]]
```

在 JavaScript 里，`+[] === 0` 是完全正确的。 `+` 会把一些字符转化成数字，在这里，这个式子会变成 `+""` 或 `0`。

因此，我们可以简化一下(`++` 比 `+` 有更高的优先级)：

```
++[[]][0]
+
[0]
```

因为 `[[]][0]` 的意思是：获取 `[[]]` 的第一个元素，这就得出了下面的结果：

- `[[]][0]` 返回内部数组 (`[]`)。根据语言规范，我们说 `[[]][0] === []` 是不正确的，但让我们把这个内部数组称作 A，以避免错误的写法。
- `++[[]][0] == A + 1`， 因为 `++` 的意思是”加一”。
- `++[[]][0] === +(A + 1)`；换句话说，你得到的永远是个数值( `+1` 并不一定得到的是个数值，但 `++` 一定是)。
- **? 为什么++[] 会报错**

同样，我们可以把这一堆代码简化的更清晰。让我们把 A 换回成 `[]` :

```
+([] + 1)
+
[0]
```

在 JavaScript 里，这也是正确的：`[] + 1 === "1"`，因为 `[] == ""` (这相当于一个空的数组的内部元素连接)，于是：

```
+([] + 1) === +("” + 1)，并且 
+("” + 1) === +("1")，并且 
+("1") === 1 
```

让我们再次简化一下：

```
1
+
[0]
```

同样，在 Javascript 里，这是正确的：`[0] == "0"`，因为这是相当于一个有一个元素的数组的内部元素的连接。 各元素会使用，分隔。 当只有一个元素时，你可以推论出这个过程的结果就是它自身的第一个元素。

所以，最终我们得到 (数字 + 字符串 = 字符串)：

```
1
+
"0"

=== "10" // 耶！
```



---

Specification details for `+[]`:

This is quite a maze, but to do `+[]`, first it is being converted to a string because that's what `+` says:

> 11.4.6 Unary + Operator
>
> The unary + operator converts its operand to Number type.
>
> The production UnaryExpression : + UnaryExpression is evaluated as follows:
>
> 1. Let expr be the result of evaluating UnaryExpression.
> 2. Return ToNumber(GetValue(expr)).

`ToNumber()` says:

> Object
>
> Apply the following steps:
>
> 1. Let primValue be ToPrimitive(input argument, hint String).
> 2. Return ToString(primValue).

`ToPrimitive()` says:

> Object
>
> Return a default value for the Object. The default value of an object is retrieved by calling the [[DefaultValue]] internal method of the object, passing the optional hint PreferredType. The behaviour of the [[DefaultValue]] internal method is defined by this specification for all native ECMAScript objects in 8.12.8.

`[[DefaultValue]]` says:

> 8.12.8 [[DefaultValue]] (hint)
>
> When the [[DefaultValue]] internal method of O is called with hint String, the following steps are taken:
>
> 1. Let toString be the result of calling the [[Get]] internal method of object O with argument "toString".
> 2. If IsCallable(toString) is true then,
>
> a. Let str be the result of calling the [[Call]] internal method of toString, with O as the this value and an empty argument list.
>
> b. If str is a primitive value, return str.

The `.toString` of an array says:

> 15.4.4.2 Array.prototype.toString ( )
>
> When the toString method is called, the following steps are taken:
>
> 1. Let array be the result of calling ToObject on the this value.
> 2. Let func be the result of calling the [[Get]] internal method of array with argument "join".
> 3. If IsCallable(func) is false, then let func be the standard built-in method Object.prototype.toString (15.2.4.2).
> 4. Return the result of calling the [[Call]] internal method of func providing array as the this value and an empty arguments list.

So `+[]` comes down to `+""`, because `[].join() === ""`.

Again, the `+` is defined as:

> 11.4.6 Unary + Operator
>
> The unary + operator converts its operand to Number type.
>
> The production UnaryExpression : + UnaryExpression is evaluated as follows:
>
> 1. Let expr be the result of evaluating UnaryExpression.
> 2. Return ToNumber(GetValue(expr)).

`ToNumber` is defined for `""` as:

> The MV of StringNumericLiteral ::: [empty] is 0.

So `+"" === 0`, and thus `+[] === 0`.



About `++[]`vs `++[[]][0]`



Part of this isn't correct. The expression boils down to `1 + [0]`, not `"1" + [0]`, because the prefix (`++`) operator always returns a number. See [bclary.com/2004/11/07/#a-11.4.4](http://bclary.com/2004/11/07/#a-11.4.4) – [Tim Down](https://stackoverflow.com/users/96100/tim-down) [Sep 9 '11 at 14:10](https://stackoverflow.com/questions/7202157/why-does-return-the-string-10#comment8884891_7202287) 

@Tim Down: You're completely correct. I'm trying to correct this, but when trying to do so I found something else. I'm not sure how this is possible. `++[[]][0]` returns indeed `1`, but `++[]` throws an error. This is remarkable because it looks like `++[[]][0]` does boil down to `++[]`. Do you perhaps have any idea why `++[]` throws an error whereas `++[[]][0]` does not? – [pimvdb](https://stackoverflow.com/users/514749/pimvdb) [Sep 9 '11 at 14:42](https://stackoverflow.com/questions/7202157/why-does-return-the-string-10#comment8885494_7202287) 

@pimvdb: I'm pretty sure the problem is in the `PutValue` call (in ES3 terminology, 8.7.2) in the prefix operation. `PutValue` requires a Reference whereas `[]` as an expression on its own does not produce a Reference. An expression containing a variable reference (say we'd previously defined `var a = []` then `++a` works) or property access of an object (such as `[[]][0]`) produces a Reference. In simpler terms, the prefix operator not only produces a value, it also needs somewhere to put that value. – [Tim Down](https://stackoverflow.com/users/96100/tim-down) [Sep 9 '11 at 15:36](https://stackoverflow.com/questions/7202157/why-does-return-the-string-10#comment8886602_7202287)

@pimvdb: So after executing `var a = []; ++a`, `a` is 1. After executing `++[[]][0]`, the array created by the `[[]]` expression is now contains just the number 1 at index 0. `++` requires a Reference to do this. – [Tim Down](https://stackoverflow.com/users/96100/tim-down) [Sep 9 '11 at 15:50](https://stackoverflow.com/questions/7202157/why-does-return-the-string-10#comment8886856_7202287) 



DevTools -> Take Heap Shot

**Shallow Size**：对象自身占用内存的大小，不包括它引用的对象。JavaScript 对象会将一些内存用于自身的说明和保存中间值。通常，只有数组和字符串会有明显的浅层大小。

**Retained Size**：这是将对象本身连同其无法从 **GC root** 到达的相关对象一起删除后释放的内存大小。

单位是字节(Byte)。

从截图中可以看到，`Symbol()` 的内存占用是 16。

`Object.create(null)` 自身占用 12，总占用 88。

`{}` 自身占用 28，总占用 28。

继续展开你会看到其他信息：

[![img](https://github.com/justjavac/v8-javascript-memory/raw/master/screen2.png)](https://github.com/justjavac/v8-javascript-memory/blob/master/screen2.png)

1. `__proto__` 是原型链。
2. `map` 就是很多文章都在介绍的 V8 对象的黑魔法 Hidden Class。

## 使用 V8 进行调试

V8 的 `%DebugPrint()` 函数可以打印出对象的调试信息。这需要手动使用 `--is_debug=true` 参数来编译 V8。

代码：

```
let o = {};
%DebugPrint(o);
```

运行：`d8 --allow_natives_syntax heap.js`

输出：

```
DebugPrint: 0x2604080c60e9: [JS_OBJECT_TYPE]
 - map: 0x2604082802d9 <Map(HOLEY_ELEMENTS)> [FastProperties]
 - prototype: 0x2604082413c9 <Object map = 0x2604082801c1>
 - elements: 0x2604080406e9 <FixedArray[0]> [HOLEY_ELEMENTS]
 - properties: 0x2604080406e9 <FixedArray[0]> {}
0x2604082802d9: [Map]
 - type: JS_OBJECT_TYPE
 - instance size: 28
 - inobject properties: 4
 - elements kind: HOLEY_ELEMENTS
 - unused property fields: 4
 - enum length: invalid
 - back pointer: 0x26040804030d <undefined>
 - prototype_validity cell: 0x2604081c0451 <Cell value= 1>
 - instance descriptors (own) #0: 0x2604080401b5 <DescriptorArray[0]>
 - prototype: 0x2604082413c9 <Object map = 0x2604082801c1>
 - constructor: 0x2604082413e5 <JSFunction Object (sfi = 0x2604081c5869)>
 - dependent code: 0x2604080401ed <Other heap object (WEAK_FIXED_ARRAY_TYPE)>
 - construction counter: 0
```

**注：**虽然 node 和 deno 都支持 V8 的 `--allow_natives_syntax` 参数，但是如果你使用 node 或者 deno 运行，只能得到一行类似 `0x053bedbc1399 <Object map = 0x53b630d1d51>` 的输出。 如果想得到详细的输出，必须手动编译，并且在编译过程中增加 `--is_debug=true` 参数。

## 