---
layout:     post
title:      JointJS
subtitle:   JointJS
date:       2020-2-2
author:     Oliver Li
header-img: img/background-js.jpg
catalog:    true
tags:
    - JavaScript
---

> JointJS是一款功能强大的图形可视化交互工具，可用来开发流程图，思维导图等复杂图形交互应用

## 核心概念

### Paper和Graph

Paper即画布，图形将在Paper上绘制。Graph即图形数据，可与Paper进行绑定，对Graph的修改会即时反映到Paper上。一个Graph可与多个Paper绑定

### CellView和Cell

* CellView: 视图元素，是Paper的基本元素，用来处理UI交互
* Cell: 图形元素，是Graph的基本元素，用来存储图形元素数据

> CellView可以通过.model属性获取它的Cell  
> Graph其实就是Cell的集合

### Link和Element

Cell有两种类型，Link是连线，Element是节点  
他们的视图元素对应为LinkView和ElementView

### Source和Target

即连线的起点和终点

### Port

端口，依附于图形节点，可以被连线连接

### 坐标系统

* client - 相对于浏览器窗口
* page - 相对于body
* local - 图形绝对坐标
* paper - 图形画布坐标 (画布是可以移动的，当画布移动时paper坐标会改变，而local坐标不会改变)

## The joint namespace

* joint.utils  
工具库，包含setByPath/getByPath等函数
* joint.dia  
模型(类)库，包含: Paper Graph Cell CellView Element Link 等等
* joint.shapes  
图形元素样式库，包含多个分组(basic standard custom ...)  
以basic为例，其下有Circle Ellipse Rect Text Path等多个图形元素

## API

### Paper

#### Paper initial options

* el: 图形容器
* model: 图形数据，此处可绑定graph
* width: 图形宽度
* height: 图形高度
* drawGrid: 栅格参考线
* gridSize: 参考线密度
* background: 背景
* defaultLink: 默认连线样式
* interactive: 控制元素的交互属性（例如是否可以移动）
* clickThreshold: 当大于该值的鼠标点击次数被触发时，将不会再触发响应
* sorting: 渲染SVG图时所采用的排序方法
* connectionStrategy: 连接策略决定Link的Anchor在哪里
* defaultConnectionPoint: 默认的连接点函数

#### Paper prototype method

* findViewByModel(model)  
通过model(即cell)寻找到对应的cellView
* getContentBBox()  
获取paper内图形实体(不包含空白)的边界(client坐标)
* getContentArea()  
获取paper内图形实体(不包含空白)的边界(local坐标)
* paperToLocalPoint(point) or (x, y)  
将paper坐标的point转换成local坐标，类似的转换: `localToPaperPoint` `pageToLocalPoint` 等等
* paperToLocalRect(rect)  
将paper坐标的rect转换成local坐标，类似的: `localToPaperRect` `pageToLocalRect` 等等
* scale(scale) or (sx, sy)  
将paper缩放至指定倍数，如果参数为空，将返回paper当前的缩放倍数
* translate(x, y)  
将paper原点移动到指定坐标(原点在左上角)，如果参数为空，将返回paper当前的位移

### Graph

* addCell(cell)  
添加一个元素
* addCells(cells)  
添加一组元素
* getCell(modelId)  
获取指定id的元素
* getCells()  
获取所有元素
* getElements()  
获取所有节点
* getLinks()  
获取所有连线
* clear()  
清空所有元素
* getNeighbors(element [, opt])  
获取与某节点相连的所有连线
* toJSON()  
导出JSON
* fromJSON(json)  
导入JSON

### Cell

* Cell.prototype.define(type [, properties])  
定义一个新的图形元素，或继承一个已有的元素

```javascript
// Define a new Ellipse class in `joint.shapes.examples` namespace
// Inherits from generic Element class
var Ellipse = joint.dia.Element.define('examples.Ellipse', {
    // default attributes
    markup: [{
        tagName: 'ellipse',
        selector: 'ellipse' // not necessary but faster
    ],
    attrs: {
        ellipse: {
            fill: 'white',
            stroke: 'black',
            strokeWidth: 4,
            refRx: .5,
            refRy: .5,
            refCx: .5,
            refCy: .5
        }
    }
});

// Instantiate an element
var ellipse = (new Ellipse()).position(100, 100).size(120, 50).addTo(graph);

// Define a new ColoredEllipse class
// Inherits from Ellipse
var ColoredEllipse = Ellipse.define('examples.ColoredEllipse', {
    // overridden Ellipse default attributes
    // other Ellipse attributes preserved
    attrs: {
        ellipse: {
            fill: 'lightgray'
        }
    }
}, {
    // prototype properties
    // accessible on `this.(...)` - as well as, more precisely, `this.prototype.(...)`
    // useful for custom methods that need access to this instance
    // shared by all instances of the class
    randomizeStrokeColor: function() {
        var randomColor = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
        return this.attr('ellipse/stroke', randomColor);
    }
}, {
    // static properties
    // accessible on `this.constructor.(...)`
    // useful for custom methods and constants that do not need an instance to operate
    // however, a new set of static properties is generated every time the constructor is called
    // (try to only use static properties if absolutely necessary)
    createRandom: function() {
        return (new ColoredEllipse()).randomizeStrokeColor();
    }
});

// Instantiate an element
var coloredEllipse = ColoredEllipse.createRandom().position(300, 100).size(120, 50).addTo(graph);
```

* markup(标签)  
是用来生成svg元素的模板，可以接收XML标签或JSON对象

```javascript
markup: '<rect class="rectangle"/>'
markup: [{
  tagName: 'rect',
  selector: 'body'
}]
```

* attrs(属性)  
用来定义svg元素的样式，通过selector或标签名查找对应的元素

```javascript
attrs: {
  ellipse: {
    fill: 'lightgray'
  },
  body: {
    fill: 'white'
  }
}
```

* Cell.prototype.attr()  
设置cell的attrs属性
* Cell.prototype.prop()  
设置cell的属性，包括自定义属性

```javascript
cell.attr('body/fill', 'black')
cell.prop('attrs/body/fill', 'black')
cell.prop('attrs', {body: {fill: 'black'}})
cell.prop('custom', 'data')
```

* Cell.prototype.isElement()  
判断元素是否是节点
* Cell.prototype.isLink()  
判断元素是否是连线
* Cell.prototype.addTo(graph)  
添加到graph
* Cell.prototype.remove()  
移除元素

### Element

图形节点模型，继承自Cell

#### Element模型示例

```javascript
{
  id: '3d90f661-fe5f-45dc-a938-bca137691eeb',// Some randomly generated UUID.
  type: 'basic.Rect',
  attrs: {
        'stroke': '#000'
  },
  position: {
        x: 0,
        y: 50
  },
  angle: 90,
  size: {
        width: 100,
        height: 50
  },
  z: 2,
  embeds: [
        '0c6bf4f1-d5db-4058-9e85-f2d6c74a7a30',
        'cdbfe073-b160-4e8f-a9a0-22853f29cc06'
  ],
  parent: '31f348fe-f5c6-4438-964e-9fc9273c02cb'
  // ... and some other, maybe custom, data properties
}
```

#### Geometry 几何属性

position 坐标，可通过.position()方法设置
angle 旋转，可通过.rotate()方法设置
size 尺寸，可通过.resize()方法设置

#### Presentation 外观

attrs 同Cell，通过.attr()方法设置
z 层级

#### Nesting 嵌套

embeds 子节点ids
parent 父节点id

#### Element prototype method

getBBox() 获取节点的bounding box(边界，rect)
portProp(portId, path, [value]) 设置端口属性

```javascript
element.portProp('port-id', 'attrs/circle/fill', 'red');
element.portProp('port-id', 'attrs/circle/fill');  // 'red'

element.portProp('port-id', 'attrs/circle', { r: 10, stroke: 'green' });
element.portProp('port-id', 'attrs/circle'); // { r: 10, stroke: 'green', fill: 'red' }
```

### Ports

端口，依附于图形节点，可以被连线连接

#### Port API on joint.dia.Element

以下是与port相关的Element的实例方法
hasPort / hasPorts
addPort / addPorts
removePort / removePorts
getPort / getPorts
portProp
getPortPositions

#### Port示例

```javascript
// Single port definition
var port = {
    // id: 'abc', // generated if `id` value is not present
    group: 'a',
    args: {}, // extra arguments for the port layout function, see `layout.Port` section
    label: {
        position: {
            name: 'right',
            args: { y: 6 } // extra arguments for the label layout function, see `layout.PortLabel` section
        },
        markup: '<text class="label-text" fill="blue"/>'
    },
    attrs: { text: { text: 'port1' } },
    markup: '<rect width="16" height="16" x="-8" strokegit ="red" fill="gray"/>'
};

// a.) add a port in constructor.
var rect = new joint.shapes.standard.Rectangle({
    position: { x: 50, y: 50 },
    size: { width: 90, height: 90 },
    ports: {
        groups: {
            'a': {}
        },
        items: [port]
    }
});

// b.) or add a single port using API
rect.addPort(port);
```

#### Port属性

group 类似于css的class，定义一组port的属性
args 布局参数
label 文字

### Link

图形连线模型，继承自Cell

#### Link示例

```javascript
var link = new joint.dia.Link();
link.source({ id: sourceId }, { anchor: defaultAnchor });
link.target({ id: targetId, port: portId });
link.addTo(graph)
```

#### Link属性

anchor 锚点，link与element的连接点
connectionPoint 视图邻接点
例如，当anchor在节点元素中心时，我们并不需要把连线真的画到中心，而只要连到节点的边界上即可
vertices 连线上的折点
connector 线型

'normal' - 普通
'jumpover' - 连线交叉时显示一个bridge
'rounded' - 转折处显示为圆角
'smooth' - 贝塞尔曲线
router 路径，设置router之后连线不再呈直线连接，而是通过一条设定的路线

'normal' - 普通线
'orthogonal' - 基础版的正交折线
'manhattan' - 优化版的正交折线
'metro' - 另一种正交折线
'oneSide' - 单侧正交折线

#### Link实例方法

source(source [, opt]) 设置起点
target(target [, opt]) 设置终点

// opt示例
link.source({ id: sourceId }, {anchor})
connector() 设置线型
router() 设置路径
vertices() 设置折点

### Event 事件

#### Paper Event

* pointerclick
点击事件
可以添加前缀，以区分不同的点击区域(blank是空白区域)：
cell:pointerdblclick link:pointerdblclick element:pointerdblclick blank:pointerdblclick

pointerdown
鼠标按下

pointermove
鼠标拖拽

pointerup
鼠标松开

link:connect
连线连接时触发

#### Graph Event

add
新建图形

remove
移除图形

change
图形属性改变
change可以添加后缀，以区分不同的属性改变：
change:position 节点位置改变
change:vertices 连线折点改变
change:custom 节点自定义属性改变
