import { Container } from 'pixi.js';
import { SceneBuilder } from './scene/SceneBuilder';

export default class MainScene extends Container {
    constructor() {
        super();

        SceneBuilder.build('background', this);

        SceneBuilder.build('reelsBackground', this);
    }
    update(_dt: number): void {}
}
