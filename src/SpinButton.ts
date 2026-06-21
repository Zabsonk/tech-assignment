import { Assets, Container, Sprite } from 'pixi.js';

type ButtonState = 'normal' | 'hover' | 'down' | 'disabled';

export class SpinButton extends Container {
    private readonly _sprite: Sprite;
    private _enabled = true;

    /** Triggered when the button is clicked while enabled. */
    onSpin?: () => void;

    constructor() {
        super();

        this._sprite = Sprite.from('spin_btn_normal');
        this._sprite.anchor.set(0.5);
        this.addChild(this._sprite);

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerover', this._onOver, this);
        this.on('pointerout', this._onOut, this);
        this.on('pointerdown', this._onDown, this);
        this.on('pointerup', this._onUp, this);
    }

    setEnabled(enabled: boolean): void {
        this._enabled = enabled;
        this.cursor = enabled ? 'pointer' : 'default';
        this._setTexture(enabled ? 'normal' : 'disabled');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_dt: number): void {}

    private _onOver(): void {
        if (this._enabled) this._setTexture('hover');
    }

    private _onOut(): void {
        if (this._enabled) this._setTexture('normal');
    }

    private _onDown(): void {
        if (this._enabled) this._setTexture('down');
    }

    private _onUp(): void {
        if (!this._enabled) return;
        this._setTexture('hover');
        this.onSpin?.();
    }

    private _setTexture(state: ButtonState): void {
        const key = state === 'normal' ? 'spin_btn_normal' : `spin_btn_${state}`;
        const tex = Assets.get(key);
        if (tex) this._sprite.texture = tex;
    }
}
