 7、Java中的网络支持
             针对网络通信的不同层次，Java提供了不同的API，其提供的网络功能有四大类：
              InetAddress:用于标识网络上的硬件资源，主要是IP地址
              URL：统一资源定位符，通过URL可以直接读取或写入网络上的数据
              Sockets：使用TCP协议实现的网络通信Socket相关的类
              Datagram:使用UDP协议，将数据保存在用户数据报中，通过网络进行通信。
 
二、InetAddress
         InetAddress类用于标识网络上的硬件资源，标识互联网协议(IP)地址。 
         该类没有构造方法        

//获取本机的InetAddress实例
InetAddress address =InetAddress.getLocalHost();
address.getHostName();//获取计算机名
address.getHostAddress();//获取IP地址
byte[] bytes = address.getAddress();//获取字节数组形式的IP地址,以点分隔的四部分

//获取其他主机的InetAddress实例
InetAddress address2 =InetAddress.getByName("其他主机名");
InetAddress address3 =InetAddress.getByName("IP地址");

三、URL类
         1、URL(Uniform Resource Locator)统一资源定位符，表示Internet上某一资源的地址，协议名：资源名称   

         //创建一个URL的实例
URL baidu =new URL("http://www.baidu.com");
URL url =new URL(baidu,"/index.html?username=tom#test");//？表示参数，#表示锚点
url.getProtocol();//获取协议
url.getHost();//获取主机
url.getPort();//如果没有指定端口号，根据协议不同使用默认端口。此时getPort()方法的返回值为 -1
url.getPath();//获取文件路径
url.getFile();//文件名，包括文件路径+参数
url.getRef();//相对路径，就是锚点，即#号后面的内容
url.getQuery();//查询字符串，即参数

2、使用URL读取网页内容
           通过URL对象的openStream()方法可以得到指定资源的输入流，通过流能够读取或访问网页上的资源  

//使用URL读取网页内容
//创建一个URL实例
URL url =new URL("http://www.baidu.com");
InputStream is = url.openStream();//通过openStream方法获取资源的字节输入流
InputStreamReader isr =newInputStreamReader(is,"UTF-8");//将字节输入流转换为字符输入流,如果不指定编码，中文可能会出现乱码
BufferedReader br =newBufferedReader(isr);//为字符输入流添加缓冲，提高读取效率
String data = br.readLine();//读取数据
while(data!=null){
System.out.println(data);//输出数据
data = br.readerLine();
}
br.close();
isr.colose();
is.close();

四、TCP编程
         1、TCP协议是面向连接的、可靠的、有序的、以字节流的方式发送数据，通过三次握手方式建立连接，形成传输数据的通道，在连接中进行大量数据的传输，效率会稍低
         2、Java中基于TCP协议实现网络通信的类
            客户端的Socket类
            服务器端的ServerSocket类
            3、Socket通信的步骤
                 ① 创建ServerSocket和Socket
                 ② 打开连接到Socket的输入/输出流
                 ③ 按照协议对Socket进行读/写操作
                 ④ 关闭输入输出流、关闭Socket
           4、服务器端：
                 ① 创建ServerSocket对象，绑定监听端口
                 ② 通过accept()方法监听客户端请求
                 ③ 连接建立后，通过输入流读取客户端发送的请求信息
                 ④ 通过输出流向客户端发送乡音信息
                 ⑤ 关闭相关资源

                 5、客户端：

                 ① 创建Socket对象，指明需要连接的服务器的地址和端口号
                 ② 连接建立后，通过输出流想服务器端发送请求信息
                 ③ 通过输入流获取服务器响应的信息
                 ④ 关闭响应资源
6、应用多线程实现服务器与多客户端之间的通信

               ① 服务器端创建ServerSocket，循环调用accept()等待客户端连接
               ② 客户端创建一个socket并请求和服务器端连接
               ③ 服务器端接受苦读段请求，创建socket与该客户建立专线连接
               ④ 建立连接的两个socket在一个单独的线程上对话
               ⑤ 服务器端继续等待新的连接 

五、UDP编程
       UDP协议（用户数据报协议）是无连接的、不可靠的、无序的,速度快
       进行数据传输时，首先将要传输的数据定义成数据报（Datagram），大小限制在64k，在数据报中指明数据索要达到的Socket（主机地址和端口号），然后再将数据报发送出去
       DatagramPacket类:表示数据报包
       DatagramSocket类：进行端到端通信的类
       1、服务器端实现步骤
           ① 创建DatagramSocket，指定端口号
           ② 创建DatagramPacket
           ③ 接受客户端发送的数据信息
           ④ 读取数据

五、UDP编程
       UDP协议（用户数据报协议）是无连接的、不可靠的、无序的,速度快
       进行数据传输时，首先将要传输的数据定义成数据报（Datagram），大小限制在64k，在数据报中指明数据索要达到的Socket（主机地址和端口号），然后再将数据报发送出去
       DatagramPacket类:表示数据报包
       DatagramSocket类：进行端到端通信的类
       1、服务器端实现步骤
           ① 创建DatagramSocket，指定端口号
           ② 创建DatagramPacket
           ③ 接受客户端发送的数据信息
           ④ 读取数据
复制代码
 1 //服务器端，实现基于UDP的用户登录
 2 //1、创建服务器端DatagramSocket，指定端口
 3 DatagramSocket socket =new datagramSocket(10010);
 4 //2、创建数据报，用于接受客户端发送的数据
 5 byte[] data =newbyte[1024];//
 6 DatagramPacket packet =newDatagramPacket(data,data.length);
 7 //3、接受客户端发送的数据
 8 socket.receive(packet);//此方法在接受数据报之前会一致阻塞
 9 //4、读取数据
10 String info =newString(data,o,data.length);
11 System.out.println("我是服务器，客户端告诉我"+info);
12 
13 
14 //=========================================================
15 //向客户端响应数据
16 //1、定义客户端的地址、端口号、数据
17 InetAddress address = packet.getAddress();
18 int port = packet.getPort();
19 byte[] data2 = "欢迎您！".geyBytes();
20 //2、创建数据报，包含响应的数据信息
21 DatagramPacket packet2 = new DatagramPacket(data2,data2.length,address,port);
22 //3、响应客户端
23 socket.send(packet2);
24 //4、关闭资源
25 socket.close();
复制代码
       2、客户端实现步骤

           ① 定义发送信息
           ② 创建DatagramPacket，包含将要发送的信息
           ③ 创建DatagramSocket
           ④ 发送数据
复制代码
 1 //客户端
 2 //1、定义服务器的地址、端口号、数据
 3 InetAddress address =InetAddress.getByName("localhost");
 4 int port =10010;
 5 byte[] data ="用户名：admin;密码：123".getBytes();
 6 //2、创建数据报，包含发送的数据信息
 7 DatagramPacket packet = newDatagramPacket(data,data,length,address,port);
 8 //3、创建DatagramSocket对象
 9 DatagramSocket socket =newDatagramSocket();
10 //4、向服务器发送数据
11 socket.send(packet);
12 
13 
14 //接受服务器端响应数据
15 //======================================
16 //1、创建数据报，用于接受服务器端响应数据
17 byte[] data2 = new byte[1024];
18 DatagramPacket packet2 = new DatagramPacket(data2,data2.length);
19 //2、接受服务器响应的数据
20 socket.receive(packet2);
21 String raply = new String(data2,0,packet2.getLenth());
22 System.out.println("我是客户端，服务器说："+reply);
23 //4、关闭资源
24 socket.close();
复制代码
六、注意问题：

     1、多线程的优先级问题：
            根据实际的经验，适当的降低优先级，否侧可能会有程序运行效率低的情况
    2、是否关闭输出流和输入流：
             对于同一个socket，如果关闭了输出流，则与该输出流关联的socket也会被关闭，所以一般不用关闭流，直接关闭socket即可
     3、使用TCP通信传输对象，IO中序列化部分
     4、socket编程传递文件，IO流部分
 
 