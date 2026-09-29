declare module '*.svg' {
  import type { FC } from 'react';
  import type { SvgProps } from 'react-native-svg';
  const asset: FC<SvgProps>;
  export default asset;
}
