declare module 'leaflet.gridlayer.googlemutant' {
  import { GridLayer, type GridLayerOptions } from 'leaflet';

  export interface GoogleMutantOptions extends GridLayerOptions {
    type?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
    styles?: unknown[];
    maxZoom?: number;
  }

  export default class GoogleMutant extends GridLayer {
    constructor(options?: GoogleMutantOptions);
    /** 例如 'TransitLayer'、'TrafficLayer' */
    addGoogleLayer(name: string, options?: object): this;
    removeGoogleLayer(name: string): this;
  }
}
