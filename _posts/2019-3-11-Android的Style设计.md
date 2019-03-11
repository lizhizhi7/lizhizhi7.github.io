---
layout:     post
title:      Android的Style设计
subtitle:   Android View 系列文章
date:       2019-3-11
author:     Lee
header-img: img/background-android.png
catalog: true
tags:
    - Android
    - Android View
---

### Style(样式)
> style(样式)是针对窗体元素级别的，改变指定控件或者Layout的样式。 

#### 创建步骤

* 在`res/values`目录下新建一个名叫`style.xml`的文件。增加一个 `<resources>`根节点。  
* 在`<resources>`根节点中新建`<style>`元素，并设置一个唯一的`name`，也可以选择增加一个父类属性`parent`。通过`name`来引用，而父类属性标识了当前风格是继承于哪个风格。 (可以引用另一个`style`,但在一般情况下，会继承Android的标准风格资源并加以修改)  
* 在`<style>`元素内部，可以申明一个或者多个`<item>`,每一个`<item>`定义了一个名字属性，并且在元素内部定义了这个风格的值。  
* 你可以在其他XML定义的资源中通过`style="@style/YourCustomStyle"`引用。  

> 如果style中定义的属性和View中定义的重复，View中的属性会覆盖style中定义的属性。

```xml
<style name="MyStyle" parent="TextViewStyle">
<!--设置name 和parent-->
    <item name="android:textColor">#000</item>
    <!--字体颜色-->
    <item name="android:textSize">20sp</item>
    <!--字体大小-->
    <item name="android:layout_height">wrap_content</item>
    <!--控件高度-->
    <item name="android:layout_width">match_parent</item>
    <!--控件宽度-->
    <item name="android:background">#8f00</item>         <!--背景色-->
    <item name="android:gravity">center_horizontal</item>
    <!--view中内容的位置限定-->
    <item name="android:layout_weight">1</item>          <!--比重-->
</style>
```
```xml
//此处没有设置Parent属性，但由于name以MyStyle.开头，所以MyStyle.red会完全继承MyStyle
<style name="MyStyle.red" >  
    <item name="android:textColor">#000</item>           <!--字体颜色-->
    <item name="android:textSize">20sp</item>            <!--字体大小-->
    <item name="android:layout_height">wrap_content</item>
    <!--控件高度-->
    <item name="android:layout_width">match_parent</item>
    <!--控件宽度-->
    <item name="android:background">#8f00</item>         <!--背景色-->
    <item name="android:gravity">center_horizontal</item>
    <!--view中内容的位置限定-->
    <item name="android:layout_weight">1</item>          <!--比重-->
</style>
```
```xml
//同上，MyStyle.red.big会完全继承MyStyle.red
<style name="MyStyle.red.big" >  
    <item name="android:textColor">#000</item>           <!--字体颜色-->
    <item name="android:textSize">20sp</item>            <!--字体大小-->
    <item name="android:layout_height">wrap_content</item>
    <!--控件高度-->
    <item name="android:layout_width">match_parent</item>
    <!--控件宽度-->
    <item name="android:background">#8f00</item>         <!--背景色-->
    <item name="android:gravity">center_horizontal</item>
    <!--view中内容的位置限定-->
    <item name="android:layout_weight">1</item>          <!--比重-->
</style> 
```
> 注意：这种通过将名称链接起来的继承方法只适用于由您自己的资源定义的样式。
您无法通过这种方法继承 Android 内建样式。
要引用内建样式（例如TextAppearance），您必须使用 parent 属性。

### Theme(主题)

> Theme(主题)是针对窗体级别的,改变窗体样式,对整个应用或某个Activity存在全局性影响。 

主题依然在`<style>`元素里边申明，也是以同样的方式引用。不同的是Theme可以在Android Manifest中定义的`<application>`和`<activity>`中通过设置属性`android:theme="@style/**"`添加到整个程序或者某个Activity。 
> 注：主题是不能应用在某一个单独的View里。

```xml
<style name="CustomTheme">
    <item name="android:windowNoTitle">true</item>
    <item name="windowFrame">@drawable/screen_frame</item>
    <item name="windowBackground">@drawable/screen_background_white</item>
    <item name="panelForegroundColor">#FF000000</item>
    <item name="panelBackgroundColor">#FFFFFFFF</item>
    <item name="panelTextColor">?panelForegroundColor</item>
    <item name="panelTextSize">14</item>
    <item name="menuItemTextColor">?panelTextColor</item>
    <item name="menuItemTextSize">?panelTextSize</item>
</style>
```

 * @符号 表明了我们应用的资源是已经定义过并存在的，可以直接引用。（和布局文件引用相同）
 * ?符号 表明了我们引用的资源的值在当前的主题当中定义过。通过引用在<item>里边定义的名字可以做到
 (panelTextColor用的颜色和panelForegroundColor中定义的一样)。

如果想设置某个主题，但又想做少量调整以满足需求，只需将该主题添加为当前主题的parent即可。例如：

```xml
// 在Theme.AppCompat.Dialog主题的基础上加以修改
<style name="customDialog" parent="Theme.AppCompat.Dialog">
        <item name="android:windowFrame">@null</item>               <!--取消默认Dialog的windowFrame框-->
        <item name="android:windowNoTitle">true</item>              <!--设置无标题Dialog-->
        <item name="android:backgroundDimEnabled">true</item>       <!--是否四周变暗-->
        <item name="android:windowIsFloating">true</item>           <!-- 是否悬浮在activity上 -->
        <item name="android:windowContentOverlay">@null</item>      <!--取消默认ContentOverlay背景 -->
        <item name="android:windowBackground">@android:color/transparent</item> <!--取消window默认背景 不然四角会有黑影-->
```

> 注：如果一个应用使用了theme，同时应用下的view也使用了style，那么当theme与样式style发生冲突时，style的优先级高于主题。

系统自带的常用Theme
* android:theme=”@android:style/Theme.Dialog” 将一个Activity显示为能话框模式
* android:theme=”@android:style/Theme.NoTitleBar” 不显示应用程序标题栏
* android:theme=”@android:style/Theme.NoTitleBar.Fullscreen”不显示应用程序标题栏，并全屏
* android:theme=”Theme.Light” 背景为白色
* android:theme=”Theme.Light.NoTitleBar” 白色背景并无标题栏
* android:theme=”Theme.Light.NoTitleBar.Fullscreen” 白色背景，无标题栏，全屏
* android:theme=”Theme.Black” 背景黑色
* android:theme=”Theme.Black.NoTitleBar” 黑色背景并无标题栏
* android:theme=”Theme.Black.NoTitleBar.Fullscreen” 黑色背景，无标题栏，全屏
* android:theme=”Theme.Wallpaper” 用系统桌面为应用程序背景
* android:theme=”Theme.Wallpaper.NoTitleBar” 用系统桌面为应用程序背景，且无标题栏
* android:theme=”Theme.Wallpaper.NoTitleBar.Fullscreen” 用系统桌面为应用程序背景，无标题栏，全屏
* android:theme=”Translucent” 半透明
* android:theme=”Theme.Translucent.NoTitleBar” 半透明，无标题，全屏
* android:theme=”Theme.Translucent.NoTitleBar.Fullscreen” 半透明，无标题，全屏
* android:theme=”Theme.Panel” 半透明，无标题，全屏
* android:theme=”Theme.Light.Panel”平板风格显示