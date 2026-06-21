import { Assets, Texture } from 'pixi.js';
import assetsConfig from '../../config/assetsConfig.json';

type ProgressCallback = (progress: number) => void;

export class AssetsManager {
    private static _loaded = false;

    private constructor() {}

    static get isLoaded(): boolean {
        return AssetsManager._loaded;
    }

    static async load(onProgress?: ProgressCallback): Promise<void> {
        if (AssetsManager._loaded) return;
        await Assets.load(
            assetsConfig.assets.map(({ name, src }) => ({ alias: name, src })),
            progress => onProgress?.(progress),
        );
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
