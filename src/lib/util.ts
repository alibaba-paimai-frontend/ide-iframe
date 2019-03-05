import { debugMini, debugBase, debugError } from './debug';
export function parseOrFalse(str: any) {
  var json = {};
  try {
    if (str.length) {
      json = JSON.parse(str);
      debugMini('=====> 将字符串解析成 JSON 成功');
      debugBase('=====> 获得的 JSON 的内容：' + json);

      return json;
    } else {
      return false;
    }
  } catch (err) {
    debugError('=====> 将字符串解析成 JSON 失败：', err);
    debugError('=====> 原字符串内容：' + str);

    return false;
  }
}

export function isTrue(val: any) {
  return val === 'true' || val === true;
}


