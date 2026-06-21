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

export default class DummyGameService implements IService<GameResult> {
    public responseParser: ResponseParser = new ResponseParser();

    public initGame(): void {}

    public fetchResult(): Promise<GameResult> {
        const index = Math.floor(Math.random() * this.forcedResponses.length);
        const result = this.responseParser.parse(this.forcedResponses[index]);
        return Promise.resolve(result);
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
                        { x: 1, y: 2 },
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
                        { x: 1, y: 2 },
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
