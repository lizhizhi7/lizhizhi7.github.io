---
layout:     post
title:      CSS Pixels💫
date:       2020-6-11
author:     Oliver Li
catalog:    true
tags:
    - CSS
---

# CSS Pixels💫

## 先从一个需求说起

之前在做界面组件的时候，有很多地方都用到了边框，我都是顺手就打上了1px的宽度。但是MR上去以后，组里的大佬问我有没有听说过一个极细边框的技术，我就赶紧去google了一下，发现这个概念原来很早就有了。早在2014的WWDC上面Ted O’Connor就讨论过有关 “retina hairlines” 的技术，可以实现比1px还细的边框。

![wwdc-hairline](https://pic.intellizhi.cn/blogimg/wwdc-hairline.png)

机智的我看到这种技术，发现它并不简单。在我的概念里，一像素就是一个像素啊，咋还能取小数？难不成可以把一个像素劈成两半吗？还是我对px这个单位有误解？后来发现px这个单位并不简单。

## 此px非彼px

在中文中，我们把Pixel翻译为像素。我们常说的一个设备屏幕具有多少像素，其实是在说屏幕上具有多少物理的点。比如1920x1080 （1080p），2560x1440 （2k），这些都指的是设备的物理上的点的个数，也就是我们将会在下面提到的“物理像素”。基于此，很多人潜意识中就会把px当作pixel的简写，自然也就将px等同到设备的物理像素上了（过去我也一直是这么以为的😓）。但是如果这么理解的话，显然比1px还要细的线是不可能存在的。在这种情况下，我觉得其实1px应该是对应多个像素的，因为只有这样才有可能让1px的线更细。那么它到底是如何计算的呢？我查到了下面一张图让我恍然大悟。

!["iPhone Screen "](https://pic.intellizhi.cn/blogimg/iphone-pic.svg)

上图是一张iPhone设备的各种不同像素衡量方法之间的关系，应该就很清晰明了了。在这个图中一共介绍了三种像素衡量的方法。



1. 物理像素（Physical Pixel）

   只由设备硬件决定，反映屏幕本身内部的物理像素指标。

2. 渲染像素（Render Pixel）

   是系统层级对物理像素分配的调整，相当于在系统中调节分辨率的大小。

3. 逻辑像素/点（Point）

   是一个抽象概念，引入这个概念是为了调和像素密度（pixel per inch）和观看距离不一样而导致的显示大小差异。



其中**逻辑像素**将是我们讨论的重点。它是将设备根据像素密度进行透视缩放，得到一个让相同元素的实际大小在不同设备上的观感尽可能相同的一个虚拟尺寸。比如普通屏幕的2x2就是实际的物理2x2，但是由于Retina的屏幕像素密度更大，如果还按照2x2来显示相同的元素就会比普通的屏幕小很多，显然是不合理的，所里这里就会把1个CSS像素映射到4个物理像素上，使得整体的观感更加和谐。

![css-physical](https://pic.intellizhi.cn/blogimg/css-physical.jpeg)

通常来说，CSS Pixels 就称为设备独立像素（device-independent pixels, DIPs），也叫密度无关像素。其中的每一个点代表一个可以由程序使用的虚拟像素。

如果你仔细观察的话，在我们常用的Chrome的开发工具界面中，也可以发现所有设备标注的都是逻辑像素而不是物理像素。

![image-20200611101708666](https://pic.intellizhi.cn/blogimg/image-20200611101708666.png)

![image-20200611101747525](https://pic.intellizhi.cn/blogimg/image-20200611101747525.png)



## 面向逻辑像素开发

从上面我们可以很明显看出，对于同种类型的不同设备，逻辑像素本身相当于已经是自带了响应缩放效果。所以说面向逻辑像素开发，实际上是很易用的，而且应该是兼容性相当不错的一种方案。

那么在实际开发中，我们如何根据设计师给的设计图来复原UI呢？相信很多人都发现了，设计稿的宽度一般都是750px，这多半是以iPhone6/7/8或同等设备的比例来设计的。而我们从上文知道iPhone6的逻辑像素是375，那么拿到手的设计稿，转换为逻辑像素，就要除以2，我们就称这种图为两倍图。而这里的“2”，我们就叫它dpr（devide pixel ratio）。


$$
device\;pixel\;ratio = \frac{render\;resolution}{logical\;resolution}
$$


多少倍屏或者多少x（1x，2x，3x）一般来讲就是指的dpr的数值。

在JavaScript中，可以通过`window.devicePixelRatio`获取到当前设备的dpr。

在CSS中，可以通过`(-webkit-)device-pixel-ratio`，)`(-webkit-)min-device-pixel-ratio`和 `(-webkit-)max-device-pixel-ratio`进行媒体查询，对不同dpr的设备，做一些样式适配。

```css
#element { background-image: url('xxx.png'); }

@media only screen and (min-device-pixel-ratio: 2) {
    #element { background-image: url('xxx@2x.png'); }
}

@media only screen and (min-device-pixel-ratio: 3) {
    #element { background-image: url('xxx@3x.png'); }
}
```

### 其他事项

1. 要在head中设置width=device-width（让viewport尺寸等于逻辑像素尺寸）

   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1">
   ```

2. 在css中使用px单位

3. 在部分有需要的区域使用flex布局，或者可以使用vw进行自适应

4. 在跨设备类型的时候（PC/Mobile/Tablet）使用媒体查询

5. 跨设备类型如果交互差异过大，可以考虑分项目开发

## Hairline Border实现

我们再回到之前那个需求，在这里总结一下可用的方案有哪些。

### 0.5px方案

就是前文写的WWDC给出的解决方案，不过这种方案比较局限，对于 iOS 7 和之前版本，OS X Mavericks 及以前版本，还有 Android 设备并不能很好支持。我们需要通过 JavaScript 检测浏览器能否处理0.5px的边框，如果可以，再给html标签添加相应的样式。

### 用图片模拟边框

使用`border-image`或者`background-image`将提前准备的一半透明一半有颜色的图片（不想准备图片也可以使用CSS3 渐变填充）应用到边框上，可以模拟出0.5px边框的效果。不过确定也很明显，不好修改颜色，不好添加圆角，边框容易模糊。

### 伪类 + transform（使用的方案）

原理是利用 :before 或者 :after 重做 border ，并用 transform 的 scale 缩小一半，原先的元素相对定位，新做的 border 绝对定位。

***Example***

```css
.scale-1px{
  position: relative;
  border:none;
}
.scale-1px:after{
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transform-origin: left bottom;
  transform: scale(0.33333333);
  width: 300%;
  height: 300%;
}
```

![image-20200612113120556](https://pic.intellizhi.cn/blogimg/image-20200612113120556.png)

## 写在最后

对于目前越来越多样的浏览设备，页面跨设备布局的能力也变的越来越重要。也有很多新的布局方案产生，比如利用rem来缩放，以及小程序自带的rpx单位。但是通过我对于px方案的了解和深入以后，我觉得那些方案在很多情况下，并不是一种最优的响应方案，其实更像是一种偷懒方案。像是微信小程序力推的rpx单位，它仅仅是帮你放大了内容，但用户用更大的屏幕难道只是为了看到更大的字和图片吗？就我自己而言，这个问题的答案是否定的。我使用更大的屏幕来浏览显然是是想看到更多的内容，简单的放大显示会让我感觉体验很差。

所以就我自己而言，我觉得屏幕尺寸越大，内容看的应该越多，而**不是越大**；屏幕ppi越高，内容看的应该越清晰，而**不是越小**🙃。而面向逻辑像素的开发就很好的体现了这种思想。

## *Some References*

1. [Material Design Device Metrics](https://material.io/resources/devices/)
2. [Viewport meta tag](https://developer.mozilla.org/en-US/docs/Mozilla/Mobile/Viewport_meta_tag)
3. [The Ultimate Guide To iPhone Resolutions](https://www.paintcodeapp.com/news/ultimate-guide-to-iphone-resolutions)
4. [CSS retina hairline, the easy way.](http://dieulot.net/css-retina-hairline)
5. [CSS, Retina, and Physical Pixels](https://n12v.com/css-retina-and-physical-pixels/)
6. [1px on retina](http://efe.baidu.com/blog/1px-on-retina/)
