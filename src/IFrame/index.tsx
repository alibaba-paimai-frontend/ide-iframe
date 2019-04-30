import React, { Component, useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Icon } from 'antd';
import { pick } from 'ide-lib-utils';
import {
  based,
  Omit,
  OptionalProps,
  IBaseTheme,
  IBaseComponentProps,
  IStoresEnv,
  useInjectedEvents,
  extracSubEnv,
  IBaseStyles
} from 'ide-lib-base-component';

import { debugInteract, debugRender, debugIO, debugComp } from '../lib/debug';
import { parseOrFalse } from '../lib/util';
import { StyledContainer } from './styles';
import { AppFactory } from './controller/index';
import { StoresFactory, IStoresModel } from './schema/stores';
import { TIFrameControlledKeys, CONTROLLED_KEYS } from './schema/index';
import { showConsole } from './solution';

interface ISubComponents {
  // SchemaTreeComponent: React.ComponentType<OptionalSchemaTreeProps>;
}

/**
 * 定义在 iframe 中传输的数据格式
 */
export interface IIFrameData {
  event: string;
  type: string;
  data: any;
  [propName: string]: any;
}

export interface IIFrameEvent {
  /**
   * 处理 iframe 返回的消息
   */
  handleFrameTasks?: (data: IIFrameData) => void;

  /**
   * onLoad 时的回调函数
   */
  onLoad?: () => void;
}

export interface IIFrameStyles extends IBaseStyles {
  container?: React.CSSProperties;
  icon?: React.CSSProperties;
}

export interface IIFrameTheme extends IBaseTheme {
  main: string;
}

export interface IIFrameProps extends IIFrameEvent, IBaseComponentProps {
  /**
   * 是否允许全屏
   * 默认值：true
   */
  allowFullScreen?: boolean;

  /**
   * 是否显示全屏的 icon
   * 默认值：true
   */
  showFullScreenIcon?: boolean;

  /**
   * iframe 中的 url 地址
   */
  url?: string;

  /**
   * 样式集合，方便外部控制
   */
  styles?: IIFrameStyles;

  /**
   * 允许接收的事件列表
   */
  allowEvents?: string | string[];

  /**
   * 需要给 iframe 发送的数据，可以被 JSON.stringify 的合法格式即可
   */
  data?: any;
}

export const DEFAULT_PROPS: IIFrameProps = {
  url: '',
  allowFullScreen: false,
  showFullScreenIcon: true,
  styles: {
    container: {},
    icon: {},
    iframe: {
      backgroundColor: 'white'
    }
  }
};

/**
 * 使用高阶组件打造的组件生成器
 * @param subComponents - 子组件列表
 */
export const IFrameHOC = (subComponents: ISubComponents) => {
  const IFrameHOC = (props: IIFrameProps) => {
    // const { SchemaTreeComponent } = subComponents;
    const mergedProps = Object.assign({}, DEFAULT_PROPS, props);
    const { url, showFullScreenIcon, allowFullScreen, styles, data: iframeData } = mergedProps;
    const [isFull, setIsFull] = useState(false); // 是否全屏
    const [loaded, setLoaded] = useState(false); // iframe 是否已加载
    const refIframe = React.useRef(null);

    // 处理消息的 callback
    const handleFrameTasks = useCallback((e: MessageEvent) => {
      const {
        handleFrameTasks, // 事件处理
        allowEvents // 控制哪些域来的消息可以被处理
      } = props;
      let message = parseOrFalse(e.data) as IIFrameData;
      const allows = [].concat(allowEvents);
      if (
        !!message &&
        allows.length &&
        handleFrameTasks &&
        allows.includes(message.event)
      ) {
        handleFrameTasks(message);
      }
    }, []);

    // fullscreenChange 状态变更
    const fullscreenChange = useCallback(() => {
      if (
        document.fullscreenEnabled ||
        (document as any).webkitIsFullScreen ||
        (document as any).mozFullScreen ||
        (document as any).msFullscreenElement
      ) {
        setIsFull(true);
      } else {
        setIsFull(false);
      }
    }, []);

    // 进入全屏
    const enterIntoFull = useCallback(() => {
      if (refIframe.current) {
        // check if fullscreen mode is available
        if (
          document.fullscreenEnabled ||
          (document as any).webkitFullscreenEnabled ||
          (document as any).mozFullScreenEnabled ||
          (document as any).msFullscreenEnabled
        ) {
          // Do fullscreen
          if ((refIframe.current as any).requestFullscreen) {
            (refIframe.current as any).requestFullscreen();
          } else if ((refIframe.current as any).webkitRequestFullscreen) {
            (refIframe.current as any).webkitRequestFullscreen();
          } else if ((refIframe.current as any).mozRequestFullScreen) {
            (refIframe.current as any).mozRequestFullScreen();
          } else if ((refIframe.current as any).msRequestFullscreen) {
            (refIframe.current as any).msRequestFullscreen();
          }
        } else {
          document.querySelector('.error').innerHTML =
            'Your browser is not supported';
        }
      }
    }, []);

    // 给 iframe 发送消息
    const sendToFrame = useCallback((tag?: string) => {
      if (refIframe && refIframe.current && !!iframeData) {
        debugIO(`${!!tag ? `[${tag}]`: ''}向 iframe (url: ${url})发送消息，数据 %o`, iframeData);
        // 对要传输的数据进行 stringify
        refIframe.current.contentWindow.postMessage(
          typeof iframeData === 'string' ? iframeData : JSON.stringify(iframeData),
          '*'
        );
      }
    }, [iframeData]);

    // 当有 data 更新的时候 & iframe 已加载后，才给 iframe 发送消息
    useEffect(() => {
      debugComp('检测到 props.data 有变更，向 iframe 发送消息');
      if (loaded) {
        sendToFrame('in useEffect');
      }
    }, [iframeData]);


    useEffect(() => {
      window.addEventListener('message', handleFrameTasks);
      document.addEventListener('webkitfullscreenchange', fullscreenChange);
      document.addEventListener('mozfullscreenchange', fullscreenChange);
      document.addEventListener('fullscreenchange', fullscreenChange);
      document.addEventListener('MSFullscreenChange', fullscreenChange);

      (refIframe.current as any).onload = () => {
        const { onLoad } = props;
        sendToFrame('in load'); // 加载完之后需要发送一次数据；
        setLoaded(true);
        onLoad && onLoad();
      };

      return () => {
        window.removeEventListener('message', handleFrameTasks);
        document.removeEventListener(
          'webkitfullscreenchange',
          fullscreenChange
        );
        document.removeEventListener('mozfullscreenchange', fullscreenChange);
        document.removeEventListener('fullscreenchange', fullscreenChange);
        document.removeEventListener('MSFullscreenChange', fullscreenChange);
      };
    }, []);

    const iconStyle = Object.assign(
      {},
      {
        position: 'absolute',
        fontSize: '20px',
        right: '10px',
        top: '10px',
        cursor: 'pointer',
        color: '#333'
      },
      styles.icon || {}
    );

    const iframeProp = {
      frameBorder: '0',
      src: url,
      target: '_parent',
      allowFullScreen: allowFullScreen,
      height: '100%',
      width: '100%'
    };

    return (
      <StyledContainer
        style={styles.container}
        // ref={this.root}
        className="ide-iframe-container"
      >
        <iframe ref={refIframe} {...iframeProp} style={styles.iframe} />
        {showFullScreenIcon ? (
          isFull ? (
            <Icon style={iconStyle} type="shrink" />
          ) : (
            <Icon onClick={enterIntoFull} style={iconStyle} type="arrows-alt" />
          )
        ) : null}
      </StyledContainer>
    );
  };
  IFrameHOC.displayName = 'IFrameHOC';
  return observer(based(IFrameHOC, DEFAULT_PROPS));
};

// 采用高阶组件方式生成普通的 IFrame 组件
export const IFrame = IFrameHOC({});

/* ----------------------------------------------------
    以下是专门配合 store 时的组件版本
----------------------------------------------------- */

/**
 * 科里化创建 IFrameWithStore 组件
 * @param stores - store 模型实例
 */
export const IFrameAddStore = (storesEnv: IStoresEnv<IStoresModel>) => {
  const { stores } = storesEnv;
  const IFrameHasSubStore = IFrameHOC({});

  const IFrameWithStore = (
    props: Omit<IIFrameProps, TIFrameControlledKeys>
  ) => {
    const { ...otherProps } = props;
    const { model } = stores;
    const controlledProps = pick(model, CONTROLLED_KEYS);
    debugRender(`[${stores.id}] rendering`);

    const otherPropsWithInjected = useInjectedEvents<
      IIFrameProps,
      IStoresModel
    >(storesEnv, otherProps, {
      onLoad: [showConsole]
    });

    return (
      <IFrameHasSubStore {...controlledProps} {...otherPropsWithInjected} />
    );
  };

  IFrameWithStore.displayName = 'IFrameWithStore';
  return observer(IFrameWithStore);
};

/**
 * 生成 env 对象，方便在不同的状态组件中传递上下文
 */
export const IFrameStoresEnv = () => {
  const { stores, innerApps } = StoresFactory(); // 创建 model
  const app = AppFactory(stores, innerApps); // 创建 controller，并挂载 model
  return {
    stores,
    app,
    client: app.client,
    innerApps: innerApps
  };
};

/**
 * 工厂函数，每调用一次就获取一副 MVC
 * 用于隔离不同的 IFrameWithStore 的上下文
 */
export const IFrameFactory = () => {
  const storesEnv = IFrameStoresEnv();
  return {
    ...storesEnv,
    IFrameWithStore: IFrameAddStore(storesEnv)
  };
};
