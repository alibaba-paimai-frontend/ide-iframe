import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Icon } from 'antd';

import { debugIO, debugRender } from '../lib/debug';
import { parseOrFalse } from '../lib/util';
import { StyledContainer } from './styles';
import { AppFactory } from './controller/index';
import { StoresFactory, IStoresModel } from './schema/stores';
import { TIFrameControlledKeys, CONTROLLED_KEYS } from './schema/index';

export interface IIFrameEvent {
  /**
   * 处理 iframe 返回的消息
   */
  handleFrameTasks?: (data: IIFrameData) => void;

  /**
   * onLoad 时的回调函数
   */
  onload?: () => void;
}

export interface IStyles {
  [propName: string]: React.CSSProperties;
}

export interface IIFrameStyles extends IStyles {
  container?: React.CSSProperties;
  icon?: React.CSSProperties;
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

export interface IIFrameProps extends IIFrameEvent {
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
}

// 推荐使用 decorator 的方式，否则 stories 的导出会缺少 **Prop Types** 的说明
// 因为 react-docgen-typescript-loader 需要  named export 导出方式
@observer
export class IFrame extends Component<IIFrameProps> {
  public static defaultProps = {
    url: '',
    allowFullScreen: true,
    showFullScreenIcon: true,
    styles: {
      container: {},
      icon: {}
    }
  };
  private iframe: React.RefObject<HTMLIFrameElement>;
  private isFullScreen: boolean;
  constructor(props: IIFrameProps) {
    super(props);
    // this.state = {};
    this.iframe = React.createRef();
    this.isFullScreen = false;
  }

  componentDidMount() {
    window.addEventListener('message', this.handleFrameTasks);
    document.addEventListener('webkitfullscreenchange', this.fullscreenChange);
    document.addEventListener('mozfullscreenchange', this.fullscreenChange);
    document.addEventListener('fullscreenchange', this.fullscreenChange);
    document.addEventListener('MSFullscreenChange', this.fullscreenChange);

    (this.iframe.current as any).onload = () => {
      const { onload } = this.props;
      onload && onload();
    };
  }
  componentWillUnmount() {
    window.removeEventListener('message', this.handleFrameTasks);
    document.removeEventListener(
      'webkitfullscreenchange',
      this.fullscreenChange
    );
    document.removeEventListener('mozfullscreenchange', this.fullscreenChange);
    document.removeEventListener('fullscreenchange', this.fullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.fullscreenChange);
  }

  fullscreenChange() {
    if (
      document.fullscreenEnabled ||
      (document as any).webkitIsFullScreen ||
      (document as any).mozFullScreen ||
      (document as any).msFullscreenElement
    ) {
      this.isFullScreen = true;
    } else {
      this.isFullScreen = false;
    }
  }

  // 调用全屏函数式
  enterIntoFull = () => {
    if (this.iframe.current) {
      // check if fullscreen mode is available
      if (
        document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled
      ) {
        // Do fullscreen
        if ((this.iframe.current as any).requestFullscreen) {
          (this.iframe.current as any).requestFullscreen();
        } else if ((this.iframe.current as any).webkitRequestFullscreen) {
          (this.iframe.current as any).webkitRequestFullscreen();
        } else if ((this.iframe.current as any).mozRequestFullScreen) {
          (this.iframe.current as any).mozRequestFullScreen();
        } else if ((this.iframe.current as any).msRequestFullscreen) {
          (this.iframe.current as any).msRequestFullscreen();
        }
      } else {
        document.querySelector('.error').innerHTML =
          'Your browser is not supported';
      }
    }
  };

  // 处理从 frame 里发送来的数据
  // https://medium.com/@ebakhtarov/handling-of-iframes-in-react-f038be46ac24
  handleFrameTasks = (e: MessageEvent) => {
    const {
      handleFrameTasks, // 事件处理
      allowEvents // 控制哪些域来的消息可以被处理
    } = this.props;
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
  };

  // 向 iframe 发送数据
  sendToFrame(data: IIFrameData, targetUrl = '*') {
    if (this.iframe.current && !!data) {
      debugIO(`向 iframe 发送消息: ${JSON.stringify(data)}`);
      // 对要传输的数据进行 stringify
      (this.iframe.current as any).contentWindow.postMessage(
        JSON.stringify(data),
        targetUrl
      );
    }
  }

  render() {
    const { styles, url, showFullScreenIcon, allowFullScreen } = this.props;

    const iframeProp = {
      frameBorder: '0',
      src: url,
      target: '_parent',
      allowFullScreen: allowFullScreen || false,
      height: '100%',
      width: '100%'
    };

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

    return (
      <StyledContainer
        style={styles.container}
        // ref={this.root}
        className="ide-iframe-container"
      >
        <iframe ref={this.iframe} {...iframeProp} />
        {showFullScreenIcon ? (
          this.isFullScreen ? (
            <Icon style={iconStyle} type="shrink" />
          ) : (
            <Icon
              onClick={this.enterIntoFull}
              style={iconStyle}
              type="arrows-alt"
            />
          )
        ) : null}
      </StyledContainer>
    );
  }
}

/* ----------------------------------------------------
    以下是专门配合 store 时的组件版本
----------------------------------------------------- */

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

/**
 * 科里化创建 IFrameWithStore 组件
 * @param stores - store 模型实例
 */
export const IFrameAddStore = (stores: IStoresModel) => {
  return observer(function IFrameWithStore(
    props: Omit<IIFrameProps, TIFrameControlledKeys>
    ) {
    const { iframe } = stores;
    const controlledProps: any = {};
    CONTROLLED_KEYS.forEach((storeKey: string) => {
      controlledProps[storeKey] = (iframe as any)[storeKey];
    });
    debugRender(`[${stores.id}] rendering`);
    return <IFrame {...controlledProps} {...props} />;
  });
};

/**
 * 工厂函数，每调用一次就获取一副 MVC
 * 用于隔离不同的 IFrameWithStore 的上下文
 */
export const IFrameFactory = () => {
  const stores = StoresFactory(); // 创建 model
  const app = AppFactory(stores); // 创建 controller，并挂载 model
  return {
    stores,
    app,
    client: app.client,
    IFrameWithStore: IFrameAddStore(stores)
  };
};
