---
layout:     post
title:      Dockerfile详解
subtitle:   容器系列
date:       2019-3-18
author:     Lee
header-img: img/background-docker.jpg
catalog: true
tags:
    - Docker
    - 容器
---

## Dockerfile 命令

### ADD

ADD命令有两个参数，源和目标。它的基本作用是从源系统的文件系统上复制文件到目标容器的文件系统。如果源是一个URL，那该URL的内容将被下载并复制到容器中。

```Dockerfile
# Usage: ADD [source directory or URL] [destination directory]
ADD /my_app_folder /my_app_folder 
```

#### CMD

和RUN命令相似，CMD可以用于执行特定的命令。和RUN不同的是，这些命令不是在镜像构建的过程中执行的，而是在用镜像构建容器后被调用。

```Dockerfile
# Usage 1: CMD application "argument", "argument", ..
CMD "echo" "Hello docker!"
```

#### ENTRYPOINT

配置容器启动后执行的命令，并且不可被 docker run 提供的参数覆盖。
每个 Dockerfile 中只能有一个 ENTRYPOINT，当指定多个时，只有最后一个起效。
ENTRYPOINT 帮助你配置一个容器使之可执行化，如果你结合CMD命令和ENTRYPOINT命令，你可以从CMD命令中移除“application”而仅仅保留参数，参数将传递给ENTRYPOINT命令。

```Dockerfile
# Usage: ENTRYPOINT application "argument", "argument", ..
# Remember: arguments are optional. They can be provided by CMD
# or during the creation of a container.
ENTRYPOINT echo
# Usage example with CMD:
# Arguments set with CMD can be overridden during *run*
CMD "Hello docker!"
ENTRYPOINT echo
```

#### ENV

ENV命令用于设置环境变量。这些变量以`key=value`的形式存在，并可以在容器内被脚本或者程序调用。这个机制给在容器中运行应用带来了极大的便利。

```Dockerfile
# Usage: ENV key value
ENV SERVER_WORKS 4
```

#### EXPOSE

EXPOSE用来指定端口，使容器内的应用可以通过端口和外界交互。

```Dockerfile
# Usage: EXPOSE [port]
EXPOSE 8080
```

#### FROM

FROM命令可能是最重要的Dockerfile命令。改命令定义了使用哪个基础镜像启动构建流程。基础镜像可以为任意镜 像。如果基础镜像没有被发现，Docker将试图从Docker image index来查找该镜像。FROM命令必须是Dockerfile的首个命令。

```Dockerfile
# Usage: FROM [image name]
FROM ubuntu
```

#### MAINTAINER

我建议这个命令放在Dockerfile的起始部分，虽然理论上它可以放置于Dockerfile的任意位置。这个命令用于声明作者，并应该放在FROM的后面。

```Dockerfile
# Usage: MAINTAINER [name]
MAINTAINER authors_name
```

#### RUN

RUN命令是Dockerfile执行命令的核心部分。它接受命令作为参数并用于创建镜像。不像CMD命令，RUN命令用于创建镜像（在之前commit的层之上形成新的层）。

```Dockerfile
# Usage: RUN [command]
RUN aptitude install -y riak
```

#### USER

USER命令用于设置运行容器的UID。

```Dockerfile
# Usage: USER [UID]
USER 751
```

#### VOLUME

VOLUME命令用于让你的容器访问宿主机上的目录。

```Dockerfile
# Usage: VOLUME ["/dir_1", "/dir_2" ..]
VOLUME ["/my_files"]
```

#### WORKDIR

WORKDIR命令用于设置CMD指明的命令的运行目录。

```Dockerfile
# Usage: WORKDIR /path
WORKDIR ~/
```

### 如何使用Dockerfiles

使用Dockerfiles和手工使用Docker Daemon运行命令一样简单。脚本运行后输出为新的镜像ID。

```Bash
# Build an image using the Dockerfile at current location
# Example: sudo docker build -t [name] .
sudo docker build -t my_mongodb .
```

#### Dockerfile 示例一：创建一个MongoDB的镜像

在这部分中，我们讲一步一步创建一个Dockfile，这个Dockerfile可用于构建MongoDB镜像进而构建MongoDB容器。

* 创建一个Dockerfile

```Bash
vim Dockerfile
```

* 定义文件

```Dockerfile
############################################################
# Dockerfile to build MongoDB container images
# Based on Ubuntu
############################################################
# Set the base image to Ubuntu
FROM ubuntu
# File Author / Maintainer
MAINTAINER Example McAuthor
################## BEGIN INSTALLATION ######################
# Install MongoDB Following the Instructions at MongoDB Docs
# Ref: http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
# Add the package verification key
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
# Add MongoDB to the repository sources list
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | tee /etc/apt/sources.list.d/mongodb.list
# Update the repository sources list once more
RUN apt-get update
# Install MongoDB package (.deb)
RUN apt-get install -y mongodb-10gen
# Create the default data directory
RUN mkdir -p /data/db
##################### INSTALLATION END #####################

# Expose the default port
EXPOSE 27017
# Default port to execute the entrypoint (MongoDB)
CMD ["--port 27017"]
# Set default container command
ENTRYPOINT usr/bin/mongod
```

* 构建镜像
使用上述的Dockerfile，我们已经可以开始构建MongoDB镜像

```Bash
sudo docker build -t my_mongodb .
```

#### Dockerfile 示例二：创建一个Nginx的镜像

```Dockerfile
############################################################
# Dockerfile to build Nginx Installed Containers
# Based on Ubuntu
############################################################
# Set the base image to Ubuntu
FROM ubuntu
# File Author / Maintainer
MAINTAINER Maintaner Name
# Install Nginx
# Add application repository URL to the default sources
RUN echo "deb http://archive.ubuntu.com/ubuntu/ raring main universe" >> /etc/apt/sources.list
# Update the repository
RUN apt-get update
# Install necessary tools
RUN apt-get install -y nano wget dialog net-tools
# Download and Install Nginx
RUN apt-get install -y nginx
# Remove the default Nginx configuration file
RUN rm -v /etc/nginx/nginx.conf
# Copy a configuration file from the current directory
ADD nginx.conf /etc/nginx/
# Append "daemon off;" to the beginning of the configuration
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
# Expose ports
EXPOSE 80
# Set the default command to execute
# when creating a new container
CMD service nginx start
```

因为我们命令Docker用当前目录的Nginx的配置文件替换默认的配置文件，我们要保证这个新的配置文件存在。在Dockerfile存在的目录下，创建nginx.conf：

```Bash
vim nginx.conf
```

然后用下述内容替换原有内容：

```nginx
worker_processes 1;
events { worker_connections 1024; }
http {
     sendfile on;
     server {
         listen 80;
         location / {
              proxy_pass       http://httpstat.us/;
              proxy_set_header X-Real-IP $remote_addr;
         }
     }
}
```

让我们保存nginx.conf。之后我们就可以用Dockerfile和配置文件来构建镜像。
