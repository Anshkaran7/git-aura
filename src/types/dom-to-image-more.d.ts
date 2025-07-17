declare module "dom-to-image-more" {
  export interface DomToImageOptions {
    quality?: number;
    bgcolor?: string;
    style?: {
      transform?: string;
      transformOrigin?: string;
      width?: string;
      height?: string;
    };
  }

  export function toPng(
    node: Node,
    options?: DomToImageOptions
  ): Promise<string>;
  export function toJpeg(
    node: Node,
    options?: DomToImageOptions
  ): Promise<string>;
  export function toBlob(
    node: Node,
    options?: DomToImageOptions
  ): Promise<Blob>;
  export function toPixelData(
    node: Node,
    options?: DomToImageOptions
  ): Promise<Uint8ClampedArray>;

  const domToImage: {
    toPng: typeof toPng;
    toJpeg: typeof toJpeg;
    toBlob: typeof toBlob;
    toPixelData: typeof toPixelData;
  };

  export default domToImage;
}
