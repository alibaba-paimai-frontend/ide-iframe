import {
  cast,
  types,
  Instance,
  IAnyModelType,
  applySnapshot,
  SnapshotOrInstance
} from 'mobx-state-tree';

import { pick } from 'ide-lib-utils';
import { BaseModel, TBaseControlledKeys, BASE_CONTROLLED_KEYS } from 'ide-lib-base-component';

import { debugModel } from '../../lib/debug';
import { isTrue } from '../../lib/util';
import { updateModelAttribute } from './util';

// export enum ECodeLanguage {
//   JSON = 'json',
//   JS = 'javascript',
//   TS = 'typescript'
// }
// export const CODE_LANGUAGES = Object.values(ECodeLanguage);


// 获取被 store 控制的 model key 的列表
export type TIFrameControlledKeys =
  keyof SnapshotOrInstance<typeof IFrameModel> | TBaseControlledKeys;

// 定义被 store 控制的 model key 的列表，没法借用 ts 的能力动态从 TIFrameControlledKeys 中获取
export const CONTROLLED_KEYS: string[] = BASE_CONTROLLED_KEYS.concat([
  'allowFullScreen',
  'showFullScreenIcon',
  'url',
  'data',
  'allowEvents'
]);


/**
 * IFrame 对应的模型
 */
export const IFrameModel = BaseModel
  .named('IFrameModel')
  .props({
    allowFullScreen: types.optional(types.boolean, true),
    showFullScreenIcon: types.optional(types.boolean, true),
    url: types.optional(types.string, ''),
    data: types.optional(types.string, ''), // 要发送给 iframe 的 data
    allowEvents: types.array(types.string),
    // language: types.optional(
    //   types.enumeration('Type', CODE_LANGUAGES),
    //   ECodeLanguage.JS
    // ),
    // children: types.array(types.late((): IAnyModelType => SchemaModel)) // 在 mst v3 中， `types.array` 默认值就是 `[]`
    // options: types.map(types.union(types.boolean, types.string))
    // 在 mst v3 中， `types.map` 默认值就是 `{}`
    //  ide 的 Options 可选值参考： https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
  })
  .views(self => {
    return {
      /**
       * 只返回当前模型的属性，可以通过 filter 字符串进行属性项过滤
       */
      allAttibuteWithFilter(filterArray: string | string[] = CONTROLLED_KEYS) {
        const filters = [].concat(filterArray || []);
        return pick(self, filters);
      }
    };
  })
  .actions(self => {
    return {
      setAllowFullScreen(val: any) {
        self.allowFullScreen = isTrue(val);
      },
      setShowFullScreenIcon(val: any) {
        self.showFullScreenIcon = isTrue(val);
      },
      setUrl(url: string) {
        self.url = url;
      },
      setData(data: string) {
        self.data = typeof data === 'object' ? JSON.stringify(data) : data;
      },
      setAllowEvents(e: string | string[]) {
        self.allowEvents = [].concat(e) as typeof self.allowEvents;
      }
    };
  })
  .actions(self => {
    return {
      updateAttribute(name: string, value: any) {
        return updateModelAttribute(self as IIFrameModel, name, value);
      }
    };
  });

export interface IIFrameModel extends Instance<typeof IFrameModel> { }