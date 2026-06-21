import { Container } from 'pixi.js';
import { AssetsManager } from './service/AssetsManager';
import { SceneBuilder } from './scene/SceneBuilder';

export default class MainScene extends Container {
    constructor() {
        super();

        const background = SceneBuilder.build('background', this)!;

        SceneBuilder.build('reelsBackground', this);
    }
    update(_dt: number): void {}
}
