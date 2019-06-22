nginx的location配置详解
语法规则： location [=|~|~*|^~] /uri/ { … }
= 开头表示精确匹配
^~ 开头表示uri以某个常规字符串开头，理解为匹配 url路径即可。nginx不对url做编码，因此请求为/static/20%/aa，可以被规则^~ /static/ /aa匹配到（注意是空格）。
~ 开头表示区分大小写的正则匹配
~*  开头表示不区分大小写的正则匹配
!~和!~*分别为区分大小写不匹配及不区分大小写不匹配 的正则
/ 通用匹配，任何请求都会匹配到。
多个location配置的情况下匹配顺序为（参考资料而来，还未实际验证，试试就知道了，不必拘泥，仅供参考）：
首先匹配 =，其次匹配^~, 其次是按文件中顺序的正则匹配，最后是交给 / 通用匹配。当有匹配成功时候，停止匹配，按当前匹配规则处理请求。
 

例子，有如下匹配规则：

 

 

[plain] view plain copy
 
 在CODE上查看代码片派生到我的代码片
location = / {  
   #规则A  
}  
location = /login {  
   #规则B  
}  
location ^~ /static/ {  
   #规则C  
}  
location ~ \.(gif|jpg|png|js|css)$ {  
   #规则D  
}  
location ~* \.png$ {  
   #规则E  
}  
location !~ \.xhtml$ {  
   #规则F  
}  
location !~* \.xhtml$ {  
   #规则G  
}  
location / {  
   #规则H  
}  
 

 

 

那么产生的效果如下：
访问根目录/， 比如http://localhost/ 将匹配规则A
访问 http://localhost/login 将匹配规则B，http://localhost/register 则匹配规则H
访问 http://localhost/static/a.html 将匹配规则C
访问 http://localhost/a.gif, http://localhost/b.jpg 将匹配规则D和规则E，但是规则D顺序优先，规则E不起作用，而 http://localhost/static/c.png 则优先匹配到 规则C
访问 http://localhost/a.PNG 则匹配规则E， 而不会匹配规则D，因为规则E不区分大小写。
访问 http://localhost/a.xhtml 不会匹配规则F和规则G，http://localhost/a.XHTML不会匹配规则G，因为不区分大小写。规则F，规则G属于排除法，符合匹配规则但是不会匹配到，所以想想看实际应用中哪里会用到。
访问 http://localhost/category/id/1111 则最终匹配到规则H，因为以上规则都不匹配，这个时候应该是nginx转发请求给后端应用服务器，比如FastCGI（php），tomcat（jsp），nginx作为方向代理服务器存在。
所以实际使用中，通常至少有三个匹配规则定义，如下：
 

 

[plain] view plain copy
 
 在CODE上查看代码片派生到我的代码片
#直接匹配网站根，通过域名访问网站首页比较频繁，使用这个会加速处理，官网如是说。  
#这里是直接转发给后端应用服务器了，也可以是一个静态首页  
# 第一个必选规则  
location = / {  
    proxy_pass http://tomcat:8080/index  
}  
   
# 第二个必选规则是处理静态文件请求，这是nginx作为http服务器的强项  
# 有两种配置模式，目录匹配或后缀匹配,任选其一或搭配使用  
location ^~ /static/ {  
    root /webroot/static/;  
}  
location ~* \.(gif|jpg|jpeg|png|css|js|ico)$ {  
    root /webroot/res/;  
}  
   
#第三个规则就是通用规则，用来转发动态请求到后端应用服务器  
#非静态文件请求就默认是动态请求，自己根据实际把握  
#毕竟目前的一些框架的流行，带.php,.jsp后缀的情况很少了  
location / {  
    proxy_pass http://tomcat:8080/  
}  



 

 

以下部分直接copy过来的，有点乱，可以作为参考

 

三、ReWrite语法
last – 基本上都用这个Flag。
break – 中止Rewirte，不在继续匹配
redirect – 返回临时重定向的HTTP状态302
permanent – 返回永久重定向的HTTP状态301
注：last和break最大的不同在于
- break是终止当前location的rewrite检测,而且不再进行location匹配 - last是终止当前location的rewrite检测,但会继续重试location匹配并处理区块中的rewrite规则
1、下面是可以用来判断的表达式：
-f和!-f用来判断是否存在文件
-d和!-d用来判断是否存在目录
-e和!-e用来判断是否存在文件或目录
-x和!-x用来判断文件是否可执行
2、下面是可以用作判断的全局变量
$args #这个变量等于请求行中的参数。
$content_length #请求头中的Content-length字段。
$content_type #请求头中的Content-Type字段。
$document_root #当前请求在root指令中指定的值。
$host #请求主机头字段，否则为服务器名称。
$http_user_agent #客户端agent信息
$http_cookie #客户端cookie信息
$limit_rate #这个变量可以限制连接速率。
$request_body_file #客户端请求主体信息的临时文件名。
$request_method #客户端请求的动作，通常为GET或POST。
$remote_addr #客户端的IP地址。
$remote_port #客户端的端口。
$remote_user #已经经过Auth Basic Module验证的用户名。
$request_filename #当前请求的文件路径，由root或alias指令与URI请求生成。
$query_string #与$args相同。
$scheme #HTTP方法（如http，https）。
$server_protocol #请求使用的协议，通常是HTTP/1.0或HTTP/1.1。
$server_addr #服务器地址，在完成一次系统调用后可以确定这个值。
$server_name #服务器名称。
$server_port #请求到达服务器的端口号。
$request_uri #包含请求参数的原始URI，不包含主机名，如：”/foo/bar.php?arg=baz”。
$uri #不带请求参数的当前URI，$uri不包含主机名，如”/foo/bar.html”。
$document_uri #与$uri相同。
例：http://localhost:88/test1/test2/test.php
$host：localhost
$server_port：88
$request_uri：http://localhost:88/test1/test2/test.php
$document_uri：/test1/test2/test.php
$document_root：D:\nginx/html
$request_filename：D:\nginx/html/test1/test2/test.php
四、Redirect语法
多目录转成参数
abc.domian.com/sort/2 => abc.domian.com/index.php?act=sort&name=abc&id=2
1.     if ($host ~* (.*)\.domain\.com) {
2.     set $sub_name $1;   
3.     rewrite ^/sort\/(\d+)\/?$ /index.php?act=sort&cid=$sub_name&id=$1 last;
4.     }
目录对换
/123456/xxxx -> /xxxx?id=123456
1.     rewrite ^/(\d+)/(.+)/ /$2?id=$1 last;
例如下面设定nginx在用户使用ie的使用重定向到/nginx-ie目录下：
1.     if ($http_user_agent ~ MSIE) {
2.     rewrite ^(.*)$ /nginx-ie/$1 break;
3.     }
目录自动加“/”
1.     if (-d $request_filename){
2.     rewrite ^/(.*)([^/])$ http://$host/$1$2/ permanent;
3.     }
禁止htaccess
1.     location ~/\.ht {
2.              deny all;
3.          }
禁止多个目录
1.     location ~ ^/(cron|templates)/ {
2.              deny all;
3.     break;
4.          }
禁止以/data开头的文件
可以禁止/data/下多级目录下.log.txt等请求;
1.     location ~ ^/data {
2.              deny all;
3.          }
禁止单个目录
不能禁止.log.txt能请求
1.     location /searchword/cron/ {
2.              deny all;
3.          }
禁止单个文件
1.     location ~ /data/sql/data.sql {
2.              deny all;
3.          }
给favicon.ico和robots.txt设置过期时间;
这里为favicon.ico为99 天,robots.txt为7天并不记录404错误日志
1.     location ~(favicon.ico) {
2.                      log_not_found off;
3.     expires 99d;
4.     break;
5.          }
6.      
7.          location ~(robots.txt) {
8.                      log_not_found off;
9.     expires 7d;
10. break;
11.      }
设定某个文件的过期时间;这里为600秒，并不记录访问日志
1.     location ^~ /html/scripts/loadhead_1.js {
2.                      access_log   off;
3.                      root /opt/lampp/htdocs/web;
4.     expires 600;
5.     break;
6.            }
文件反盗链并设置过期时间
这里的return 412 为自定义的http状态码，默认为403，方便找出正确的盗链的请求
“rewrite ^/ http://leech.c1gstudio.com/leech.gif;”显示一张防盗链图片
“access_log off;”不记录访问日志，减轻压力
“expires 3d”所有文件3天的浏览器缓存
1.     location ~* ^.+\.(jpg|jpeg|gif|png|swf|rar|zip|css|js)$ {
2.     valid_referers none blocked *.c1gstudio.com *.c1gstudio.net localhost 208.97.167.194;
3.     if ($invalid_referer) {
4.         rewrite ^/ http://leech.c1gstudio.com/leech.gif;
5.         return 412;
6.         break;
7.     }
8.                      access_log   off;
9.                      root /opt/lampp/htdocs/web;
10. expires 3d;
11. break;
12.      }
只充许固定ip访问网站，并加上密码
1.     root  /opt/htdocs/www;
2.     allow   208.97.167.194;
3.     allow   222.33.1.2;
4.     allow   231.152.49.4;
5.     deny    all;
6.     auth_basic "C1G_ADMIN";
7.     auth_basic_user_file htpasswd;
将多级目录下的文件转成一个文件，增强seo效果
/job-123-456-789.html 指向/job/123/456/789.html
1.     rewrite ^/job-([0-9]+)-([0-9]+)-([0-9]+)\.html$ /job/$1/$2/jobshow_$3.html last;
将根目录下某个文件夹指向2级目录
如/shanghaijob/ 指向 /area/shanghai/
如果你将last改成permanent，那么浏览器地址栏显是 /location/shanghai/
1.     rewrite ^/([0-9a-z]+)job/(.*)$ /area/$1/$2 last;
上面例子有个问题是访问/shanghai 时将不会匹配
1.     rewrite ^/([0-9a-z]+)job$ /area/$1/ last;
2.     rewrite ^/([0-9a-z]+)job/(.*)$ /area/$1/$2 last;
这样/shanghai 也可以访问了，但页面中的相对链接无法使用，
如./list_1.html真实地址是/area /shanghia/list_1.html会变成/list_1.html,导至无法访问。
那我加上自动跳转也是不行咯
(-d $request_filename)它有个条件是必需为真实目录，而我的rewrite不是的，所以没有效果
1.     if (-d $request_filename){
2.     rewrite ^/(.*)([^/])$ http://$host/$1$2/ permanent;
3.     }
知道原因后就好办了，让我手动跳转吧
1.     rewrite ^/([0-9a-z]+)job$ /$1job/ permanent;
2.     rewrite ^/([0-9a-z]+)job/(.*)$ /area/$1/$2 last;
文件和目录不存在的时候重定向：
1.     if (!-e $request_filename) {
2.     proxy_pass http://127.0.0.1;
3.     }
域名跳转
1.     server
2.          {
3.                  listen       80;
4.                  server_name  jump.c1gstudio.com;
5.                  index index.html index.htm index.php;
6.                  root  /opt/lampp/htdocs/www;
7.                  rewrite ^/ http://www.c1gstudio.com/;
8.                  access_log  off;
9.          }
多域名转向
1.     server_name  www.c1gstudio.com www.c1gstudio.net;
2.                  index index.html index.htm index.php;
3.                  root  /opt/lampp/htdocs;
4.     if ($host ~ "c1gstudio\.net") {
5.     rewrite ^(.*) http://www.c1gstudio.com$1 permanent;
6.     }
三级域名跳转
1.     if ($http_host ~* "^(.*)\.i\.c1gstudio\.com$") {
2.     rewrite ^(.*) http://top.yingjiesheng.com$1;
3.     break;
4.     }
域名镜向
1.     server
2.          {
3.                  listen       80;
4.                  server_name  mirror.c1gstudio.com;
5.                  index index.html index.htm index.php;
6.                  root  /opt/lampp/htdocs/www;
7.                  rewrite ^/(.*) http://www.c1gstudio.com/$1 last;
8.                  access_log  off;
9.          }