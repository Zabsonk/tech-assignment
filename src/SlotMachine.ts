import { State } from './States';

export default class SlotMachine {
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
    }
}
