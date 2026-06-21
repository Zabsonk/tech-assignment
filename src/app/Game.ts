import { AssetsManager } from '../service/AssetsManager';
import { SceneBuilder } from '../service/scene/SceneBuilder';
import MainScene, { SpinButtonClicked } from '../MainScene';
import GameApplication, { type GameApplicationConfig } from './GameApplication';
import SlotMachine, { StateChanged } from '../SlotMachine';
import ReelModel from '../model/ReelModel';
import SymbolsFactory from '../factories/SymbolsFactory';
import DummyGameService from '../service/GameService';
import { State } from '../States';

export default class Game extends GameApplication {
    private _slotMachine: SlotMachine = new SlotMachine();
    private _gameService = new DummyGameService();
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

    private async _onStateChanged(state: State): Promise<void> {
        switch (state) {
            case State.Spin_Start:
                this._mainScene.spinStart();
                this._slotMachine.gameResult = null;
                this._getGameResult();
                break;
            case State.Spin_Stop:
                this._mainScene.spinStop(this._slotMachine.gameResult!.stopData).then(() => {
                    this.onReelsStoped();
                });
                break;
            case State.Win:
                this._mainScene
                    .showWin(
                        this._slotMachine.gameResult!.win!,
                        this._slotMachine.gameResult!.winsPositions!,
                    )
                    .then(() => {
                        this._onWinShowed();
                    });
                break;
            case State.Idle:
                this._mainScene.enableSpin();
                break;
        }
    }

    private async _getGameResult(): Promise<void> {
        const result = await this._gameService.fetchResult();
        this._slotMachine.gameResult = result;
        this._slotMachine.currentState = State.Spin_Stop;
    }

    private onReelsStoped(): void {
        const result = this._slotMachine.gameResult!;
        const { win, winsPositions } = result;

        if (win && winsPositions?.length) {
            this._slotMachine.currentState = State.Win;
        } else {
            this._slotMachine.currentState = State.Idle;
        }
    }

    private _onWinShowed(): void {
        this._slotMachine.currentState = State.Idle;
    }
}
