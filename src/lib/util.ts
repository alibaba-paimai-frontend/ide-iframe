import { debugMini, debugBase, debugError } from './debug';
export function invariant(check: boolean, message: string, thing?: string) {
  if (!check) {
    throw new Error(
      '[iframe] Invariant failed: ' +
        message +
        (thing ? " in '" + thing + "'" : '')
    );
  }
}

export function isExist(val: any): boolean {
  return typeof val !== 'undefined' && val !== null;
}

export function isTrue(val: any): boolean {
  return val === 'true' || val === true;
}

// from mobx
export function uniq(arr: any[]) {
  var res: any[] = [];
  arr.forEach(function(item) {
    if (res.indexOf(item) === -1) res.push(item);
  });
  return res;
}

export function pick(object: any, paths: string[]) {
  const obj: any = {};
  for (const path of paths) {
    if (object[path]) {
      obj[path] = object[path];
    }
  }
  return obj;
}

export function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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

export function isPlainObject(value: any) {
  if (value === null || typeof value !== 'object') return false;
  var proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
