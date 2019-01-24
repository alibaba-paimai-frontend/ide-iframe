import { types, Instance } from 'mobx-state-tree';

import { createEmptyModel } from './util';
import { IFrameModel, IIFrameModel } from './index';

export const STORE_ID_PREIX = 'sif_';

export const Stores = types
  .model('StoresModel', {
    id: types.refinement(
      types.identifier,
      identifier => identifier.indexOf(STORE_ID_PREIX) === 0
    ),
    iframe: IFrameModel
  })
  .actions(self => {
    return {
      setModel(model: IIFrameModel) {
        self.iframe = model;
      },
      resetToEmpty() {
        self.iframe = createEmptyModel();
      }
    };
  });

export interface IStoresModel extends Instance<typeof Stores> {}

let autoId = 1;
/**
 * 工厂方法，用于创建 stores
 */
export function StoresFactory(): IStoresModel {
  return Stores.create({
    id: `${STORE_ID_PREIX}${autoId++}`,
    iframe: createEmptyModel() as any
  });
}
