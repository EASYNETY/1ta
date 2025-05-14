// Type definitions for dom-to-image
export interface DomToImageOptions {
  filter?: (node: Node) => boolean;
  bgcolor?: string;
  width?: number;
  height?: number;
  style?: Record<string, string>;
  quality?: number;
  cacheBust?: boolean;
  imagePlaceholder?: string;
}

export interface DomToImage {
  toSvg: (node: Node, options?: DomToImageOptions) => Promise<string>;
  toPng: (node: Node, options?: DomToImageOptions) => Promise<string>;
  toJpeg: (node: Node, options?: DomToImageOptions) => Promise<string>;
  toBlob: (node: Node, options?: DomToImageOptions) => Promise<Blob>;
  toPixelData: (node: Node, options?: DomToImageOptions) => Promise<Uint8Array>;
}
