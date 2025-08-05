import { FilterOption } from "../types/filter";

export const Filters: Array<FilterOption> = [
    {
        type: 'gray',
        title: 'Grayscale',
        subtitle: 'Converts the background to shades of gray for a classic look',
    },
    {
        type: 'sepia',
        title: 'Sepia',
        subtitle: 'Applies a warm, vintage brown tone to the background',
    },
    {
        type: 'blur',
        title: 'Blur',
        subtitle: 'Softens the background with a smooth Gaussian blur',
    },
    {
        type: 'pixelate',
        title: 'Pixelate',
        subtitle: 'Transforms the background into blocky pixel art',
    },
    {
        type: 'invert',
        title: 'Invert Colors',
        subtitle: 'Flips background colors to their opposites for a surreal effect',
    },
    {
        type: 'cartoon',
        title: 'Cartoon',
        subtitle: 'Renders the background with bold edges and flat colors',
    },
    {
        type: 'pencil',
        title: 'Pencil Sketch',
        subtitle: 'Converts the background into a hand-drawn pencil sketch',
    },
    {
        type: 'thermal',
        title: 'Thermal',
        subtitle: 'Applies a false-color heat map to the background',
    },
];
