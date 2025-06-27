export type ElementType = 'rectangle' | 'circle' | 'text' | 'image';

export interface CanvasElement {
  type: ElementType;
  properties: any;
}
