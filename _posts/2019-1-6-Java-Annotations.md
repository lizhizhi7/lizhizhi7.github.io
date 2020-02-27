---
layout:     post
title:      Java Annotations
subtitle:   Java体系
date:       2019-1-5
author:     Oliver Li
header-img: img/background-java.jpg
catalog: true
tags:
    - Java
---

## 注解其他的注解

J2SE5.0版本在`java.lang.annotation`提供了四种元注解，专门注解其他的注解：

* `@Documented` –注解是否将包含在JavaDoc中
* `@Retention` –什么时候使用该注解
* `@Target` –注解用于什么地方
* `@Inherited` – 是否允许子类继承该注解

### @Documented

一个简单的Annotations标记注解，表示是否将注解信息添加在java文档中。

### @Retention

定义该注解的生命周期。

* `RetentionPolicy.SOURCE` – 在编译阶段丢弃。这些注解在编译结束之后就不再有任何意义，所以它们不会写入字节码。@Override, @SuppressWarnings都属于这类注解。
* `RetentionPolicy.CLASS` – 在类加载的时候丢弃。在字节码文件的处理中有用。注解默认使用这种方式。
* `RetentionPolicy.RUNTIME` – 始终不会丢弃，运行期也保留该注解，因此可以使用反射机制读取该注解的信息。我们自定义的注解通常使用这种方式。

### @Target

表示该注解用于什么地方。如果不明确指出，该注解可以放在任何地方。以下是一些可用的参数。需要说明的是：属性的注解是兼容的，如果你想给7个属性都添加注解，仅仅排除一个属性，那么你需要在定义target包含所有的属性。

* `ElementType.TYPE` - 用于描述类、接口或enum声明
* `ElementType.FIELD` - 用于描述实例变量
* `ElementType.METHOD`
* `ElementType.PARAMETER`
* `ElementType.CONSTRUCTOR`
* `ElementType.LOCAL_VARIABLE`
* `ElementType.ANNOTATION_TYPE` - 另一个注释
* `ElementType.PACKAGE` - 用于记录java文件的package信息

### @Inherited

定义该注释和子类的关系

## 注解的内部定义

Annotations只支持基本类型、String及枚举类型。注释中所有的属性被定义成方法，并允许提供默认值。

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@interface Todo {
public enum Priority {LOW, MEDIUM, HIGH}
public enum Status {STARTED, NOT_STARTED}
　　String author() default "Yash";
　　Priority priority() default Priority.LOW;
　　Status status() default Status.NOT_STARTED;
}
```

下面的例子演示了如何使用上面的注解。

```java
@Todo(priority = Todo.Priority.MEDIUM, author = "Yashwant", status = Todo.Status.STARTED)
public void incompleteMethod1() {
//Some business logic is written
//But it’s not complete yet
}
```

如果注解中只有一个属性，可以直接命名为“value”，使用时无需再标明属性名。

```java
@interface Author{
String value();
}

@Author("Yashwant")
public void someMethod() {
}
```

但目前为止一切看起来都还不错。我们定义了自己的注解并将其应用在业务逻辑的方法上。现在我们需要写一个用户程序调用我们的注解。这里我们需要使用反射机制。如果你熟悉反射代码，就会知道反射可以提供**类名、方法和实例变量对象**。

所有这些对象都有getAnnotation()这个方法用来返回注解信息。我们需要把这个对象转换为我们自定义的注释(使用`instanceOf()`检查之后)，同时也可以调用自定义注释里面的方法。看看以下的实例代码，使用了上面的注解:

```java
Class businessLogicClass = BusinessLogic.class;
for(Method method : businessLogicClass.getMethods()) {
　　Todo todoAnnotation = (Todo)method.getAnnotation(Todo.class);
　　if(todoAnnotation != null) {
　　　　System.out.println(" Method Name : " + method.getName());
　　　　System.out.println(" Author : " + todoAnnotation.author());
　　　　System.out.println(" Priority : " + todoAnnotation.priority());
　　　　System.out.println(" Status : " + todoAnnotation.status());
　　}
}
```

## 注解用例

注解的功能很强大，Spring和Hebernate这些框架在日志和有效性中大量使用了注解功能。注解可以应用在使用标记接口的地方。不同的是标记接口用来定义完整的类，但你可以为单个的方法定义注释，例如是否将一个方法暴露为服务。  
在最新的servlet3.0中引入了很多新的注解，尤其是和servlet安全相关的注解。

* `HandlesTypes` –该注解用来表示一组传递给ServletContainerInitializer的应用类。
* `HttpConstraint` – 该注解代表所有HTTP方法的应用请求的安全约束，和ServletSecurity注释中定义的HttpMethodConstraint安全约束不同。
* `HttpMethodConstraint` – 指明不同类型请求的安全约束，和ServletSecurity 注解中描述HTTP协议方法类型的注释不同。
* `MultipartConfig` –该注解标注在Servlet上面，表示该Servlet希望处理的请求的 MIME 类型是 multipart/form-data。
* `ServletSecurity` 该注解标注在Servlet继承类上面，强制该HTTP协议请求遵循安全约束。
* `WebFilter` – 该注解用来声明一个Server过滤器；
* `WebInitParam` – 该注解用来声明Servlet或是过滤器的中的初始化参数，通常配合 @WebServlet 或者 @WebFilter 使用。
* `WebListener` –该注解为Web应用程序上下文中不同类型的事件声明监听器。
* `WebServlet` –该注解用来声明一个Servlet的配置。

## ADF (应用程序框架)和注解

现在我们开始讨论文章的最后一部分了。应用程序框架，被称为ADF，由Oracle开发用来创建Oracle融合应用。我们已经了解了注解的优缺点，也知道如何编写自定义的注解，但我们应该将注解应用在ADF的哪部分呢？ADF是否提供了一些朴素的注解？

很好的问题，确实在ADF中大量使用注解有一些限制。之前提到的应用框架如Spring和Hibernate使用AOP(面向侧面的程序设计)。在AOP中，框架提供了一种机制，在事件的预处理和后续处理中注入代码。

例如：你有一个钩子用来在方法执行之前和之后添加代码，所以你可以在这些地方编写你的用户代码。ADF不使用AOP。如果我们有任何注解的用例可用，我们可能需要通过继承的方式实现。
