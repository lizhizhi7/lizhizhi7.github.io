---
layout:     post
title:      使用ProGuard混淆
subtitle:   Java工具
date:       2019-2-18
author:     Lee
header-img: img/background-java.jpg
catalog: true
tags:
    - Java
---

### ProGuard作用

**压缩（Shrinking）**：默认开启，用以减小应用体积，移除未被使用的类和成员，并且会在优化动作执行之后再次执行（因为优化后可能会再次暴露一些未被使用的类和成员）。如果想要关闭压缩，在proguard-rules.pro文件中加入：
```
# 关闭压缩
-dontshrink 
```

**优化（Optimization）**：默认开启，在字节码级别执行优化，让应用运行的更快。同上，如果想要关闭优化，在proguard-rules.pro文件中加入：
```
# 关闭优化
-dontoptimize
-optimizationpasses n 表示proguard对代码进行迭代优化的次数，Android一般为5
```

**混淆（Obfuscation）**：默认开启，增大反编译难度，类和类成员会被随机命名，除非用keep保护。
```
# 关闭混淆
-dontobfuscate
```
混淆后默认会在工程目录app/build/outputs/mapping/release下生成一个mapping.txt文件，这就是混淆规则，我们可以根据这个文件把混淆后的代码反推回源本的代码，所以这个文件很重要，注意保护好。原则上，代码混淆后越乱越无规律越好，但有些地方我们是要避免混淆的，否则程序运行就会出错。

### 实现代码混淆

使用Android Studio正式打包时默认是不开启代码混淆的，如果需要开启代码混淆，可以在 app 模块下的build.gradle 文件中修改 minifyEnabled false 为 true。代码结构如下：
```
android {
    compileSdkVersion 25
    buildToolsVersion "25.0.2"
    defaultConfig {
        applicationId "******"
        minSdkVersion 19
        targetSdkVersion 25
        versionCode 6
        versionName "2.0.1"
        testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            // 是否进行混淆
            minifyEnabled true
            // 混淆文件的位置
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
        debug {
            ···
        }
    }
```

### 混淆配置规则

先看如下两个比较常用的命令，很多童鞋可能会比较迷惑以下两者的区别。

```
-keep class cn.hadcn.test.*
-keep class cn.hadcn.test.**
```

* 一颗星 
　　表示只是保持该包下的类名，而子包下的类名还是会被混淆； 
* 两颗星 
　　表示把本包和所含子包下的类名都保持；用以上方法保持类后，你会发现类名虽然未混淆，但里面的具体方法和变量命名还是变了。 
　　 
这时如果既想保持类名，又想保持里面的内容不被混淆，我们就需要以下方法了:

`-keep class cn.hadcn.test.* {*;}`

在此基础上，我们也可以使用Java的基本规则来保护特定类不被混淆，比如我们可以用extends，implements等这些Java规则。如下例子就避免所有继承Activity的类被混淆

`-keep public class * extends android.app.Activity`

如果我们要保留一个类中的内部类不被混淆则需要用$符号，如下例子表示保持ScriptFragment内部类JavaScriptInterface中的所有public内容不被混淆。

```
-keepclassmembers class cc.ninty.chat.ui.fragment.ScriptFragment$JavaScriptInterface {
   public *;
}
```

再者，如果一个类中你不希望保持全部内容不被混淆，而只是希望保护类下的特定内容，就可以使用

```
<init>;     //匹配所有构造器
<fields>;   //匹配所有域
<methods>;  //匹配所有方法方法
```

你还可以在`<fields>`或`<methods>`前面加上private 、public、native等来进一步指定不被混淆的内容，如

```
-keep class cn.hadcn.test.One {
    public <methods>;
}
```

表示One类下的所有public方法都不会被混淆，当然你还可以加入参数，比如以下表示用JSONObject作为入参的构造函数不会被混淆

```
-keep class cn.hadcn.test.One {
   public <init>(org.json.JSONObject);
}
```

有时候你是不是还想着，我不需要保持类名，我只需要把该类下的特定方法保持不被混淆就好，那你就不能用keep方法了，keep方法会保持类名，而需要用keepclassmembers ，如此类名就不会被保持，为了便于对这些规则进行理解，官网给出了以下表格:

|保留|防止被移除或者被重命名|防止被重命名|
|:--:|:------------------:|:---------:|
|类和类成员|-keep|-keepnames|
|仅类成员|-keepclassmembers|-keepclassmembernames|
|如果拥有某成员，保留类和类成员|-keepclasseswithmembers|-keepclasseswithmembernames|


总结

**keep** 包留类和类中的成员，防止他们被混淆
**keepnames** 保留类和类中的成员防止被混淆，但成员如果没有被引用将被删除
**keepclassmembers** 只保留类中的成员，防止被混淆和移除。
**keepclassmembernames** 只保留类中的成员，但如果成员没有被引用将被删除。
**keepclasseswithmembers** 如果当前类中包含指定的方法，则保留类和类成员，否则将被混淆。
**keepclasseswithmembernames** 如果当前类中包含指定的方法，则保留类和类成员，如果类成员没有被引用，则会被移除。

### 混淆配置说明

1. 在混淆打包时，每次构建时 ProGuard 都会输出下列文件(`/build/outputs/mapping/release/`)

|文件|	作用|
|:-|:-|
|mapping.txt|提供原始与混淆过的类、方法和字段名称之间的转换。|
|seeds.txt|列出未进行混淆的类和成员。|
|usage.txt|列出从 APK 移除的代码。|

这些文件保存在中。（所以笔者认为上边的混淆模板中的记录生成的日志数据没有添加的必要，因为IDE在编译时自动已经输出了）

2. jni方法不可混淆，因为这个方法需要和native方法保持一致；
```
# 保持native方法不被混淆 
-keepclasseswithmembernames class * {    
    native <methods>;
}
```

3. 反射用到的类不混淆(否则反射可能出现问题)；

4. AndroidMainfest中的类不混淆，所以四大组件和Application的子类和Framework层下所有的类默认不会进行混淆，自定义的View默认也不会被混淆。所以像网上贴的很多排除自定义View，或四大组件被混淆的规则在Android Studio中是无需加入的。

5. 与服务端交互时，使用GSON、fastjson等框架解析服务端数据时，所写的JSON对象类不混淆，否则无法将JSON解析成对应的对象；

6. 使用第三方开源库或者引用其他第三方的SDK包时，如果有特别要求，也需要在混淆文件中加入对应的混淆规则；

7. 有用到WebView的JS调用也需要保证写的接口方法不混淆，原因和第一条一样；

8. Parcelable的子类和Creator静态成员变量不混淆，否则会产生Android.os.BadParcelableException异常；
```
# 保持Parcelable不被混淆    
-keep class * implements Android.os.Parcelable {         
    public static final Android.os.Parcelable$Creator *;
}
```

9. 使用enum类型时需要注意避免以下两个方法混淆，因为enum类的特殊性，以下两个方法会被反射调用，见第二条规则。
```
-keepclassmembers enum * {  
    public static **[] values();  
    public static ** valueOf(java.lang.String);  
}
```

### 混淆配置示例

`proguard-rules.pro`文件

```
#--------------------------1.实体类---------------------------------
# 如果使用了Gson之类的工具要使被它解析的JavaBean类即实体类不被混淆。（这里填写自己项目中存放bean对象的具体路径）
-keep class com.*.*.bean.**{*;}
 
#--------------------------2.第三方包-------------------------------
 
#Gson
-keepattributes Signature
-keepattributes *Annotation*
-keep class sun.misc.Unsafe { *; }
-keep class com.google.gson.stream.** { *; }
-keep class com.google.gson.examples.android.model.** { *; }
-keep class com.google.gson.* { *;}
-dontwarn com.google.gson.**
 
#butterknife
-keep class butterknife.** { *; }
-dontwarn butterknife.internal.**
-keep class **$$ViewBinder { *; }
 
#-------------------------3.与js互相调用的类------------------------
 
 
#-------------------------4.反射相关的类和方法----------------------
 
 
#-------------------------5.基本不用动区域--------------------------
#指定代码的压缩级别（0~7）
-optimizationpasses 5
 
#包明不混合大小写
-dontusemixedcaseclassnames
 
#不去忽略非公共的库类
-dontskipnonpubliclibraryclasses
-dontskipnonpubliclibraryclassmembers
 
#混淆时是否记录日志
-verbose
 
#不优化输入的类文件
-dontoptimize
 
#不做预校验，可加快混淆速度
#preverify是proguard的4个步骤之一
#Android不需要preverify，去掉这一步可以加快混淆速度
-dontpreverify
 
# 保留sdk系统自带的一些内容 【例如：-keepattributes *Annotation* 会保留Activity的被@override注释的onCreate、onDestroy方法等】
-keepattributes Exceptions,InnerClasses,Signature,Deprecated,SourceFile,LineNumberTable,*Annotation*,EnclosingMethod
 
# 记录生成的日志数据,gradle build时在本项根目录输出
# apk 包内所有 class 的内部结构
-dump proguard/class_files.txt
# 未混淆的类和成员
-printseeds proguard/seeds.txt
# 列出从 apk 中删除的代码
-printusage proguard/unused.txt
# 混淆前后的映射
-printmapping proguard/mapping.txt
 
 
# 避免混淆泛型
-keepattributes Signature
# 抛出异常时保留代码行号,保持源文件以及行号
-keepattributes SourceFile,LineNumberTable
 
#-----------------------------6.默认保留区-----------------------
# 保持 native 方法不被混淆
-keepclasseswithmembernames class * {
    native <methods>;
}
 
-keepclassmembers public class * extends android.view.View {
 public <init>(android.content.Context);
 public <init>(android.content.Context, android.util.AttributeSet);
 public <init>(android.content.Context, android.util.AttributeSet, int);
 public void set*(***);
}
 
#保持 Serializable 不被混淆
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
 
# 保持自定义控件类不被混淆
-keepclasseswithmembers class * {
    public <init>(android.content.Context,android.util.AttributeSet);
}
# 保持自定义控件类不被混淆
-keepclasseswithmembers class * {
    public <init>(android.content.Context,android.util.AttributeSet,int);
}
# 保持自定义控件类不被混淆
-keepclassmembers class * extends android.app.Activity {
    public void *(android.view.View);
}
 
# 保持枚举 enum 类不被混淆
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
 
# 保持 Parcelable 不被混淆
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}
 
# 不混淆R文件中的所有静态字段，我们都知道R文件是通过字段来记录每个资源的id的，字段名要是被混淆了，id也就找不着了。
-keepclassmembers class **.R$* {
    public static <fields>;
}
 
#如果引用了v4或者v7包
-dontwarn android.support.**
 
# 保持哪些类不被混淆
-keep public class * extends android.app.Appliction
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Fragment
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.preference.Preference
 
# 不混淆资源类
-keepclassmembers class **.R$* { *; }

# 对于带有回调函数onXXEvent()的，不能被混淆
-keepclassmembers class * {
    void *(**On*Event);
}
# WebView
-keepclassmembers class fqcn.of.javascript.interface.for.Webview {
   public *;
}
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, jav.lang.String);
}



-keep class com.zhy.http.okhttp.**{*;}
# -keep class com.*.*.util.** {*;}
 
# ============忽略警告，否则打包可能会不成功=============
-ignorewarnings
```

### 写在最后
发布一款应用除了设minifyEnabled为ture，你也应该设置zipAlignEnabled为true，像Google Play强制要求开发者上传的应用必须是经过zipAlign的，zipAlign可以让安装包中的资源按4字节对齐，这样可以减少应用在运行时的内存消耗。