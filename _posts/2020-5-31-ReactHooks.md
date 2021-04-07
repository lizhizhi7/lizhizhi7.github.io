---
layout:     post
title:      React Hooks
date:       2020-5-31
author:     Oliver Li
header-img: img/background-ts.png
catalog:    true
tags:
    - TypeScript
    - React
---

记录一些hook的底层实现细节和使用的注意点

## useEffect

### 弹窗例子
在业务中，会有一个挺常见的场景，就是要有一个按钮，点击以后能把一段文本复制到剪贴版里，大量出现在URL、Token、电话号码之类的地方。

在我们的交互设计中，一个复制按钮可以表现成不同的形式，比如一段文本、一个图标等，当它被点击时，会提示用户已经完成了复制，并且这个提示会在一段时间后消失：
```ts
import React, {FC, useCallback, ReactElement} from 'react';
import {Tooltip} from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import {useTransitionState} from '@huse/transition-state';

interface Props {
    text: string;
    children: ReactElement;
}

const CopyButton: FC<Props> = ({text, children}) => {
    const [noticing, setNoticing] = useTransitionState(false, 2500);
    const copy = useCallback(() => setNoticing(true), [setNoticing]);

    return (
        <Tooltip visible={noticing} title="已复制至剪贴板">
            <CopyToClipboard text={text} onCopy={copy}>
                {children}
            </CopyToClipboard>
        </Tooltip>
    );
};

export default CopyButton;
```

*分解*

作为一个简单的组件，它的逻辑并没有什么突出的复杂度，其中比较关键的是如何让出现的“复制成功”的提示信息可以在一段时间后自动消失。

正常情况下，我们会选择使用一个状态来控制提示是否出现：
```ts
const [visible, setVisible] = useState(false);
const show = useCallback(
    () => setVisible(true),
    []
);
```

而如果我们需要让它在一定时间后自动消失的话，就势必要在值改变的时候，打开一个定时器，设定指定的时间后将值撤销。我们也知道，凡是遇到定时器的场合，我们就要处理好多次打开定时器之间的竞争关系。

对于这样的场景，有2种解法，第一种是在值变更的时候，命令式地打开定时器。但这时你就需要管理好定时器的标记，记得把前一次的定时给关掉：
```ts
const timer = useRef(-1);
const show = useCallback(
    () => {
        clearTimeout(timer.current);
        setVisible(true);
        timer.current = setTimeout(
            () => setVisible(false),
            delay
        );
    },
    [delay]
);
```
切记一点，定时器标记这样的值，它在组件的渲染过程中是不需要的，所以不需要使用一个state去管理，用useRef能保持住值就行。

上面的代码其实有一些瑕疵，当组件销毁后，定时器依然可能执行，调用一次setVisible，此时在开发模式下会产生被控制台里的一个警告，但不会有什么负面效果。

而另一个办法，是使用useEffect来观察值的变化并管理定时器：
```ts
useEffect(
    () => {
        if (visible) {
            const tick = setTimeout(
                () => setVisible(false),
                delay
            );

            return () => clearTimeout(tick);
        }
    },
    [delay, visible]
);
```
useEffect带来的“副作用 - 取消副作用”的方式，可以很方便地管理定时器，也不会产生组件销毁后定时器仍然执行的情况，从复杂度上来说，我们更愿意选择这样的方案。

当然上面的代码依然存在一些瑕疵，当delay（也许是从props中来的）变化时，定时器会被取消并生成一次新的定时，但这往往并不是我们想要的效果，因为功能面向用户，用户只需要在点击按钮出现提示后，提示按照预期的时间自动消失。

那如果我们不把delay作为useEffect的一个依赖传递呢？虽然在行为是完全符合预期，却会让eslint报一个错，非常不适合强迫症，也可能导致delay真正发生变化后，用户点击出现的消息并不按最后的delay时间消失。

所以在这里，我们就要启用useRef的“作弊模式”。eslint的规则会判断一个值是否为ref，并识别其不需要加入到useEffect、useCallback等的依赖中。当一个值并不会影响渲染，也不需要引发副作用时，使用useRef去托管就是一个很好的选择。
```ts
const delayRef = useRef(delay);
useEffect(
    () => {
        delayRef.current = delay;
    },
    [delay]
);
useEffect(
    () => {
        if (visible) {
            const tick = setTimeout(
                () => setVisible(false),
                delayRef.current
            );

            return () => clearTimeout(tick);
        }
    },
    [visible]
);
```
而把这些逻辑串起来，形成“一个变化后会自动变回去的状态”这样的概念，额外再抽象一些能力，比如：

可以是什么类型，不局限于boolean，并可以指定初始值。
可以设定默认的持续时间。
可以在每一次修改状态时，指定一个临时的持续时间。
允许在持续过程中手动设置回默认值。
将这些能力整合到一起后，就是huse系列中的useTransitionState。

总结
从一个简单的复制按钮的交互开始，在这一篇中重点讲解了如何使用状态+定时器的组合来实现一个过渡式的状态，并让状态自动返回初始值，其中的要点有：

与渲染无关的数据可以使用useRef存储，不需要useState管理状态。
可以使用命令式或useEffect的方式管理定时器，但往往使用useEffect更为方便，也能照顾到组件销毁时的情况。
对于不希望引发useEffect的数据，可以使用useRef管理形成一种“作弊”骗过eslint，同时确保能在useEffect的闭包中取到最新的值。
这个hook可用在所有临时出现的场景，包括提示信息、消息气泡等，一定程度上配合CSS的动画能取得更好的效果。