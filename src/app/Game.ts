import { AssetsManager } from '../service/AssetsManager';
import { SceneBuilder } from '../service/scene/SceneBuilder';
import MainScene, { SpinButtonClicked } from '../MainScene';
import GameApplication, { type GameApplicationConfig } from './GameApplication';
import SlotMachine, { StateChanged } from '../SlotMachine';
import ReelModel from '../model/ReelModel';
import SymbolsFactory from '../factories/SymbolsFactory';
import { State } from '../States';

export default class Game extends GameApplication {
    private _slotMachine: SlotMachine = new SlotMachine();
    private _mainScene: MainScene;

    constructor(config: Partial<GameApplicationConfig>) {
        super(config);
    }

    public override async init(): Promise<void> {
        await super.init();

        await AssetsManager.load();

        await SceneBuilder.init();

        this._slotMachine.on(StateChanged, this._onStateChanged, this);

        const reelModel = new ReelModel();
        const symbolsPool = new SymbolsFactory(reelModel).buildPool();

        const scene = new MainScene({
            pool: symbolsPool,
            reelModel,
            ticker: this.mainScreen.ticker,
        });

        scene.on(SpinButtonClicked, this._onSpinButtonClicked, this);
        this._mainScene = scene;

        this.mainScreen.stage.addChild(scene);

        this._slotMachine.currentState = State.Idle;
    }

    private _onSpinButtonClicked(): void {
        if (this._slotMachine.currentState !== State.Idle) return;
        this._slotMachine.currentState = State.Spin_Start;
    }

    private _onStateChanged(state: State): void {
        switch (state) {
            case State.Spin_Start:
                this._mainScene.spinStart();
                break;
        }
    }
}
