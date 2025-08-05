export type FilterType =
  | 'gray'
  | 'sepia'
  | 'blur'
  | 'pixelate'
  | 'invert'
  | 'cartoon'
  | 'pencil'
  | 'thermal'

export interface FilterOption {
    type: FilterType;
    title: string;
    subtitle: string;
}