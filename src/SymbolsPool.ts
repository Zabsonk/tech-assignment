import { Symbols } from './service/GameService';
import GridSymbol from './views/GridSymbol';

export default class SymbolsPool {
    private _pools: Map<Symbols, GridSymbol[]> = new Map<Symbols, GridSymbol[]>();

    public initPool(symbolId: Symbols, symbols: GridSymbol[]): void {
        this._pools.set(symbolId, symbols);
    }

    public returnSymbol(symbolId: Symbols, symbol: GridSymbol): void {
        const symbolPool: GridSymbol[] = this._pools.get(symbolId)!;

        symbol.reset();
        symbolPool.push(symbol);
    }

    public getSymbol(symbolId: Symbols): GridSymbol {
        const symbolPool: GridSymbol[] = this._pools.get(symbolId)!;
        const symbol = symbolPool.pop();

        if (symbol === undefined) {
            throw new Error(`Symbol pool for ids: ${symbolId} is empty`);
        }

        return symbol;
    }
}
