import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export function EmailIcon({ size = 18, color = "#9CA3AF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path 
        d="M15 3H3C2.175 3 1.5075 3.675 1.5075 4.5L1.5 13.5C1.5 14.325 2.175 15 3 15H15C15.825 15 16.5 14.325 16.5 13.5V4.5C16.5 3.675 15.825 3 15 3ZM15 6L9 9.75L3 6V4.5L9 8.25L15 4.5V6Z" 
        fill={color}
      />
    </Svg>
  );
}

export function LockIcon({ size = 18, color = "#9CA3AF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path 
        d="M14.25 6H13.5V4.5C13.5 2.0175 11.4825 0 9 0C6.5175 0 4.5 2.0175 4.5 4.5V6H3.75C2.925 6 2.25 6.675 2.25 7.5V15.75C2.25 16.575 2.925 17.25 3.75 17.25H14.25C15.075 17.25 15.75 16.575 15.75 15.75V7.5C15.75 6.675 15.075 6 14.25 6ZM9 13.5C8.175 13.5 7.5 12.825 7.5 12C7.5 11.175 8.175 10.5 9 10.5C9.825 10.5 10.5 11.175 10.5 12C10.5 12.825 9.825 13.5 9 13.5ZM11.625 6H6.375V4.5C6.375 3.0525 7.5525 1.875 9 1.875C10.4475 1.875 11.625 3.0525 11.625 4.5V6Z" 
        fill={color}
      />
    </Svg>
  );
}

export function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M10.2 8.09V12.09H15.69C15.43 13.58 14.25 16.17 10.2 16.17C6.72 16.17 3.89 13.28 3.89 9.71C3.89 6.14 6.72 3.25 10.2 3.25C12.16 3.25 13.46 4.09 14.22 4.79L17.11 2.01C15.25 0.28 12.83 -0.71 10.2 -0.71C4.61 -0.71 0 3.71 0 9.71C0 15.71 4.61 20.13 10.2 20.13C16.05 20.13 20 16.16 20 9.71C20 9.08 19.93 8.59 19.84 8.09H10.2Z" fill="#4285F4"/>
      <Path d="M10.2 3.25C12.16 3.25 13.46 4.09 14.22 4.79L17.11 2.01C15.25 0.28 12.83 -0.71 10.2 -0.71C6.26 -0.71 2.86 1.69 1.24 5.09L4.5 7.59C5.33 5.25 7.61 3.25 10.2 3.25Z" fill="#EA4335"/>
      <Path d="M10.2 16.17C7.61 16.17 5.33 14.17 4.5 11.83L1.24 14.33C2.86 17.73 6.26 20.13 10.2 20.13C12.76 20.13 15.14 19.2 16.96 17.58L13.89 15.25C12.98 15.83 11.71 16.17 10.2 16.17Z" fill="#34A853"/>
      <Path d="M19.84 8.09C19.93 8.59 20 9.08 20 9.71C20 10.34 19.93 10.83 19.84 11.33H10.2V8.09H19.84Z" fill="#FBBC04"/>
    </Svg>
  );
}

export function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M20 10C20 4.48 15.52 0 10 0S0 4.48 0 10C0 14.84 3.44 18.87 8 19.8V13H6V10H8V7.5C8 5.57 9.57 4 11.5 4H14V7H12C11.45 7 11 7.45 11 8V10H14V13H11V19.95C16.05 19.45 20 15.19 20 10Z" fill="#1877F2"/>
    </Svg>
  );
}

export function UserIcon({ size = 18, color = "#9CA3AF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path 
        d="M9 9C11.4825 9 13.5 6.9825 13.5 4.5C13.5 2.0175 11.4825 0 9 0C6.5175 0 4.5 2.0175 4.5 4.5C4.5 6.9825 6.5175 9 9 9ZM9 11.25C5.9925 11.25 0 12.7575 0 15.75V18H18V15.75C18 12.7575 12.0075 11.25 9 11.25Z" 
        fill={color}
      />
    </Svg>
  );
}