import { GameResult, SymbolPositionAndType } from './GameResult';
import { Response, WaysWin } from './GameService';
import { Symbols } from './Symbols';

enum InputSymbols {
    L4 = 1,
    L3 = 2,
    L2 = 3,
    L1 = 4,
    H3 = 5,
    H2 = 6,
    H1 = 7,
}

const INPUT_TO_SYMBOL: Record<InputSymbols, Symbols> = {
    [InputSymbols.L4]: Symbols.Low4,
    [InputSymbols.L3]: Symbols.Low3,
    [InputSymbols.L2]: Symbols.Low2,
    [InputSymbols.L1]: Symbols.Low1,
    [InputSymbols.H3]: Symbols.High3,
    [InputSymbols.H2]: Symbols.High2,
    [InputSymbols.H1]: Symbols.High1,
};

export default class ResponseParser {
    public parse(response: Response): GameResult {
        const stopData = response.grid.map(col =>
            col.map(num => INPUT_TO_SYMBOL[num as InputSymbols]),
        );

        const winsPositions: SymbolPositionAndType[] = response.waysWins
            ? this._getWinsPositions(response.waysWins)
            : [];

        return {
            win: response.win,
            stopData,
            winsPositions: winsPositions.length ? winsPositions : undefined,
        };
    }

    private _getWinsPositions(waysWins: WaysWin[]): SymbolPositionAndType[] {
        const result: SymbolPositionAndType[] = [];
        for (const wayWin of waysWins) {
            for (const position of wayWin.positions) {
                result.push({
                    ...position,
                    symbol: INPUT_TO_SYMBOL[wayWin.symbol as InputSymbols],
                });
            }
        }

        return result;
    }
}
