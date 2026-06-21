import { Container, Ticker } from 'pixi.js';
import { Symbols } from '../service/GameService';
import SymbolsPool from '../SymbolsPool';
import GridSymbol from './GridSymbol';

const SPIN_SPEED = 30;
const MINIMUM_SPIN_TIME = 2000; // ms — reel spins at least this long before stopping

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
    private _stopResolve?: () => void;

    private _spinStartTime = 0;
    private _pendingStopSymbols: Symbols[] | null = null;

    private _stopQueue: Symbols[] = [];
    private _stopQueueIdx = 0;
    private _stopAdvances = 0;
    private _decelTicks = 0;
    private _stopTimer = 0;

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

        for (let i = 0; i < this._rows + padding; i++) {
            const type = this._nextType();
            const symbol = this._pool.getSymbol(type);
            symbol.symbolId = type;
            symbol.x = this._symbolWidth / 2;
            symbol.y = (i - 1) * this._symbolHeight + this._symbolHeight / 2;
            this._strip.addChild(symbol);
            this._slots.push({ symbol, type });
        }
    }

    private _nextType(): Symbols {
        if (this._stopping && this._stopQueueIdx < this._stopQueue.length) {
            return this._stopQueue[this._stopQueueIdx++];
        }
        const type = this._definition[this._defIndex % this._definition.length];
        this._defIndex++;
        return type;
    }

    public detachSymbolAt(row: number): GridSymbol {
        const symbol = this._slots[row + 1].symbol;
        this._strip.removeChild(symbol);
        return symbol;
    }

    public attachSymbolAt(row: number, symbol: GridSymbol): void {
        this._slots[row + 1].symbol = symbol;
        symbol.x = this._symbolWidth / 2;
        symbol.y = row * this._symbolHeight + this._symbolHeight / 2;
        symbol.scale.set(1);
        symbol.alpha = 1;
        this._strip.addChild(symbol);
    }

    public spin(): void {
        this._spinning = true;
        this._stopping = false;
        this._scrollY = 0;
        this._stopQueue = [];
        this._stopQueueIdx = 0;
        this._pendingStopSymbols = null;
        this._spinStartTime = Date.now();
        this._ticker.add(this._update, this);
    }

    public stop(symbols: Symbols[]): Promise<void> {
        return new Promise(resolve => {
            this._stopResolve = resolve;
            this._pendingStopSymbols = symbols;
        });
    }

    private _startDecel(symbols: Symbols[]): void {
        // Reversed so that after rows+1 advances they land: S1@row0, S2@row1, ...
        this._stopQueue = [...symbols].reverse();
        this._stopQueueIdx = 0;
        this._stopAdvances = 0;
        this._stopping = true;
        this._stopTimer = 0;
        // Distance to scroll so scrollY=0 after exactly rows+1 advances
        const stopDistance = (this._rows + 1) * this._symbolHeight - this._scrollY;
        // With sqrt easing: total_distance = (2/3) * SPIN_SPEED * decelTicks
        this._decelTicks = (3 * stopDistance) / (2 * SPIN_SPEED);
    }

    private _update(ticker: Ticker): void {
        if (!this._spinning) return;

        const dt = ticker.deltaTime;

        if (!this._stopping && this._pendingStopSymbols) {
            if (Date.now() - this._spinStartTime >= MINIMUM_SPIN_TIME) {
                this._startDecel(this._pendingStopSymbols);
                this._pendingStopSymbols = null;
            }
        }

        if (this._stopping) {
            this._stopTimer += dt;
            const t = Math.min(this._stopTimer / this._decelTicks, 1);
            const speed = SPIN_SPEED * Math.sqrt(Math.max(0, 1 - t)) * dt;

            if (t >= 1) {
                this._snap();
                return;
            }

            this._scroll(speed);
        } else {
            this._scroll(SPIN_SPEED * dt);
        }
    }

    private _scroll(px: number): void {
        this._scrollY += px;

        while (this._scrollY >= this._symbolHeight) {
            this._scrollY -= this._symbolHeight;
            this._advance();
        }

        for (let i = 0; i < this._slots.length; i++) {
            this._slots[i].symbol.y =
                (i - 1) * this._symbolHeight + this._scrollY + this._symbolHeight / 2;
        }
    }

    private _advance(): void {
        const last = this._slots.pop()!;
        this._pool.returnSymbol(last.type, last.symbol);
        this._strip.removeChild(last.symbol);

        const type = this._nextType();
        const symbol = this._pool.getSymbol(type);
        symbol.symbolId = type;
        symbol.x = this._symbolWidth / 2;
        this._strip.addChildAt(symbol, 0);
        this._slots.unshift({ symbol, type });

        if (this._stopping) {
            this._stopAdvances++;
        }
    }

    private _snap(): void {
        // Natural decel may fall just short of the final advance — complete it if needed
        while (this._stopAdvances < this._rows + 1) {
            this._advance();
        }

        this._spinning = false;
        this._stopping = false;
        this._scrollY = 0;
        this._stopQueue = [];
        this._stopQueueIdx = 0;

        for (let i = 0; i < this._slots.length; i++) {
            this._slots[i].symbol.x = this._symbolWidth / 2;
            this._slots[i].symbol.y = (i - 1) * this._symbolHeight + this._symbolHeight / 2;
        }

        this._ticker.remove(this._update, this);
        this._stopResolve?.();
        this._stopResolve = undefined;
    }
}
