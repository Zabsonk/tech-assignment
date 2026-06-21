import { Container } from 'pixi.js';
import { Outcome } from './Outcome';
import { Reel, SYMBOL_W, SYMBOL_H } from './Reel';

const REEL_COUNT = 5;
const VISIBLE_ROWS = 3;

// Horizontal gap between reel columns (pixels)
const REEL_GAP = 12;

// Padding inside the reels_base frame
const OFFSET_X = 30;
const OFFSET_Y = 28;

// Frames after spin start before each reel begins to stop (left to right)
const STOP_DELAYS = [55, 80, 105, 130, 155];

interface WinResult {
    symbol: string;
    reelCount: number;
    ways: number;
    cells: [number, number][];
}

/**
 * Ways-to-win: for each symbol, count consecutive reels (left→right) that
 * contain at least one of that symbol. Ways = product of per-reel counts.
 * Minimum 3 reels required for a win.
 */
function checkWins(columns: string[][]): WinResult[] {
    const results: WinResult[] = [];

    for (const symbol of ['high1', 'high2', 'high3', 'low1', 'low2', 'low3', 'low4']) {
        const counts: number[] = [];

        for (let reel = 0; reel < REEL_COUNT; reel++) {
            const count = columns[reel].filter(s => s === symbol).length;
            if (count === 0) break;
            counts.push(count);
        }

        if (counts.length < 3) continue;

        const ways = counts.reduce((acc, c) => acc * c, 1);
        const cells: [number, number][] = [];

        for (let reel = 0; reel < counts.length; reel++) {
            for (let row = 0; row < VISIBLE_ROWS; row++) {
                if (columns[reel][row] === symbol) cells.push([reel, row]);
            }
        }

        results.push({ symbol, reelCount: counts.length, ways, cells });
    }

    return results;
}

type MachineState = 'idle' | 'spinning';

export class Machine extends Container {
    private readonly _reels: Reel[] = [];
    private _state: MachineState = 'idle';
    private _spinTime = 0;
    private _reelStopSent: boolean[] = Array(REEL_COUNT).fill(false);
    private _stoppedCount = 0;
    private _outcome: string[][] = [];

    // Winning cells for pulse animation
    private _winCells: [number, number][] = [];
    private _winTimer = 0;

    /** Called when all reels have settled and win animations begin. */
    onSpinComplete?: () => void;

    constructor() {
        super();

        for (let i = 0; i < REEL_COUNT; i++) {
            const reel = new Reel();
            reel.x = OFFSET_X + i * (SYMBOL_W + REEL_GAP);
            reel.y = OFFSET_Y;
            this.addChild(reel);
            this._reels.push(reel);
        }
    }

    startSpin(): void {
        if (this._state !== 'idle') return;

        this._state = 'spinning';
        this._spinTime = 0;
        this._stoppedCount = 0;
        this._reelStopSent = Array(REEL_COUNT).fill(false);
        this._outcome = Outcome.resolve();

        // Clear previous win animation
        this._clearWinHighlight();
        this._winCells = [];

        for (const reel of this._reels) reel.startSpin();
    }

    update(dt: number): void {
        if (this._state === 'spinning') {
            this._spinTime += dt;

            for (let i = 0; i < REEL_COUNT; i++) {
                if (!this._reelStopSent[i] && this._spinTime >= STOP_DELAYS[i]) {
                    this._reelStopSent[i] = true;
                    this._reels[i].stopAt(this._outcome[i], () => this._onReelStopped());
                }
            }
        }

        for (const reel of this._reels) reel.update(dt);

        // Pulse animation for winning symbols
        if (this._winCells.length > 0) {
            this._winTimer += dt;
            const scale = 1 + 0.12 * Math.abs(Math.sin(this._winTimer * 0.12));
            for (const [reel, row] of this._winCells) {
                this._reels[reel].getSprite(row).scale.set(scale);
            }
        }
    }

    private _onReelStopped(): void {
        this._stoppedCount++;
        if (this._stoppedCount < REEL_COUNT) return;

        this._state = 'idle';

        const wins = checkWins(this._outcome);
        if (wins.length > 0) {
            this._winCells = wins.flatMap(w => w.cells);
            this._winTimer = 0;
        }

        this.onSpinComplete?.();
    }

    private _clearWinHighlight(): void {
        for (const [reel, row] of this._winCells) {
            this._reels[reel].getSprite(row).scale.set(1);
        }
    }

    /** Returns the height of the visible reel grid. */
    get reelGridHeight(): number {
        return OFFSET_Y + SYMBOL_H * VISIBLE_ROWS;
    }
}
