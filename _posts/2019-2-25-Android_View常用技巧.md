---
layout:     post
title:      Android View 常用技巧
subtitle:   Android View 系列文章
date:       2019-2-25
author:     Lee
header-img: img/background-android.png
catalog: true
tags:
    - Android
    - Android View
---

### 更改ImageView的图片内容
```xml
<ImageView
            android:id="@+id/topic_notice_iv"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_gravity="center_vertical"
            android:padding="@dimen/pad_height_15"
            android:src="@drawable/topic_recommend_remind" />
```
代码中的两种使用方法
```java
notcieIv.setImageDrawable(getResources().getDrawable((R.drawable.remind2)));
searchIv.setBackgroundResource(R.drawable.search2);
```

### 图片缩放模式调整

**Android ImageView android:scaleType属性**

Scaletype是ImageView控件的一个属性，ImageView 的Scaletype属性决定了图片在View上显示时的样子，如进行按比例的缩放，及显示图片的整体还是部分。设置的方式包括：

1. 在layout xml中定义Android:scaleType="center"
2. 或在代码中调用imageView.setScaleType(ImageView.ScaleType.CENTER);

**ScaleType属性：**
ImageView的scaleType的属性有8个，分别是matrix（默认）、center、centerCrop、centerInside、fitCenter、fitEnd、fitStart、fitXY

1. android:scaleType="center"
保持原图的大小，显示在ImageView的中心。当原图的size大于ImageView的size，超过部分裁剪处理。

2. android:scaleType="centerCrop"
以填满整个ImageView为目的，将原图的中心对准ImageView的中心，等比例放大原图，直到填满ImageView为止（指的是ImageView的宽和高都要填满），原图超过ImageView的部分作裁剪处理。

3. android:scaleType="centerInside"
以原图完全显示为目的，将图片的内容完整居中显示，通过按比例缩小原图的size宽(高)等于或小于ImageView的宽(高)。如果原图的size本身就小于ImageView的size，则原图的size不作任何处理，居中显示在ImageView。

4. android:scaleType="matrix"
不改变原图的大小，从ImageView的左上角开始绘制原图，原图超过ImageView的部分作裁剪处理。

5. android:scaleType="fitCenter"
把原图按比例扩大或缩小到ImageView的ImageView的高度，居中显示

6. android:scaleType="fitEnd"
把原图按比例扩大(缩小)到ImageView的高度，显示在ImageView的下部分位置

7. android:scaleType="fitStart"
把原图按比例扩大(缩小)到ImageView的高度，显示在ImageView的上部分位置

8. android:scaleType="fitXY"
把原图按照指定的大小在View中显示，拉伸显示图片，不保持原比例，填满ImageView.

总结：有人会觉得fitCenter和centerInside没有区别，但其实是有区别的。fitCenter是将原图等比例放大或缩小，使原图的高度等于ImageView的高度，并居中显示，而centerInside在原图的原本size大于ImageView的size时，则缩小原图，效果同fitCenter；在原图的原本size小于ImageView的size时，则不进行任何size处理，居中显示，效果同center。