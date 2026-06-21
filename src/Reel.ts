import { Assets, Container, Graphics, Sprite } from 'pixi.js';

export const SYMBOL_W = 170;
export const SYMBOL_H = 163;

const ALL_SYMBOLS = ['high1', 'high2', 'high3', 'low1', 'low2', 'low3', 'low4'];
const SPIN_SPEED = 30;
const STOP_DURATION = 20;
const BOUNCE_DURATION = 14;

function rnd(): string {
    return ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
}

type ReelState = 'idle' | 'spinning' | 'stopping' | 'bouncing';

/**
 * Single reel: 4-sprite scrolling strip masked to 3 visible rows.
 * Sprites scroll downward — new symbols enter from the top.
 *
 * Strip layout (scrollY = 0):
 *   _sprites[0]  y = -SYMBOL_H   (above mask, incoming)
 *   _sprites[1]  y =  0          (row 0, visible)
 *   _sprites[2]  y =  SYMBOL_H   (row 1, visible)
 *   _sprites[3]  y =  2*SYMBOL_H (row 2, visible)
 *
 * After each full SYMBOL_H scroll, sprite[3] exits the bottom and is recycled
 * to the top of the strip with a fresh random symbol.
 */
export class Reel extends Container {
    private readonly _strip: Container;
    private readonly _sprites: Sprite[] = [];
    private readonly _names: string[] = [];

    private _scrollY = 0;
    private _state: ReelState = 'idle';
    private _stopTimer = 0;
    private _bounceTimer = 0;
    private _targetNames: string[] = [];
    private _onStopped?: () => void;

    constructor() {
        super();

        const mask = new Graphics();
        mask.rect(0, 0, SYMBOL_W, SYMBOL_H * 3);
        mask.fill(0xffffff);
        this.addChild(mask);

        this._strip = new Container();
        this._strip.mask = mask;
        this.addChild(this._strip);

        for (let i = 0; i < 4; i++) {
            const name = rnd();
            const sprite = new Sprite(Assets.get(name));
            sprite.width = SYMBOL_W;
            sprite.height = SYMBOL_H;
            sprite.y = (i - 1) * SYMBOL_H;
            this._strip.addChild(sprite);
            this._sprites.push(sprite);
            this._names.push(name);
        }
    }

    setSymbols(symbols: string[]): void {
        for (let i = 0; i < 3; i++) {
            this._sprites[i + 1].texture = Assets.get(symbols[i]);
            this._names[i + 1] = symbols[i];
        }
    }

    /** Returns the visible sprite for the given row (0–2). */
    getSprite(row: number): Sprite {
        return this._sprites[row + 1];
    }

    startSpin(): void {
        this._state = 'spinning';
        this._scrollY = 0;
    }

    stopAt(symbols: string[], onStopped: () => void): void {
        this._targetNames = [...symbols];
        this._onStopped = onStopped;
        this._stopTimer = 0;
        this._state = 'stopping';
    }

    update(dt: number): void {
        switch (this._state) {
            case 'spinning':
                this._scroll(SPIN_SPEED * dt);
                break;

            case 'stopping': {
                this._stopTimer += dt;
                const t = Math.min(this._stopTimer / STOP_DURATION, 1);
                if (t >= 1) {
                    this._snap();
                } else {
                    // Ease-out quadratic deceleration
                    this._scroll(SPIN_SPEED * (1 - t * t) * dt);
                }
                break;
            }

            case 'bouncing': {
                this._bounceTimer += dt;
                const t = Math.min(this._bounceTimer / BOUNCE_DURATION, 1);
                const scale = 1 + 0.08 * Math.sin(t * Math.PI);
                for (let i = 1; i <= 3; i++) {
                    this._sprites[i].scale.set(scale);
                }
                if (t >= 1) {
                    for (let i = 1; i <= 3; i++) this._sprites[i].scale.set(1);
                    this._state = 'idle';
                    this._onStopped?.();
                }
                break;
            }
        }
    }

    private _scroll(px: number): void {
        this._scrollY += px;
        while (this._scrollY >= SYMBOL_H) {
            this._scrollY -= SYMBOL_H;
            this._advanceStrip();
        }
        for (let i = 0; i < 4; i++) {
            this._sprites[i].y = (i - 1) * SYMBOL_H + this._scrollY;
        }
    }

    private _advanceStrip(): void {
        // Bottom sprite exits; recycle it to the top with a new random symbol.
        const recycled = this._sprites.splice(3, 1)[0];
        const name = rnd();
        recycled.texture = Assets.get(name);
        recycled.width = SYMBOL_W;
        recycled.height = SYMBOL_H;
        this._sprites.unshift(recycled);
        this._names.splice(3, 1);
        this._names.unshift(name);
    }

    private _snap(): void {
        for (let i = 0; i < 3; i++) {
            this._sprites[i + 1].texture = Assets.get(this._targetNames[i]);
            this._names[i + 1] = this._targetNames[i];
        }
        this._scrollY = 0;
        for (let i = 0; i < 4; i++) {
            this._sprites[i].y = (i - 1) * SYMBOL_H;
        }
        this._bounceTimer = 0;
        this._state = 'bouncing';
    }
}
