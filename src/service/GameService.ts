import { GameResult } from './GameResult';
import { IService } from './IService';
import ResponseParser from './ResponseParser';

export { Symbols } from './Symbols';

export interface GridPosition {
    x: number;
    y: number;
}

export type Grid = number[][];

export interface WaysWin {
    count: number;
    positions: GridPosition[];
    winValue: number;
    symbol: number;
}

export interface Response {
    grid: Grid;
    win?: number;
    waysWins: WaysWin[];
}

export type GameMode = 'forced1' | 'forced2' | 'random';

export default class DummyGameService implements IService<GameResult> {
    public responseParser: ResponseParser = new ResponseParser();
    private _mode: GameMode = 'forced1';

    public setMode(mode: GameMode): void {
        this._mode = mode;
    }

    public initGame(): void {}

    public fetchResult(): Promise<GameResult> {
        if (this._mode === 'random') {
            return Promise.resolve(this.responseParser.parse(this._randomResponse()));
        }
        const index = this._mode === 'forced1' ? 0 : 1;
        return Promise.resolve(this.responseParser.parse(this.forcedResponses[index]));
    }

    private _randomResponse(): Response {
        const grid: Grid = Array.from({ length: 5 }, () =>
            Array.from({ length: 3 }, () => Math.ceil(Math.random() * 7)),
        );
        const waysWins = this._detectWaysWins(grid);
        const totalWin = waysWins.reduce((sum, w) => sum + w.winValue, 0);
        return { grid, waysWins, win: totalWin || undefined };
    }

    private _detectWaysWins(grid: Grid): WaysWin[] {
        const result: WaysWin[] = [];

        for (let sym = 1; sym <= 7; sym++) {
            const positions: GridPosition[] = [];

            for (let col = 0; col < grid.length; col++) {
                const inCol = grid[col]
                    .map((val, row) => (val === sym ? { x: col, y: row } : null))
                    .filter((p): p is GridPosition => p !== null);

                if (inCol.length === 0) break;
                positions.push(...inCol);
            }

            const colSpan = positions.length > 0 ? Math.max(...positions.map(p => p.x)) + 1 : 0;

            if (colSpan >= 3) {
                result.push({
                    symbol: sym,
                    count: positions.length,
                    winValue: this._calcWinValue(sym, colSpan),
                    positions,
                });
            }
        }

        return result;
    }

    private _calcWinValue(sym: number, cols: number): number {
        const base: Record<number, number> = { 1: 5, 2: 8, 3: 10, 4: 15, 5: 25, 6: 40, 7: 60 };
        const colMultiplier: Record<number, number> = { 3: 1, 4: 3, 5: 10 };
        return (base[sym] ?? 5) * (colMultiplier[cols] ?? 1);
    }

    private forcedResponses: Response[] = [
        {
            grid: [
                [1, 7, 3],
                [7, 7, 3],
                [1, 1, 7],
                [1, 1, 3],
                [3, 1, 1],
            ],
            win: 100,
            waysWins: [
                {
                    count: 4,
                    winValue: 100,
                    symbol: 7,
                    positions: [
                        { x: 0, y: 1 },
                        { x: 1, y: 1 },
                        { x: 1, y: 0 },
                        { x: 2, y: 2 },
                    ],
                },
            ],
        },
        {
            grid: [
                [1, 7, 3],
                [7, 7, 3],
                [1, 3, 7],
                [1, 1, 3],
                [3, 1, 1],
            ],
            win: 200,
            waysWins: [
                {
                    count: 4,
                    winValue: 100,
                    symbol: 7,
                    positions: [
                        { x: 0, y: 1 },
                        { x: 1, y: 1 },
                        { x: 1, y: 0 },
                        { x: 2, y: 2 },
                    ],
                },
                {
                    count: 5,
                    winValue: 100,
                    symbol: 5,
                    positions: [
                        { x: 0, y: 2 },
                        { x: 1, y: 2 },
                        { x: 2, y: 1 },
                        { x: 3, y: 2 },
                        { x: 4, y: 0 },
                    ],
                },
            ],
        },
    ];
}
