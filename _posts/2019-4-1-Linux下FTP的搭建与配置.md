---
layout:     post
title:      CentOS常用命令
subtitle:   Linux Server
date:       2019-3-31
author:     Lee
header-img: img/background-centos.png
catalog: true
tags:
    - Linux
    - CentOS
---

### 安装
```bash
sudo apt-get install vsftpd
sudo service vsftpd status
```

### 配置文件

1. `/etc/vsftp.conf`（主配置文件）
2. `/etc/vsftp.chroot_list`（可访问用户列表，配置文件里面有关联）

#### `/etc/vsftpd.config` 里面的注释比较多，还很详细，这里就不一一列举了，只写上我修改的
```
anonymous_enable=NO（是否允许匿名登陆）
local_enable=YES（是否允许本地登陆）
write_enable=YES（设置FTP可写）
//chroot （Change Root）
chroot_local_user=YES（设置成YES后，加入vsftpd.chroot_list中的用户可以通过ftp访问）
chroot_list_enable=YES（启用下面这个vsftpd.chroot_list）
chroot_list_file=/etc/vsftpd.chroot_list（指定一下list，这是文件默认的，但是并不存在，需要自己写一个）
```

#### `/etc/vsftpd.chroot_list`

这个文件比较简单，只需要将允许ftp登陆的用户名放进来就行，一个一行，像这样：
```
user
user1
user2
```

### 登陆

#### 命令行
```
user@userServer:/home$ ftp 192.168.1.123
Connected to 192.168.1.123.
220 (vsFTPd 2.3.5)
Name (192.168.1.123:username): user
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> 
```

#### 浏览器
ftp://192.168.1.123
