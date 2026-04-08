/// <reference types="vite/client" />

import type { Map } from '@amap/amap-jsapi-types';

declare global {
  interface Window {
    mapInstance?: Map;
  }
}
