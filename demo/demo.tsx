import * as React from 'react';
import { render } from 'react-dom';
import { IFrame, IIFrameProps } from '../src/';

function onLoad() {
  console.log('iframe 加载成功...');
}

const props: IIFrameProps = {
  styles: {
    container:{
      width: 800,
      height: 600
    }
  },
  url: 'https://www.baidu.com'
};

render(<IFrame {...props} onload={onLoad} />, document.getElementById(
  'example'
) as HTMLElement);
