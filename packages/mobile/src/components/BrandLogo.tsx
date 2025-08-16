import React from 'react';
import type { ReactElement } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import LogoSvg from '../../assets/Logo.svg';

type BrandLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
  tintColor?: string;
};

export function BrandLogo({ size = 32, style, tintColor }: BrandLogoProps): ReactElement {
  // Ưu tiên SVG logo mới; fallback sang PNG nếu cần trong tương lai
  return <LogoSvg width={size} height={size} color={tintColor} fill={tintColor} />;
}


