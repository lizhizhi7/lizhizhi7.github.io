---
layout:     post
title:      Dockerfile与自动部署
subtitle:   容器系列
date:       2019-3-18
author:     Lee
header-img: img/background-docker.jpg
catalog: true
tags:
    - Docker
    - CI
    - DevOps
    - 容器
---

## Docker在Maven项目中的使用

### 配置 DOCKER_HOST

docker-maven-plugin 插件默认连接本地 Docker 地址为：localhost:2375，修改该设置的方法有两种

1.环境变量。

```Shell
DOCKER_HOST=tcp://<host>:2375
```

2.指定到 POM 中

```xml
<!--指定远程 docker api地址-->
<dockerHost>http://<host>:2375</dockerHost>
```

### 构建镜像

构建镜像可以使用一下两种方式，第一种是将构建信息指定到 POM 中，第二种是使用已存在的 Dockerfile 构建。

#### 指定构建信息到 POM 中构建

支持将 FROM, ENTRYPOINT, CMD, MAINTAINER 以及 ADD 信息配置在 POM 中，不需要使用 Dockerfile 配置。但是不能使用 VOLUME 或其他 Dockerfile 中的命令。

```xml
<build>
    <plugins>
        <plugin>
            <groupId>com.spotify</groupId>
            <artifactId>docker-maven-plugin</artifactId>
            <version>1.0.0</version>
            <configuration>
                <imageName>mavendemo</imageName>
                <baseImage>java</baseImage>
                <maintainer>docker_maven docker_maven@email.com</maintainer>
                <workdir>/ROOT</workdir>
                <cmd>["java", "-version"]</cmd>
                <entryPoint>["java", "-jar", "${project.build.finalName}.jar"]</entryPoint>
                <!-- 这里是复制 jar 包到 docker 容器指定目录配置 -->
                <resources>
                    <resource>
                        <targetPath>/ROOT</targetPath>
                        <directory>${project.build.directory}</directory>
                        <include>${project.build.finalName}.jar</include>
                    </resource>
                </resources>
            </configuration>
        </plugin>
    </plugins>
</build>
```

#### 使用 Dockerfile 构建

```xml
<build>
    <plugins>
         <plugin>
            <groupId>com.spotify</groupId>
            <artifactId>docker-maven-plugin</artifactId>
            <version>1.0.0</version>
            <configuration>
                <imageName>mavendemo</imageName>
                <dockerDirectory>${basedir}/docker</dockerDirectory> <!-- 指定 Dockerfile 路径-->
                <!-- 这里是复制 jar 包到 docker 容器指定目录配置，也可以写到 Docokerfile 中 -->
                <resources>
                    <resource>
                        <targetPath>/ROOT</targetPath>
                        <directory>${project.build.directory}</directory>
                        <include>${project.build.finalName}.jar</include>
                    </resource>
                </resources>
            </configuration>
        </plugin>
    </plugins>
</build>
```

${basedir}/docker/Dockerfile 配置

```Dockerfile
FROM java
MAINTAINER docker_maven docker_maven@email.com
WORKDIR /ROOT
CMD ["java", "-version"]
ENTRYPOINT ["java", "-jar", "${project.build.finalName}.jar"]
```

以上两种方式执行docker:build效果是一样的，执行完成后，使用docker images查看生成的镜像：

```text
REPOSITORY       TAG           IMAGE ID            CREATED             SIZE
mavendemo        latest        333b429536b2        38 minutes ago      643 MB
```

### 执行命令

* `mvn clean package docker:build` 只执行 build 操作
* `mvn clean package docker:build -DpushImage` 执行 build 完成后 push 镜像
* `mvn clean package docker:build -DpushImageTag` 执行 build 并 push 指定 tag 的镜像

>注意：这里必须指定至少一个 imageTag，它可以配置到 POM 中，也可以在命令行指定。

命令行指定如下：  
`mvn clean package docker:build -DpushImageTags -DdockerImageTags=imageTag_1 -DdockerImageTags=imageTag_2`  
POM 文件中指定配置如下：

```xml
<build>
  <plugins>
    ...
    <plugin>
      <configuration>
        ...
        <imageTags>
           <imageTag>imageTag_1</imageTag>
           <imageTag>imageTag_2</imageTag>
        </imageTags>
      </configuration>
    </plugin>
    ...
  </plugins>
</build>
```

### 绑定Docker 命令到 Maven 各个阶段

我们可以绑定 Docker 命令到 Maven 各个阶段，我们可以把 Docker 分为 build、tag、push，然后分别绑定 Maven 的 package、deploy 阶段，此时，我们只需要执行mvn deploy就可以完成整个 build、tag、push操作了，当我们执行mvn build就只完成 build、tag 操作。除此此外，当我们想跳过某些步骤或者只执行某个步骤时，不需要修改 POM 文件，只需要指定跳过 docker 某个步骤即可。比如当我们工程已经配置好了自动化模板了，但是这次我们只需要打镜像到本地自测，不想执行 push 阶段，那么此时执行要指定参数-DskipDockerPush就可跳过 push 操作了。

```xml
<build>
    <plugins>
        <plugin>
            <groupId>com.spotify</groupId>
            <artifactId>docker-maven-plugin</artifactId>
            <version>1.0.0</version>
            <configuration>
                <imageName>mavendemo</imageName>
                <baseImage>java</baseImage>
                <maintainer>docker_maven docker_maven@email.com</maintainer>
                <workdir>/ROOT</workdir>
                <cmd>["java", "-version"]</cmd>
                <entryPoint>["java", "-jar", "${project.build.finalName}.jar"]</entryPoint>
                <resources>
                    <resource>
                        <targetPath>/ROOT</targetPath>
                        <directory>${project.build.directory}</directory>
                        <include>${project.build.finalName}.jar</include>
                    </resource>
                </resources>
            </configuration>
            <executions>
                <execution>
                    <id>build-image</id>
                    <phase>package</phase>
                    <goals>
                        <goal>build</goal>
                    </goals>
                </execution>
                <execution>
                    <id>tag-image</id>
                    <phase>package</phase>
                    <goals>
                        <goal>tag</goal>
                    </goals>
                    <configuration>
                        <image>mavendemo:latest</image>
                        <newName>docker.io/wanyang3/mavendemo:${project.version}</newName>
                    </configuration>
                </execution>
                <execution>
                    <id>push-image</id>
                    <phase>deploy</phase>
                    <goals>
                        <goal>push</goal>
                    </goals>
                    <configuration>
                        <imageName>docker.io/wanyang3/mavendemo:${project.version}</imageName>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

以上示例，当我们执行mvn package时，执行 build、tag 操作，当执行mvn deploy时，执行build、tag、push 操作。如果我们想跳过 docker 某个过程时，只需要：

```text
-DskipDockerBuild 跳过 build 镜像
-DskipDockerTag 跳过 tag 镜像
-DskipDockerPush 跳过 push 镜像
-DskipDocker 跳过整个阶段
```

> 例如：我们想执行 package 时，跳过 tag 过程，那么就需要mvn package -DskipDockerTag。

### 使用私有 Docker 仓库地址

实际工作环境中，我们需要 push 镜像到我们私有 Docker 仓库中，使用docker-maven-plugin 插件我们也是很容易实现，有几种方式实现：

#### 修改 POM 文件 imageName 操作

```xml
<configuration>
    <imageName>registry.example.com/wanyang3/mavendemo:v1.0.0</imageName>
    ...
</configuration>
```

#### 修改 POM 文件中 newName 操作

```xml
<configuration>
    <imageName>mavendemo</imageName>
    ...
</configuration>
<execution>
    <id>tag-image</id>
    <phase>package</phase>
    <goals>
        <goal>tag</goal>
    </goals>
    <configuration>
        <image>mavendemo</image>
        <newName>registry.example.com/wanyang3/mavendemo:v1.0.0</newName>
    </configuration>
</execution>
```

### 安全认证配置

当我们 push 镜像到 Docker 仓库中时，不管是共有还是私有，经常会需要安全认证，登录完成之后才可以进行操作。当然，我们可以通过命令行 docker login -u user_name -p password docker_registry_host 登录，但是对于自动化流程来说，就不是很方便了。使用 docker-maven-plugin 插件我们可以很容易实现安全认证。

首先在 Maven 的配置文件 setting.xml 中增加相关 server 配置，主要配置 Docker registry用户认证信息。

```xml
<servers>
  <server>
    <id>my-docker-registry</id>
    <username>wanyang3</username>
    <password>12345678</password>
    <configuration>
      <email>wanyang3@mail.com</email>
    </configuration>
  </server>
</servers>
```

然后只需要在 pom.xml 中使用 server id 即可。

```xml
<plugin>
  <plugin>
    <groupId>com.spotify</groupId>
    <artifactId>docker-maven-plugin</artifactId>
    <version>1.0.0</version>
    <configuration>
      <imageName>registry.example.com/wanyang3/mavendemo:v1.0.0</imageName>
      ...
      <serverId>my-docker-registry</serverId>
    </configuration>
  </plugin>
</plugins>
```

### 其他参数

docker-maven-plugin 插件还提供了很多很实用的配置，稍微列举几个参数吧。

|参数|说明|默认值|
|:-:|:-:|:-:|
|`<forceTags>true</forceTags>`|build 时强制覆盖 tag，配合 imageTags 使用|false|
|`<noCache>true</noCache>`|build 时，指定 –no-cache 不使用缓存|false|
|`<pullOnBuild>true</pullOnBuild>`|build 时，指定 –pull=true 每次都重新拉取基础镜像|false|
|`<pushImage>true</pushImage>`|build 完成后 push 镜像|false|
|`<pushImageTag>true</pushImageTag>`|build 完成后，push 指定 tag 的镜像，配合 imageTags 使用|false|
|`<retryPushCount>5</retryPushCount>`|push 镜像失败，重试次数|5|
|`<retryPushTimeout>10</retryPushTimeout>`|push 镜像失败，重试时间|10s|
|`<rm>true</rm>`|build 时，指定 –rm=true 即 build 完成后删除中间容器|false|
|`<useGitCommitId>true</useGitCommitId>`|build 时，使用最近的 git commit id 前7位作为tag，例如：image:b50b604，前提是不配置 newName|false|
