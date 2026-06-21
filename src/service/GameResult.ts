import { Symbols } from './Symbols';

export interface SymbolPositionAndType {
    x: number;
    y: number;
    symbol: Symbols;
}

export interface GameResult {
    win?: number;
    stopData: Symbols[][];
    winsPositions?: SymbolPositionAndType[];
}
