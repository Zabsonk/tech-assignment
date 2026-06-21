import ReelModel from '../model/ReelModel';
import { Symbols } from '../service/GameService';
import SymbolsPool from '../SymbolsPool';
import GridSymbol from '../views/GridSymbol';

export interface SymbolConfig {
    textureName: string;
    width: number;
    height: number;
    count: number;
}

export type SymbolFactoryConfig = Record<Symbols, SymbolConfig>;

export default class SymbolsFactory {
    private _reelModel: ReelModel;

    constructor(reelModel: ReelModel) {
        this._reelModel = reelModel;
    }

    public buildPool(): SymbolsPool {
        const pool = new SymbolsPool();
        const config = this.getConfigs();

        for (const type of Object.values(Symbols)) {
            const symbols: GridSymbol[] = [];
            for (let i = 0; i < config[type].count; i++) {
                symbols.push(this._create(type, config));
            }
            pool.initPool(type, symbols);
        }

        return pool;
    }

    private _create(type: Symbols, config: SymbolFactoryConfig): GridSymbol {
        const { textureName, width, height } = config[type];
        const symbol = new GridSymbol({ textureName });
        symbol.width = width;
        symbol.height = height;
        return symbol;
    }

    protected getConfigs(): SymbolFactoryConfig {
        const { rows, columns, padding } = this._reelModel;
        return {
            [Symbols.High1]: {
                textureName: 'high1',
                width: 200,
                height: 200,
                count: (rows + padding) * columns,
            },
            [Symbols.High2]: {
                textureName: 'high2',
                width: 200,
                height: 200,
                count: (rows + padding) * columns,
            },
            [Symbols.High3]: {
                textureName: 'high3',
                width: 200,
                height: 200,
                count: (rows + padding) * columns,
            },
            [Symbols.Low1]: {
                textureName: 'low1',
                width: 200,
                height: 200,
                count: (rows + padding) * columns,
            },
            [Symbols.Low2]: {
                textureName: 'low2',
                width: 200,
                height: 200,
                count: (rows + padding) * columns,
            },
            [Symbols.Low3]: {
                textureName: 'low3',
                width: 200,
                height: 200,
                count: (rows + padding) * columns,
            },
            [Symbols.Low4]: {
                textureName: 'low4',
                width: 200,
                height: 200,
                count: (rows + padding) * columns,
            },
        };
    }
}
