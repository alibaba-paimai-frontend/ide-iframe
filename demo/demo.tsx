import * as React from 'react';
import { render } from 'react-dom';
import { IFrame, IIFrameProps, IFrameFactory } from '../src/';
import { schema } from './schema';

function onLoad() {
  console.log('iframe 加载成功...');
}

const props: IIFrameProps = {
  styles: {
    container: {
      width: 400,
      height: 300
    }
  },
  data: {
    event: 'data-from-ide',
    type: 'updateSchema',
    data: schema
  },
  url: 'http://www.baidu.com'
};

render(<IFrame {...props} onLoad={onLoad} />, document.getElementById(
  'example'
) as HTMLElement);

// =============================

const { IFrameWithStore, client } = IFrameFactory();
render(<IFrameWithStore dataType={'JSON'} onLoad={onLoad} />, document.getElementById(
  'example-stores'
) as HTMLElement);

// 更改地址
client.put('/iframe', {
  name: 'url',
  value: 'http://www.baidu.com'
});

setTimeout(() => {
  // 然后传递数据
  client.put('/iframe', {
    name: 'data',
    value: {
      event: 'data-from-ide',
      type: 'updateSchema',
      data: schema
    }
  });

}, 3000);
