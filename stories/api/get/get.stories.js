import React from 'react';
import { storiesOf } from '@storybook/react';
import { Row, Col, Button } from 'antd';
import { wInfo } from '../../../.storybook/utils';
import mdGet from './get.md';

import { IFrameFactory } from '../../../src';
import { modelPropsGen } from '../../helper';

const { IFrameWithStore: IFrameWithStore1, client: client1 } = IFrameFactory();

// const {
//   IFrameWithStore: IFrameWithStore2,
//   client: client2
// } = IFrameFactory();

const styles = {
  demoWrap: {
    display: 'flex',
    width: '100%'
  }
};

let attributes = {};

const getInfo = (client, filter) => () => {
  const query = filter && filter.length ? `filter=${filter.join(',')}` : '';
  client.get(`/iframe?${query}`).then(res => {
    const { status, body } = res;
    if (status === 200) {
      attributes = body.attributes;
    }

    document.getElementById('info').innerText = JSON.stringify(
      attributes,
      null,
      4
    );
  });
};

const createNew = client => () => {
  const model = modelPropsGen();
  client.post('/iframe', { iframe: model });
};

storiesOf('API - get', module)
  .addParameters(wInfo(mdGet))
  .addWithJSX('/iframe 获取属性信息', () => {
    return (
      <Row style={styles.demoWrap}>
        <Col span={10} offset={2}>
          <Button onClick={getInfo(client1)}>获取信息</Button>
          <Button onClick={getInfo(client1, ['styles', 'url'])}>
            获取指定信息(styles, url)
          </Button>
          <Button onClick={createNew(client1)}>随机创建</Button>

          <IFrameWithStore1 />
        </Col>
        <Col span={12}>
          <div id="info" />
        </Col>
      </Row>
    );
  });
