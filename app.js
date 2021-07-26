const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const spriteSheet = document.querySelector('img');
spriteSheet.remove();
ctx.imageSmoothingEnabled = false;

const game = new Game(ctx);

game.start();
