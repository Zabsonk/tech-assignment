import background from './background.jpg';

const pngs = import.meta.glob('./*.png', { eager: true, import: 'default' });

export const urls = Object.freeze([
    { alias: 'background', src: background },
    ...Object.entries(pngs).map(([path, src]) => ({
        alias: path.replace(/^\.\//, '').replace(/\.[^.]+$/, ''),
        src,
    })),
]);
