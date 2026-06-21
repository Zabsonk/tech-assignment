import { gsap } from 'gsap';
import { Container, Graphics, Ticker } from 'pixi.js';
import { SymbolPositionAndType } from '../service/GameResult';
import { Symbols } from '../service/GameService';
import ReelModel from '../model/ReelModel';
import SymbolsPool from '../SymbolsPool';
import GridSymbol from './GridSymbol';
import Reel from './Reel';

export interface GridConfig {
    reelModel: ReelModel;
    pool: SymbolsPool;
    ticker: Ticker;
}

interface DetachedEntry {
    col: number;
    row: number;
    symbol: GridSymbol;
}

export default class Grid extends Container {
    private _reels: Reel[] = [];
    private _reelModel: ReelModel;

    private _overlay: Graphics;
    private _winLayer: Container;
    private _spinLayer: Container;

    private _detached: DetachedEntry[] = [];

    constructor(config: GridConfig) {
        super();
        const { reelModel, pool, ticker } = config;
        this._reelModel = reelModel;

        const { symbolHeight, symbolWidth, rows, columns, padding, minSpinTime } = reelModel;

        this._spinLayer = new Container();
        this.addChild(this._spinLayer);

        const mask = new Graphics();
        mask.rect(0, 0, symbolWidth * columns, symbolHeight * rows);
        mask.fill(0xffffff);
        this.addChild(mask);
        this._spinLayer.mask = mask;

        for (let col = 0; col < columns; col++) {
            const reel = new Reel({
                pool: pool,
                definition: reelModel.reelDefinitions[col],
                rows: rows,
                symbolHeight: symbolHeight,
                symbolWidht: symbolWidth,
                padding: padding,
                ticker: ticker,
                minSpinTime: minSpinTime,
            });
            reel.x = col * symbolWidth;
            this._spinLayer.addChild(reel);
            this._reels.push(reel);
        }

        this._overlay = new Graphics();
        this._overlay.rect(0, 0, symbolWidth * columns, symbolHeight * rows);
        this._overlay.fill({ color: 0x000000, alpha: 0.65 });
        this._overlay.alpha = 0;
        this._overlay.visible = false;
        this.addChild(this._overlay);

        this._winLayer = new Container();
        this.addChild(this._winLayer);
    }

    public spin(): void {
        this._reels.forEach(reel => reel.spin());
    }

    public stop(symbols: Symbols[][]): Promise<void> {
        return Promise.all(this._reels.map((reel, i) => reel.stop(symbols[i]))).then(() => {});
    }

    public async showWinAnimation(positions: SymbolPositionAndType[]): Promise<void> {
        const { symbolWidth, symbolHeight } = this._reelModel;
        const pivotX = symbolWidth / 2;
        const pivotY = symbolHeight / 2;

        this._overlay.visible = true;
        gsap.to(this._overlay, { alpha: 1, duration: 0.3 });

        const promises = positions.map(({ x: col, y: row }) => {
            const symbol = this._reels[col].detachSymbolAt(row);

            symbol.x = col * symbolWidth + pivotX;
            symbol.y = row * symbolHeight + pivotY;
            this._winLayer.addChild(symbol);
            this._detached.push({ col, row, symbol });

            return new Promise<void>(resolve => {
                gsap.to(symbol.scale, {
                    x: 1.25,
                    y: 1.25,
                    duration: 0.6,
                    ease: 'back.out(2)',
                    onComplete: () => {
                        gsap.to(symbol.scale, {
                            x: 1,
                            y: 1,
                            duration: 0.45,
                            ease: 'sine.inOut',
                            yoyo: true,
                            repeat: 2,
                            onComplete: resolve,
                        });
                    },
                });
            });
        });

        await Promise.all(promises);
    }

    public hideWinAnimation(): void {
        gsap.killTweensOf(this._overlay);
        this._overlay.alpha = 0;
        this._overlay.visible = false;

        for (const { col, row, symbol } of this._detached) {
            gsap.killTweensOf(symbol.scale);
            this._winLayer.removeChild(symbol);
            this._reels[col].attachSymbolAt(row, symbol);
        }
        this._detached = [];
    }
}
