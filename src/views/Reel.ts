import { Container, Ticker } from 'pixi.js';
import { Symbols } from '../service/GameService';
import SymbolsPool from '../SymbolsPool';
import GridSymbol from './GridSymbol';

const SPIN_SPEED = 30;
const DECEL_TICKS = 30;

export interface ReelConfig {
    pool: SymbolsPool;
    definition: Symbols[];
    rows: number;
    symbolHeight: number;
    symbolWidht: number;
    padding: number;
    ticker: Ticker;
}

export default class Reel extends Container {
    private _strip: Container;
    private _slots: Array<{ symbol: GridSymbol; type: Symbols }> = [];

    private _pool: SymbolsPool;
    private _definition: Symbols[];
    private _defIndex = 0;
    private _rows: number;
    private _symbolHeight: number;
    private _symbolWidth: number;

    private _ticker: Ticker;
    private _scrollY = 0;
    private _spinning = false;
    private _stopping = false;
    private _stopTimer = 0;
    private _stopTarget: Symbols[] = [];
    private _stopResolve?: () => void;

    constructor(config: ReelConfig) {
        super();
        const { pool, definition, rows, symbolHeight, symbolWidht, padding, ticker } = config;
        this._ticker = ticker;
        this._pool = pool;
        this._definition = definition;
        this._rows = rows;
        this._symbolHeight = symbolHeight;
        this._symbolWidth = symbolWidht;

        this._strip = new Container();
        this.addChild(this._strip);

        // rows + 2: 1 hidden above, rows visible, 1 hidden below
        for (let i = 0; i < this._rows + padding; i++) {
            const type = this._nextType();
            const symbol = this._pool.getSymbol(type);
            symbol.symbolId = type;
            symbol.y = (i - 1) * this._symbolHeight;
            this._strip.addChild(symbol);
            this._slots.push({ symbol, type });
        }
    }

    private _nextType(): Symbols {
        const type = this._definition[this._defIndex % this._definition.length];
        this._defIndex++;
        return type;
    }

    public spin(): void {
        this._spinning = true;
        this._stopping = false;
        this._scrollY = 0;
        this._ticker.add(this._update, this);
    }

    public stop(symbols: Symbols[]): Promise<void> {
        this._stopTarget = symbols;
        this._stopping = true;
        this._stopTimer = 0;
        return new Promise(resolve => {
            this._stopResolve = resolve;
        });
    }

    private _update(ticker: Ticker): void {
        if (!this._spinning) return;

        const dt = ticker.deltaTime;
        let speed = SPIN_SPEED * dt;

        if (this._stopping) {
            this._stopTimer += dt;
            const t = Math.min(this._stopTimer / DECEL_TICKS, 1);
            speed *= 1 - t * t;

            if (t >= 1) {
                this._snap();
                return;
            }
        }

        this._scroll(speed);
    }

    private _scroll(px: number): void {
        this._scrollY += px;

        while (this._scrollY >= this._symbolHeight) {
            this._scrollY -= this._symbolHeight;
            this._advance();
        }

        for (let i = 0; i < this._slots.length; i++) {
            this._slots[i].symbol.y = (i - 1) * this._symbolHeight + this._scrollY;
        }
    }

    private _advance(): void {
        const last = this._slots.pop()!;
        this._pool.returnSymbol(last.type, last.symbol);
        this._strip.removeChild(last.symbol);

        const type = this._nextType();
        const symbol = this._pool.getSymbol(type);
        symbol.symbolId = type;
        this._strip.addChildAt(symbol, 0);
        this._slots.unshift({ symbol, type });
    }

    private _snap(): void {
        this._spinning = false;
        this._stopping = false;

        for (const { symbol, type } of this._slots) {
            this._pool.returnSymbol(type, symbol);
            this._strip.removeChild(symbol);
        }
        this._slots = [];

        const aboveType = this._nextType();
        const above = this._pool.getSymbol(aboveType);
        above.symbolId = aboveType;
        above.y = -this._symbolHeight;
        this._strip.addChild(above);
        this._slots.push({ symbol: above, type: aboveType });

        for (let i = 0; i < this._rows; i++) {
            const type = this._stopTarget[i];
            const symbol = this._pool.getSymbol(type);
            symbol.symbolId = type;
            symbol.y = i * this._symbolHeight;
            this._strip.addChild(symbol);
            this._slots.push({ symbol, type });
        }

        const belowType = this._nextType();
        const below = this._pool.getSymbol(belowType);
        below.symbolId = belowType;
        below.y = this._rows * this._symbolHeight;
        this._strip.addChild(below);
        this._slots.push({ symbol: below, type: belowType });

        this._scrollY = 0;
        this._ticker.remove(this._update, this);
        this._stopResolve?.();
        this._stopResolve = undefined;
    }
}
