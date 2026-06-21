import { Color, Application } from 'pixi.js';

export interface GameApplicationConfig {
    container: HTMLDivElement;
    backgroundColor: number;
    backgroundAlpha: number;
    baseWidth: number;
    baseHeight: number;
}

export default class GameApplication {
    readonly defaultConfig: Partial<GameApplicationConfig> = {
        backgroundColor: 0x000000,
        baseWidth: 1920,
        baseHeight: 1080,
    };
    protected container: HTMLDivElement;
    protected mainScreen: Application;

    protected currentHeight: number = 0;
    protected currentWidth: number = 0;

    constructor(protected config: Partial<GameApplicationConfig>) {
        this.config = { ...this.defaultConfig, ...config };

        this.container = config.container!;

        if (config.backgroundAlpha) {
            this.container.style.backgroundColor = Color.shared
                .setValue(this.config.backgroundColor!)
                .toHex();
        }
        this.container.style.overflow = 'hidden';
        this.container.style.position = 'absolute';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.zIndex = '1';

        this.mainScreen = new Application();

        this.init().then(() => {
            this.container.prepend(this.mainScreen.canvas);
        });

        window.addEventListener('resize', () => {
            this.onResize();
        });
        window.addEventListener('orientationchange', () => {
            this.onResize();
        });
    }

    public async init(): Promise<void> {
        await this.mainScreen.init({
            backgroundColor: this.config.backgroundColor,
            width: this.config.baseWidth,
            height: this.config.baseHeight,
        });

        this.onResize();
    }

    /**
     * Stage resize method
     * @private
     */
    protected onResize(): void {
        if (!this.mainScreen.renderer) return;
        const scaleX: number = window.innerWidth / this.config.baseWidth;
        const scaleY: number = window.innerHeight / this.config.baseHeight;
        this.mainScreen.stage.scale.set(scaleX, scaleY);
        this.mainScreen.renderer.resize(
            scaleX * this.config.baseWidth,
            scaleY * this.config.baseHeight,
        );
    }
}
