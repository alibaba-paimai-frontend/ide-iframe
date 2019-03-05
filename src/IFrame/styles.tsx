import styled from 'styled-components';

import { IBaseStyledProps } from 'ide-lib-base-component';
import { IIFrameProps } from './index';

interface IStyledProps extends IIFrameProps, IBaseStyledProps { }

export const StyledContainer = styled.div.attrs({
  style: (props: IStyledProps) => props.style || {} // 优先级会高一些，行内样式
})`
  position: relative;
  width: 100%;
  height: 100%;
`;
