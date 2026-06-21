import { CanvasTextOptions, Container, Text, Ticker } from 'pixi.js';
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
        this._grid.spin();
        this._spinButton.disabled = true;

        this._totalWin.visible = false;
        this._totalWin.text = 0;
    }

    private _onSpinButtonClicked(): void {
        this.emit(SpinButtonClicked);
    }
}
