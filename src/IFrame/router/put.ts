import Router from 'ette-router';

import { IContext } from './helper';
import { isPlainObject } from '../../lib/util';

export const router = new Router();
// 更新单项属性
router.put('iframe', '/iframe', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { name, value } = request.data;

  //   stores.setSchema(createSchemaModel(schema));
  const isSuccess = stores.iframe.updateAttribute(name, value);
  ctx.response.body = {
    success: isSuccess
  };

  ctx.response.status = 200;
});

// 更新 css 属性
router.put('iframe', '/iframe/styles/:target', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { style } = request.data;
  const { target } = ctx.params;
  let result = {
    message: '',
    success: false
  };

  if (!target) {
    result.message = '传入 css 目标不能为空';
  } else if (!isPlainObject(style)) {
    result.message = `传入 css 对象格式不正确: ${style}`;
  } else {
    // stores.setSchema(createSchemaModel(schema));
    result = stores.iframe.updateCssAttribute(target, style);
  }

  ctx.response.body = result;
  ctx.response.status = 200;
});
