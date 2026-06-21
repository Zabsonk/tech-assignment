import { Assets, Texture } from 'pixi.js';
import background from '../../img/background.jpg';

type ProgressCallback = (progress: number) => void;

const pngs = import.meta.glob('../../img/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>;

const MANIFEST = [
    { alias: 'background', src: background as string },
    ...Object.entries(pngs).map(([path, src]) => ({
        alias: path.replace(/^.*\//, '').replace(/\.[^.]+$/, ''),
        src,
    })),
];

export class AssetsManager {
    private static _loaded = false;

    private constructor() {}

    static get isLoaded(): boolean {
        return AssetsManager._loaded;
    }

    static async load(onProgress?: ProgressCallback): Promise<void> {
        if (AssetsManager._loaded) return;
        await Assets.load(MANIFEST, progress => onProgress?.(progress));
        AssetsManager._loaded = true;
    }

    static get(alias: string): Texture {
        const texture = Assets.get<Texture>(alias);
        if (!texture) {
            throw new Error(`[AssetsManager] Asset "${alias}" not found. Call load() first.`);
        }
        return texture;
    }
}
