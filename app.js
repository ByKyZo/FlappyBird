const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const spriteSheet = document.querySelector('img');
spriteSheet.remove();
ctx.imageSmoothingEnabled = false;

// const birdImg1 =

const game = new Game(ctx);

game.start();

// ctx.drawImage(spriteSheet, 0, 488, 25, 25, 0, 0, 80, 80)
// ctx.drawImage(spriteSheet, 28, 488, 25, 25, 0, 0, 80, 80)
// ctx.drawImage(spriteSheet, 56, 488, 25, 25, 0, 0, 80, 80)

console.log(ctx);
console.log('Flappy Bird');
