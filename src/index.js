import React from 'react';
import ReactDOM from 'react-dom';
// 创建react元素
import ViewManager from './js/ui/viewManager';

// 把react元素渲染到页面中
ReactDOM.render(<ViewManager/>, document.getElementById('root'));
// ReactDOM.render(ViewManager, document.getElementById('root')); 未修改原码，标签的意思是什么<ViewManager/>
