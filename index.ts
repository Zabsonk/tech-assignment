// const SCREEN = { width: 1920, height: 1080 };

import Game from './src/app/Game';

// class MainScene extends Container {
//   private readonly _machine: Machine;
//   private readonly _spinButton: SpinButton;

//   constructor() {
//     super();

//     const background = Sprite.from('background');
//     this.addChild(background);

//     const reels = Sprite.from('reels_base');
//     reels.anchor.set(0.5);
//     reels.position.set(SCREEN.width * 0.5, SCREEN.height * 0.5);
//     this.addChild(reels);

//     const machine = new Machine();
//     machine.position.set(
//       SCREEN.width * 0.5 - reels.width * 0.5,
//       SCREEN.height * 0.5 - reels.height * 0.5,
//     );
//     this.addChild(machine);

//     const spinButton = new SpinButton();
//     spinButton.position.set(SCREEN.width * 0.85, SCREEN.height * 0.85);
//     this.addChild(spinButton);

//     spinButton.onSpin = () => {
//       spinButton.setEnabled(false);
//       machine.startSpin();
//     };

//     machine.onSpinComplete = () => {
//       spinButton.setEnabled(true);
//     };

//     this._machine = machine;
//     this._spinButton = spinButton;
//   }

//   update(dt: number): void {
//     this._machine.update(dt);
//     this._spinButton.update(dt);
//   }
// }

// (async () => {
//   const app = new Application();
//   await app.init({ width: SCREEN.width, height: SCREEN.height });
//   document.body.appendChild(app.canvas);

//   await Assets.load(urls as Parameters<typeof Assets.load>[0]);

//   const scene = new MainScene();
//   app.stage = scene;

//   app.ticker.add(({ deltaTime }) => scene.update(deltaTime));
// })();

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app') as HTMLDivElement;

    if (!container) {
        return;
    }

    new Game({
        container: container,
        backgroundColor: 0x0,
    });
});
