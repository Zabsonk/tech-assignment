import Game from './src/app/Game';

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
