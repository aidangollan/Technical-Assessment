import { FilterOption, FilterType } from "../types/filter";

export const Filters: Array<FilterOption> = [
    {
        type: 'gray',
        title: 'Grayscale',
    },
    {
        type: 'sepia',
        title: 'Sepia',
    },
    {
        type: 'blur',
        title: 'Blur',
    },
    {
        type: 'pixelate',
        title: 'Pixelate',
    },
    {
        type: 'invert',
        title: 'Invert Colors',
    },
    {
        type: 'cartoon',
        title: 'Cartoon',
    },
    {
        type: 'pencil',
        title: 'Pencil Sketch',
    },
    {
        type: 'thermal',
        title: 'Thermal',
    },
];

export const filterStyleMap: Record<
  FilterType,
  { bgClass: string; textClass: string; filterCss?: string }
> = {
  gray: { bgClass: 'bg-gray-500 bg-opacity-80', textClass: 'text-white', filterCss: 'grayscale(100%)' },
  sepia: { bgClass: 'bg-yellow-700 bg-opacity-80', textClass: 'text-white', filterCss: 'sepia(100%)' },
  blur: { bgClass: 'bg-blue-300 bg-opacity-80', textClass: 'text-black', filterCss: 'blur(2px)' },
  pixelate: {
    bgClass: 'bg-purple-500 bg-opacity-80',
    textClass: 'text-white',
    filterCss: 'contrast(200%) saturate(200%)',
  },
  invert: { bgClass: 'bg-black bg-opacity-80', textClass: 'text-white', filterCss: 'invert(100%)' },
  cartoon: {
    bgClass: 'bg-orange-400 bg-opacity-80',
    textClass: 'text-white',
    filterCss: 'contrast(150%) saturate(150%)',
  },
  pencil: {
    bgClass: 'bg-gray-200 bg-opacity-80',
    textClass: 'text-black',
    filterCss: 'grayscale(100%) brightness(1.2)',
  },
  thermal: {
    bgClass: 'bg-red-500 bg-opacity-80',
    textClass: 'text-white',
    filterCss: 'hue-rotate(90deg) saturate(200%)',
  },
};
