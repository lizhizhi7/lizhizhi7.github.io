---
layout:     post
title:      ReactNative常用库笔记
subtitle:   跨平台开发
date:       2018-12-28
author:     Lee
header-img: img/background-android.png
catalog: true
tags:
    - React
    - React Native
    - Android
    - iOS
---

### Q&A

#### `react-native-echarts` 

Q:安卓版打包后，图表不显示

1. 复制文件tpl.html（`.\node_modules\native-echarts\src\components\Echarts`）至`android\app\src\main\assets`目录下

2. `source={require('./tpl.html')}`修改为
`source={Platform.OS==='ios' ? require('./tpl.html'):{uri:'file:///android_asset/tpl.html'}}`

3. 另外，记得将`import { WebView, View, StyleSheet } from 'react-native';`修改为`import { WebView, View, StyleSheet, Platform } from 'react-native';`