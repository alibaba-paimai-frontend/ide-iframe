import styled from 'styled-components';

export const StyledContainer = styled.div.attrs({
  style: (props: any) => props.style || {} // 优先级会高一些，行内样式
})`
  position: relative;
  width: ${(props: React.CSSProperties) => props.width || '100%'};
  height: ${(props: React.CSSProperties) => props.height || '100%'};
`;
