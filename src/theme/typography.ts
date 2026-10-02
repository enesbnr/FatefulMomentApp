import { Platform } from 'react-native';

// Font files are registered natively under these exact names. Components use
// this map so a font upgrade or native-name change has one source of truth.
export const fontFamilies = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  bold: 'Inter-Bold',
  nunitoRegular: 'Nunito-Regular',
  mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
} as const;
