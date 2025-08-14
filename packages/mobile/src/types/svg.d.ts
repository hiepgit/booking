declare module '*.svg' {
  import type { ComponentType } from 'react';
  const content: ComponentType<{ width?: number | string; height?: number | string; fill?: string }>;
  export default content;
}


