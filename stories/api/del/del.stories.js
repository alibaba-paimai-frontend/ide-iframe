import React from 'react';
import { storiesOf } from '@storybook/react';
import { Row, Col, Input, Button } from 'antd';

import { wInfo } from '../../../.storybook/utils';
import mdDel from './del.md';

import { IFrameFactory } from '../../../src';
import { modelPropsGen } from '../../helper';

const {
  IFrameWithStore: IFrameWithStore1,
  client: client1
} = IFrameFactory();

const styles = {
  demoWrap: {
    display: 'flex',
    width: '100%'
  }
};

const createNew = client => () => {
  const model = modelPropsGen();
  client.post('/iframe', { iframe: model });
};

const resetSchema = client => () => {
  client.del('/iframe');
}

function onClick(value) {
  console.log('当前值：', value);
}

storiesOf('API - del', module)
  .addParameters(wInfo(mdDel))
  .addWithJSX('/iframe 重置', () => {
    return (
      <Row style={styles.demoWrap}>
        <Col span={10} offset={2}>
          <Row>
            <Col span={20}>
              <Button onClick={resetSchema(client1)}>重置</Button>
              <Button onClick={createNew(client1)}>随机创建</Button>
            </Col>
          </Row>

          <IFrameWithStore1 onClick={onClick} />
        </Col>
        <Col span={12}>
          <div id="info" />
        </Col>
      </Row>
    );
  });
