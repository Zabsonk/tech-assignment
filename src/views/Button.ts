import { Container, Sprite } from 'pixi.js';
import { AssetsManager } from '../service/AssetsManager';

export enum ButtonState {
    HOVER,
    DOWN,
    NORMAL,
    OVER,
}

export interface ButtonConfig {
    disabledTextureName: string;
    downTextureName: string;
    hoverTextureName: string;
    normalTextureName: string;
    overTextureName: string;
}

export const ButtonClicked = 'onClicked';

export default class Button extends Container {
    private _state: ButtonState = ButtonState.NORMAL;
    private _disabledState: boolean = false;

    protected _disabledSprite: Sprite;
    protected _downSprite: Sprite;
    protected _hoverSprite: Sprite;
    protected _normalSprite: Sprite;
    protected _overSprite: Sprite;

    constructor(config: ButtonConfig) {
        super();

        this._disabledSprite = new Sprite(AssetsManager.get(config.disabledTextureName));
        this._downSprite = new Sprite(AssetsManager.get(config.downTextureName));
        this._hoverSprite = new Sprite(AssetsManager.get(config.hoverTextureName));
        this._normalSprite = new Sprite(AssetsManager.get(config.normalTextureName));
        this._overSprite = new Sprite(AssetsManager.get(config.overTextureName));

        this.addChild(
            this._disabledSprite,
            this._downSprite,
            this._hoverSprite,
            this._normalSprite,
            this._overSprite,
        );

        this._setEvents();

        this._updateView();
    }

    public set disabled(value: boolean) {
        if (value === this._disabledState) {
            return;
        }

        this._disabledState = value;
        this._updateView();
    }

    private _setState(state: ButtonState): void {
        if (this._disabledState || this._state === state) return;

        this._state = state;
        this._updateView();
    }

    private _setEvents(): void {
        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerover', () => this._setState(ButtonState.OVER));
        this.on('pointerout', () => this._setState(ButtonState.NORMAL));
        this.on('pointerdown', () => this._setState(ButtonState.DOWN));
        this.on('pointerup', () => this._setState(ButtonState.HOVER));
        this.on('pointerupoutside', () => this._setState(ButtonState.NORMAL));

        this.on('pointertap', () => this.emit(ButtonClicked));
    }

    protected _updateView(): void {
        this._resetView();

        if (this._disabledState) {
            this._disabledSprite.visible = true;
            this.cursor = 'default';
            return;
        }

        this.cursor = 'pointer';

        let view = this._normalSprite;

        switch (this._state) {
            case ButtonState.NORMAL:
                view = this._normalSprite;
                break;
            case ButtonState.HOVER:
                view = this._hoverSprite;
                break;
            case ButtonState.OVER:
                view = this._overSprite;
                break;
            case ButtonState.DOWN:
                view = this._downSprite;
                break;
        }

        view.visible = true;
    }

    protected _resetView(): void {
        [
            this._disabledSprite,
            this._downSprite,
            this._hoverSprite,
            this._overSprite,
            this._normalSprite,
        ].forEach(sprite => {
            sprite.visible = false;
        });
    }
}
