---
layout:     post
title:      Java Maven项目有关配置
subtitle:   Java体系
date:       2019-1-5
author:     Lee
header-img: img/background-java.jpg
catalog: true
tags:
    - Java
    - Maven
---

#### Maven项目修改java编译版本

使用Maven编译Java项目，默认的jdk编译版本是[1.5](https://maven.apache.org/plugins/maven-compiler-plugin/compile-mojo.html)。

**方案一：全局设置**
在${MAVEN_HOME}/conf/setting.xml中改变默认的编译版本，激活profile：

```xml
<profiles>
    <profile>
        <id>jdk1.8</id>
        <activation>
            <activeByDefault>true</activeByDefault>
            <jdk>1.8</jdk>
        </activation>
        <properties>
            <maven.compiler.source>1.8</maven.compiler.source>
            <maven.compiler.target>1.8</maven.compiler.target>
            <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
            <encoding>UTF-8</encoding>
        </properties>
    </profile>
</profiles>
```

**方案二：项目单独配置**
好的实践：在项目中单独配置jdk版本。将项目在其它设备上依然能够保证所用jdk版本正确。
修改pom文件中，加入以下配置：

```xml
<build>  
    <plugins>  
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <source>1.8</source>
                <target>1.8</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>
    </plugins>  
</build>  
```

**方案三：项目单独配置（简化加强版）**
推荐使用此方式。
修改pom文件中，加入以下配置：

```xml
<properties>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
</properties>
```

#### Maven项目编译之后xml文件不存在

Maven项目默认不加载此类文件

**方案一：** 是将xml文件放在maven中的“resources”目录下；

**方案二：** 是在Maven项目的根目录的pom.xml文件中添加指定生成xml资源文件的目录，其代码如下：

```xml
 <!-- maven 默认不会编译xml配置文件,需要手动指定-->
    <project>
     <build>
　　　　<resources>
            <resource>
                <directory>src/main/java</directory>
                <includes>
                    <include>**/*.xml</include>
                </includes>
                <filtering>true</filtering>
            </resource>
        </resources>
      </build>
　　</project>
```
