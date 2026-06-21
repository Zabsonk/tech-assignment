import { Container, Graphics, Ticker } from 'pixi.js';
import ReelModel from '../model/ReelModel';
import SymbolsPool from '../SymbolsPool';
import { Symbols } from '../service/GameService';
import Reel from './Reel';

export interface GridConfig {
    reelModel: ReelModel;
    pool: SymbolsPool;
    ticker: Ticker;
}

export default class Grid extends Container {
    private _reels: Reel[] = [];

    constructor(config: GridConfig) {
        super();
        const { reelModel, pool, ticker } = config;

        const { symbolHeight, symbolWidth, rows, columns, padding } = reelModel;

        const mask = new Graphics();
        mask.rect(0, 0, symbolWidth * columns, symbolHeight * rows);
        mask.fill(0xffffff);
        this.addChild(mask);
        this.mask = mask;

        for (let col = 0; col < reelModel.columns; col++) {
            const reel = new Reel({
                pool,
                definition: reelModel.reelDefinitions[col],
                rows: reelModel.rows,
                symbolHeight: symbolHeight,
                symbolWidht: symbolWidth,
                padding: padding,
                ticker,
            });
            reel.x = col * reelModel.symbolWidth;
            this.addChild(reel);
            this._reels.push(reel);
        }
    }

    public spin(): void {
        this._reels.forEach(reel => reel.spin());
    }

    public stop(symbols: Symbols[][]): Promise<void> {
        return Promise.all(this._reels.map((reel, i) => reel.stop(symbols[i]))).then(() => {});
    }

    // public update(dt: number): void {
    //     this._reels.forEach(reel => reel.update(dt));
    // }
}
