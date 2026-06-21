import { Container, Sprite } from 'pixi.js';
import { AssetsManager } from '../service/AssetsManager';

export interface SymbolConfig {
    textureName: string;
}

export default class GridSymbol extends Container {
    protected _sprite: Sprite;

    public symbolId!: string;

    constructor(config: SymbolConfig) {
        super();
        const { textureName } = config;

        this._sprite = new Sprite(AssetsManager.get(textureName));
        this.addChild(this._sprite);
        this.pivot.set(this._sprite.width / 2, this._sprite.height / 2);
    }

    public reset(): void {}
}
