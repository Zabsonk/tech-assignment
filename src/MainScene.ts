import { gsap } from 'gsap';
import { CanvasTextOptions, Container, Text, Ticker } from 'pixi.js';
import { SymbolPositionAndType } from './service/GameResult';
import { Symbols } from './service/GameService';
import { SceneBuilder } from './service/scene/SceneBuilder';
import Button, { ButtonClicked, ButtonConfig } from './views/Button';
import Grid from './views/Grid';
import SymbolsPool from './SymbolsPool';
import ReelModel from './model/ReelModel';

export const SpinButtonClicked = 'onSpinButtonClicked';

export interface MainSceneConfig {
    reelModel: ReelModel;
    pool: SymbolsPool;
    ticker: Ticker;
}

export default class MainScene extends Container {
    private _spinButton: Button;
    private _grid: Grid;
    private _totalWin: Text;

    constructor(config: MainSceneConfig) {
        super();
        const { reelModel, pool, ticker } = config;
        SceneBuilder.build('background', this);

        SceneBuilder.build('reelsBackground', this);

        const totalWin: Text = SceneBuilder.build<Text, CanvasTextOptions>('totalWin', this, Text, {
            style: { fontSize: 50, stroke: { color: '#160a18', width: 5 } },
        });
        this._totalWin = totalWin;

        this._grid = SceneBuilder.build('grid', this, Grid, {
            reelModel,
            pool,
            ticker,
        })!;

        const spinButton: Button = SceneBuilder.build<Button, ButtonConfig>(
            'spinButton',
            this,
            Button,
            {
                disabledTextureName: 'spin_btn_disabled',
                downTextureName: 'spin_btn_down',
                hoverTextureName: 'spin_btn_hover',
                normalTextureName: 'spin_btn_normal',
                overTextureName: 'spin_btn_over',
            },
        );
        this._spinButton = spinButton;

        spinButton.on(ButtonClicked, this._onSpinButtonClicked, this);
    }

    public spinStart(): void {
        this._grid.hideWinAnimation();
        this._grid.spin();
        this._spinButton.disabled = true;

        this._totalWin.visible = false;
        this._totalWin.text = 0;
    }

    public spinStop(symbols: Symbols[][]): Promise<void> {
        return this._grid.stop(symbols);
    }

    public enableSpin(): void {
        this._spinButton.disabled = false;
    }

    public async showWin(amount: number, winsPositions: SymbolPositionAndType[]): Promise<void> {
        this._totalWin.text = amount;
        this._totalWin.visible = true;
        this._totalWin.scale.set(0);

        await Promise.all([
            this._grid.showWinAnimation(winsPositions),
            gsap.to(this._totalWin.scale, { x: 1, y: 1, duration: 0.6, ease: 'back.out(2)' }),
        ]);
    }

    private _onSpinButtonClicked(): void {
        this.emit(SpinButtonClicked);
    }
}
