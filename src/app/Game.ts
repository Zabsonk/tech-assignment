import { Sprite } from 'pixi.js';
import { AssetsManager } from '../service/AssetsManager';
import { SceneBuilder } from '../scene/SceneBuilder';
import MainScene from '../MainScene';
import GameApplication, { type GameApplicationConfig } from './GameApplication';
import SlotMachine from '../SlotMachine';

export default class Game extends GameApplication {
    private slotMachine: SlotMachine = new SlotMachine();

    constructor(config: Partial<GameApplicationConfig>) {
        super(config);
    }

    public override async init(): Promise<void> {
        await super.init();

        await AssetsManager.load();

        await SceneBuilder.init();

        const scene = new MainScene();
        this.mainScreen.stage.addChild(scene);
    }
}
