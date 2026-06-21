import { EventEmitter } from 'pixi.js';
import { State } from './States';
import { GameResult } from './service/GameResult';

export const StateChanged = 'onStateChanged';

export default class SlotMachine extends EventEmitter {
    public gameResult: GameResult | null = null;

    private _currentState: State = State.Init;
    private _previousState: State = State.Init;

    public get currentState(): State {
        return this._currentState;
    }

    public set currentState(value: State) {
        if (this._currentState === value) {
            return;
        }
        this._previousState = this.currentState;
        this._currentState = value;
        this.emit(StateChanged, value);
    }
}
