---
layout:     post
title:      SpringMVC基础配置
subtitle:   SpringMVC
date:       2019-3-1
author:     Lee
header-img: img/background-spring.jpg
catalog: true
tags:
    - Spring
    - Spring MVC
    - MVC
---

#### SpringMVC的优势

1. 角色划分：控制器(controller)、验证器(validator)、命令对象(command obect)、表单对象(form object)、模型对象(model object)、Servlet分发器(DispatcherServlet)、处理器映射(handler mapping)、试图解析器(view resoler)。每一个角色都可以由一个专门的对象来实现。
2. 配置方式：可以使用XML配置，也可以使用代码来实现零配置（下面会说）
3. 代码重用：可以使用现有的业务对象作为命令或表单对象，而不需要去扩展某个特定框架的基类。
4. restful风格：spring提供从最简单的URL映射，到复杂的、专用的定制策略。
5. 灵活的model转换：使用基于Map的键/值对来达到轻易的与各种视图技术集成。
6. 强大的标签库：使用在JSP编写更加容易。
7. 性能比Struts2好

#### 使用xml配置SpringMVC实例

1.创建web项目，拷贝所需要的包，也可以使用maven来构建

2.配置web.xml文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://java.sun.com/xml/ns/javaee" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd" id="WebApp_ID" version="3.0">
  <display-name>Springmvc</display-name>
  <welcome-file-list>
    <welcome-file>index.html</welcome-file>
    <welcome-file>index.htm</welcome-file>
    <welcome-file>index.jsp</welcome-file>
    <welcome-file>default.html</welcome-file>
    <welcome-file>default.htm</welcome-file>
    <welcome-file>default.jsp</welcome-file>
  </welcome-file-list>
  <!-- Spring ContextLoaderListener -->
  <listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
  </listener>
  <!--配置Spring-->
  <context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>/WEB-INF/spring/applicationContext.xml</param-value>
  </context-param>
  <!--配置SpringMVC-->
  <servlet>
    <servlet-name>spring-mvc</servlet-name>
    <servlet-class>
        org.springframework.web.servlet.DispatcherServlet
    </servlet-class>
    <init-param>  
        <param-name>contextConfigLocation</param-name>  
        <!--mvc的配置文件，最好在这里配置一下，以免找不文件而报错-->
        <param-value>/WEB-INF/spring/spring-mvc-serlvet.xml</param-value>  
    </init-param>  
    <!--服务器启动就加载-->
    <load-on-startup>1</load-on-startup>
  </servlet>
  <servlet-mapping>
    <servlet-name>spring-mvc</servlet-name>
    <url-pattern>/</url-pattern>
  </servlet-mapping>
</web-app>
```

3.配置Spring参数

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xmlns:mvc="http://www.springframework.org/schema/mvc"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
      http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
      http://www.springframework.org/schema/context
      http://www.springframework.org/schema/context/spring-context-4.3.xsd
      http://www.springframework.org/schema/mvc
      http://www.springframework.org/schema/mvc/spring-mvc-4.3.xsd">
    <!-- 启用注解驱动,即解决了@Controller注解的使用前提配置 -->
    <mvc:annotation-driven/>
    <!-- 在xml配置了这个标签后，spring可以自动去扫描base-pack下面或者子包下面的Java文件，
     如果扫描到有@Component @Controller@Service等这些注解的类，则把这些类注册为bean
           注意：如果配置了<context:component-scan>那么<context:annotation-config/>标签
           就可以不用再xml中配置了，因为前者包含了后者  -->
    <context:component-scan base-package="com.xxxx.mvc"></context:component-scan>
</beans>
```

4.SpringMVC配置文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans  xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:p="http://www.springframework.org/schema/p"
    xmlns:context="http://www.springframework.org/schema/context"
    xmlns:mvc="http://www.springframework.org/schema/mvc"
    xmlns:beans="http://www.springframework.org/schema/beans"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
      http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
      http://www.springframework.org/schema/context
      http://www.springframework.org/schema/context/spring-context-4.3.xsd
      http://www.springframework.org/schema/mvc
      http://www.springframework.org/schema/mvc/spring-mvc-4.3.xsd">
    <!-- 配置视图解析器 -->
    <bean
       class="org.springframework.web.servlet.view.InternalResourceViewResolver">
       <property name="prefix">
           <value>/WEB-INF/jsp/</value>
       </property>
       <property name="suffix">
           <value>.jsp</value>
       </property>
   </bean>
   <!-- 配置资源 -->
   <mvc:resources location="/css" mapping="/css"></mvc:resources>
   <mvc:resources location="/js" mapping="/js"></mvc:resources>
   <mvc:resources location="/img" mapping="/img"></mvc:resources>
</beans>
```

5.Controller类

```java
package com.xxxx.mvc;

import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 *@description
 *@author create by
 *@date
 */
@Controller
public class HelloController {

    @RequestMapping("/")
    public String index(Model model)
    {
        System.out.println("hello");
         //转到helloworld.jsp
         return "hello";
    }
    @RequestMapping(value="/hello*")
    public String hello(@RequestParam String hello ,Model model)
    {
         System.out.println(hello);//获取url请求的参数
         model.addAttribute("greeting", "Hello Spring MVC");
         //转到helloworld.jsp
         return "helloworld";
    }
}
```

6.hello.jsp

```jsp
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Insert title here</title>
</head>
<body>
        <form action="hello.do?${hello}"><!--传递请求参数-->
              <input name="hello" id="hello" type="text">
              <input id="submit" name="submit" type="submit">
        </form>
</body>
</html>
```

7.helloworld.jsp

```jsp
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Insert title here</title>
</head>
<body>
        <h1>${greeting}</h1>
</body>
</html>
```

8.输入localhost:8080/SpringMVCTest/

9.注意的细节

* 配置文件中版本号最好与你的jar版本号对应，比如我的Spring的jar包都是4.3的

```text
http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
http://www.springframework.org/schema/context
http://www.springframework.org/schema/context/spring-context-4.3.xsd
http://www.springframework.org/schema/mvc
http://www.springframework.org/schema/mvc/spring-mvc-4.3.xsd">
```

* 注意配置文件的开头要配置成这样：

```xml
<beans  xmlns="http://www.springframework.org/schema/beans"
```

不能这样配置：

```xml
<beans  xmlns:bean="http://www.springframework.org/schema/beans"
```

会报异常：

```text
Line 13 in XML document from ServletContext resource [/WEB-INF/spring/spring-mvc-serlvet.xml] is invalid; nested exception is org.xml.sax.SAXParseException; lineNumber: 13; columnNumber: 70; cvc-elt.1: 找不到元素 'beans' 的声明。
```

#### SpringMVC零配置实现

HelloWorldInitializer实现WebApplicationInitializer替代web.xml。这个类在Servlet容器启动时就会加载

```java
package com.xxxx.config;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

/**
 *@description 代替web.xml
 *@author create by
 *@date
 *此类在servlet容器启动时加载
 */
public class HelloWorldInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext container) throws ServletException {
        // TODO Auto-generated method stub
        AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
        ctx.register(HelloWorldConfiguration.class);//把我们的配置到这里相当于我们把--servlet.xml配置到web.xml里
        ctx.setServletContext(container);
        //相当于 <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        ServletRegistration.Dynamic servlet = container.addServlet("dispatcher", new DispatcherServlet(ctx));
        //<load-on-startup>1</load-on-startup>
        servlet.setLoadOnStartup(1);
        // <servlet-name>spring-mvc</servlet-name>url-pattern>/</url-pattern>
        servlet.addMapping("/");
    }

}
```

也可以继承AbstractAnnotationConfigDispatcherServletInitializer然后实现
getRootConfigClasses() ；getServletConfigClasses() ；getServletMappings() 。其中getRootConfigClasses()相当于我们在web.xml中配置spring-mvc-servlet.xml。getServletMappings()方法就是相当于在web.xml文件中配置访问映射。

```java
package com.xxxx.config;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

/**
 *@description 代替web.xml
 *@author create by
 *@date
 *此类在servlet容器启动时加载
 */
public class HelloWorldInitializer extends AbstractAnnotationConfigDispatcherServletInitializer
{

    @Override
    protected Class<?>[] getRootConfigClasses() {
        // TODO Auto-generated method stub
        return new Class[]{HelloWorldConfiguration.class};
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    protected String[] getServletMappings() {
        // TODO Auto-generated method stub
        return new String[]{"/"};
    }
```

HelloWorldConfiguration替代spring-mvc-servlet.xml配置

```java
package com.xxxx.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.view.InternalResourceViewResolver;
import org.springframework.web.servlet.view.JstlView;

/**
 *@description 配置类相当于spring-mvc-servlet.xml
 *@author create by
 *@date
 */
@EnableWebMvc
@Configuration
@ComponentScan(basePackages = "com.xxxx.controller")
public class HelloWorldConfiguration {

    @Bean
    public ViewResolver getViewResolver()
    {
        //视图解析器
        InternalResourceViewResolver resolver = new InternalResourceViewResolver();
        resolver.setViewClass(JstlView.class);
        resolver.setSuffix(".jsp");
        resolver.setPrefix("/WEB-INF/views/");
        return resolver;
    }
```

最后的效果和xml配置是一样的。
