import { FilterType } from "../types/filter";

export const getPreviewStyle = (filterType: FilterType) => {
    const base: React.CSSProperties = {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      borderRadius: 'inherit',
      backgroundColor: '#e2e8f0',
    };

    switch (filterType) {
      case 'gray':
        return { ...base, filter: 'grayscale(100%)' };
      case 'sepia':
        return { ...base, filter: 'sepia(100%)' };
      case 'blur':
        return { ...base, filter: 'blur(3px)' };
      case 'pixelate':
        return {
          ...base,
          backgroundImage:
            'repeating-linear-gradient(0deg, #cbd5e1, #cbd5e1 8px, transparent 8px, transparent 16px), ' +
            'repeating-linear-gradient(90deg, #cbd5e1, #cbd5e1 8px, transparent 8px, transparent 16px)',
          backgroundSize: '16px 16px',
        };
      case 'invert':
        return { ...base, filter: 'invert(100%)' };
      case 'cartoon':
        return { ...base, filter: 'contrast(150%) saturate(150%)' };
      case 'pencil':
        return { ...base, filter: 'contrast(200%) brightness(150%) grayscale(50%)' };
      case 'thermal':
        return { ...base, filter: 'hue-rotate(180deg) saturate(200%)' };
      default:
        return base;
    }
};