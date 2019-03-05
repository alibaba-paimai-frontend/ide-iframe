import React from 'react';
import { storiesOf } from '@storybook/react';
import { wInfo } from '../../.storybook/utils';

import { IFrame, createModel, IFrameAddStore } from '../../src/';
import mdMobx from './simple-mobx.md';
import mdPlain from './simple-plain.md';

const propsNormal = {
  url: 'https://www.baidu.com',
  styles: {
    container: {
      width: 800
    }
  }
};
const propsModel = createModel(propsNormal);

const clickBtn = target => () => {
  if (target && target.setUrl) {
    target.setUrl('https://www.hao123.com/');
    propsModel.setStyles({
      container:{
        width: 400 + Math.random()*10
      }
    })
  } else {
    target.url = 'https://www.hao123.com/';
  }
};

storiesOf('基础使用', module)
  .addParameters(wInfo(mdMobx))
  .addWithJSX('使用 mobx 化的 props', () => {
    const IFrameWithStore = IFrameAddStore({ stores: { model: propsModel }});
    return (
      <div>
        <button onClick={clickBtn(propsModel)}>更改 url（会响应）</button>
        <IFrameWithStore />
      </div>
    );
  })
  .addParameters(wInfo(mdPlain))
  .addWithJSX('普通 props 对象', () => (
    <div>
      <button onClick={clickBtn(propsNormal)}>更改 url（不会响应）</button>
      <IFrame {...propsNormal} />
    </div>
  ));
