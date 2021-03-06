---
layout:     post
title:      Fragment懒加载
subtitle:   Android笔记
date:       2018-12-6
author:     Lee
header-img: img/background-android.png
catalog: true
tags:
    - Android
---

> 懒加载意思是当需要的时候再去进行加载

那么，在什么情况下会考虑使用懒加载呢？一般情况下，我们会把一些通过网络或者本地存储来加载数据的函数放在在onCreate()或者onCreateView()生命周期函数中。大部分情况下，这种符合正常逻辑的操作并不会出现什么问题。但是当你在使用ViewPager + Fragment的时候，问题就出现了。

## ViewPager + Fragment

ViewPager为了让滑动的时候用户可以有更好的体验，它加入了一个缓存机制。默认情况下，ViewPager会提前创建好当前Fragment左右的两个Fragment。也就是说每次左中右这三个Fragment都已经执行完`onAttach()`->`onResume()`这之间的所有生命周期函数了。

> 通过ViewPager的 `setOffscreenPageLimit(int limit)`可以设置预加载页面数量，当前页面相邻的limit个页面会被预加载进内存。

本来Fragment的`onResume()`表示的是当前Fragment处于可见且可交互状态，但由于ViewPager的缓存机制，它已经失去了意义，也就是说我们并没有想打开的Fragment中的数据也会被请求和加载，这样不仅有可能会产生网络和内存占用，还会对一些接口的统计数据造成影响。这时就应该考虑想想是否该实现懒加载。

## 懒加载的实现方法

### `setUserVisibleHint(boolean isVisibleToUser)`  

```java
@Override
public void setUserVisibleHint(boolean isVisibleToUser) {
        super.setUserVisibleHint(isVisibleToUser);
}
```

很多人都推荐直接重写这一个函数来加载数据，`isVisibleToUser`表示当前的Fragment是否可见。如果你只需要进行一些数据的懒加载的话，这么做是完全可行的。但是重写这个函数需要注意，**尽量不要出现对控件的操作，因为该函数的调用时间不完全可控，如果在Create之前或者Destory之后被调用的话，会抛出空指针异常。**

为了能更方便的复用，我们可以对`BaseFragment`重新进行封装。

### BaseFragment的封装

由前面可以得知，如果要安全的使用`setUserVisibleHint`函数，必须要满足两个条件。

1. 界面当前已经初始化完毕并且没有被销毁，即`onCreateView()`方法执行完毕，且`OnDestory()`函数未被执行。
2. setUserVisibleHint(boolean isVisibleToUser)方法中的参数为true。

所以在BaseFragment中新建两个布尔型变量来记录这两个条件的状态.只有同时满足了,才去调用加载数据的函数。

另外，因为ViewPager缓存机制，所以对创建的view进行了复用，防止`onCreateView()`重复创建view，其实也就是将view设置为成员变量，创建view时先判断是否为null。因为ViewPager里对Fragment的回收和创建时，如果Fragment已经创建过了，那么只会调用 onCreateView() -> onDestroyView() 生命函数，onCreate()和onDestroy并不会触发，所以关于变量的初始化和赋值操作可以在onCreate()里进行，这样就可以避免重复的操作。

## 代码实现

``` java
public abstract class ViewPagerFragment extends Fragment {

    private boolean hasCreateView; //rootView是否初始化标志，防止回调函数在rootView为空的时候触发
    private boolean isFragmentVisible; //当前Fragment是否处于可见状态标志，防止因ViewPager的缓存机制而导致回调函数的触发
    protected View rootView; //onCreateView()里返回的view，修饰为protected,所以子类继承该类时，在onCreateView里必须对该变量进行初始化

    @Override
    public void setUserVisibleHint(boolean isVisibleToUser) {
        super.setUserVisibleHint(isVisibleToUser);
        if (rootView == null) {
            return;
        }
        hasCreateView = true;
        if (isVisibleToUser) {
            onFragmentVisibleChange(true);
            isFragmentVisible = true;
            return;
        }
        if (isFragmentVisible) {
            onFragmentVisibleChange(false);
            isFragmentVisible = false;
        }
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        initVariable();
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        if (!hasCreateView && getUserVisibleHint()) {
            onFragmentVisibleChange(true);
            isFragmentVisible = true;
        }
    }

    private void initVariable() {
        hasCreateView = false;
        isFragmentVisible = false;
    }

    protected void onFragmentVisibleChange(boolean isVisible) {
        Log.w(getTAG(), "onFragmentVisibleChange -> isVisible: " + isVisible);
    }
}
```

## 用法

新建类ViewPagerFragment，将上面代码复制粘贴进去，添加需要的import语句 -> 新建你需要的Fragment类，继承ViewPagerFragment，在onCreateView()里对rootView进行初始化 -> 重写onFragmentVisibleChange()，在这里进行你需要的操作，比如数据加载，控制显示等。

```java
    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        if (rootView == null) {
            rootView = inflater.inflate(R.layout.fragment_android, container, false);
        }
        return rootView;
    }

    @Override
    protected void onFragmentVisibleChange(boolean isVisible) {
        super.onFragmentVisibleChange(isVisible);
        if (isVisible) {
        //   do things when fragment is visible
        //    if (ListUtils.isEmpty(mDataList) && !isRefreshing()) {
        //        setRefresh(true);
        //        loadServiceData(false);
            } else {
        //        setRefresh(false);
            }
        }
    }
```
