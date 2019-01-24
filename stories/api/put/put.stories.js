import React from 'react';
import { storiesOf } from '@storybook/react';
import { Row, Col, Input, Button, Select } from 'antd';
import { wInfo } from '../../../.storybook/utils';
import mdPut from './put.md';

import { IFrameFactory } from '../../../src';
import { modelPropsGen } from '../../helper';

const { IFrameWithStore, client } = IFrameFactory();

const { Option } = Select;
const styles = {
  demoWrap: {
    display: 'flex',
    width: '100%'
  }
};

let selectedAttrName = '';

const createNew = client => () => {
  const model = modelPropsGen();
  client.post('/iframe', { iframe: model });
};

function handleChange(value) {
  console.log(`selected ${value}`);
  selectedAttrName = value;
}

function updateAttr() {
  if (!selectedAttrName) {
    document.getElementById('info').innerText = '请选择要更改的属性';
    return;
  }

  const value = document.getElementById('targeValue').value;

  // 更新节点属性，返回更新后的数值
  client
    .put(`/iframe`, { name: selectedAttrName, value: value })
    .then(res => {
      const { status, body } = res;
      if (status === 200) {
        client.get(`/iframe`).then(res => {
          const { status, body } = res;
          if (status === 200) {
            const attributes = body.attributes || {};
            document.getElementById('info').innerText =
              `更新操作：; \n` + JSON.stringify(attributes, null, 4);
          }
        });
      }
    })
    .catch(err => {
      document.getElementById('info').innerText =
        `更新失败： \n` + JSON.stringify(err, null, 4);
    });
}

let selectedTarget = '';

function handleChangeCss(value) {
  console.log(`selected target ${value}`);
  selectedTarget = value;
}

function updateCss() {
  if (!selectedTarget) {
    document.getElementById('info').innerText = '请选择更改对象';
    return;
  }

  const cssKey = document.getElementById('cssKey').value;
  const cssValue = document.getElementById('cssValue').value;
  const style = {};
  style[cssKey] = cssValue;
  // 更新节点属性，返回更新后的数值
  client
    .put(`/iframe/styles/${selectedTarget}`, { style: style })
    .then(res => {
      const { status, body } = res;
      if (status === 200) {
        const result = body;
        client.get(`/iframe?filter=styles`).then(res => {
          const { status, body } = res;
          if (status === 200) {
            const attributes = body.attributes || {};
            document.getElementById('info').innerText =
              `更新操作：${result.success} - ${result.message}; \n` + JSON.stringify(attributes, null, 4);
          }
        });
      }
    })
    .catch(err => {
      document.getElementById('info').innerText =
        `更新失败： \n` + JSON.stringify(err, null, 4);
    });
}

storiesOf('API - put', module)
  .addParameters(wInfo(mdPut))
  .addWithJSX('/iframe 更改属性', () => {
    return (
      <Row style={styles.demoWrap}>
        <Col span={10} offset={2}>
          <Row>
            <Col span={6}>
              <Select
                style={{ width: 200 }}
                onChange={handleChange}
                placeholder="要更改的属性"
              >
                <Option value="url">url</Option>
                <Option value="allowFullScreen">allowFullScreen</Option>
                <Option value="showFullScreenIcon">showFullScreenIcon</Option>
                <Option value="allowEvents">allowEvents</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Input placeholder="新属性值" id="targeValue" />
            </Col>
            <Col span={10}>
              <Button onClick={updateAttr}>更改信息</Button>
              <Button onClick={createNew(client)}>随机创建</Button>
            </Col>
          </Row>

          <IFrameWithStore />
        </Col>
        <Col span={12}>
          <div id="info" />
        </Col>
      </Row>
    );
  })
  .addWithJSX('/iframe/styles 更改样式', () => {
    return (
      <Row style={styles.demoWrap}>
        <Col span={10} offset={2}>
          <Row>
            <Col span={6}>
              <Select
                style={{ width: 200 }}
                onChange={handleChangeCss}
                placeholder="选择更改的对象"
              >
                <Option value="container">container</Option>
                <Option value="icon">icon</Option>
              </Select>
            </Col>
            <Col span={10}>
              <Input placeholder="css key" id="cssKey" />
              <Input placeholder="css value" id="cssValue" />
            </Col>
            <Col span={6}>
              <Button onClick={updateCss}>更改样式</Button>
              <Button onClick={createNew(client)}>随机创建</Button>
            </Col>
          </Row>

          <IFrameWithStore />
        </Col>
        <Col span={12}>
          <div id="info" />
        </Col>
      </Row>
    );
  });
