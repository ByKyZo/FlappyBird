class Game {
    ctx;
    fallTimeoutID = [];
    gameIntervalID; // Gere l'instance du jeu
    birdSpriteIntervalID; // Gere les images sprites du bird
    upGravityIntervalID; // Gere la monté de gravité
    endFlyTimeoutID; // Gere la fin du vol du bird
    isStarted = false;
    gravity = 2.5;
    bird = {
        size: 80,
        posX: ctx.canvas.width / 3, // Position de depart du bird
        frames: [
            {
                size: 25,
                imgPosX: 0,
                imgPosY: 488,
            },
            {
                size: 25,
                imgPosX: 28,
                imgPosY: 488,
            },
            {
                size: 25,
                imgPosX: 56,
                imgPosY: 488,
            },
        ],
    };
    floor = {
        value: ctx.canvas.height - 140, // Valeur du sol
        frames: {
            before: -ctx.canvas.width + 2,
            middle: 0 + 1,
            after: ctx.canvas.width,
        },
    };
    // TODO Faire le idle (sans bouger les ailes)
    // TODO Faire l'ecran de fin
    // TODO Resize le canvas en fonction de la taille d'ecran (responsive sur mobile)
    /***
     **
     **
     ** Constructor
     **
     **
     ***/
    constructor(ctx) {
        this.ctx = ctx;
    }
    /***
     **
     **
     ** Mets en place les valeurs du bird qui change au court du temps
     **
     **
     ***/
    setProps() {
        console.log('set props');
        this.bird = {
            ...this.bird,
            posY: ctx.canvas.height / 2 - 80, // moins la taille de l'oiseau
            state: 'idle',
            gravity: this.gravity,
            /**
             * Options
             */
            flyValue: 1.2,
            currentRotate: 0,
        };
    }
    /***
     **
     **
     ** Commence le jeu au click
     **
     **
     ***/
    start() {
        this.setProps();
        this.drawGame();
        this.ctx.canvas.addEventListener('mousedown', () => {
            if (this.isStarted) {
                this.fly();
            } else {
                this.isStarted = true;
                this.startGame();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (this.isStarted) {
                if (e.code !== 'Space') return;
                e.preventDefault();
                this.fly();
            } else {
                this.isStarted = true;
                this.startGame();
            }
        });
    }
    /***
     **
     **
     ** Commence le jeu
     **
     **
     ***/
    startGame() {
        this.drawGame('start');
    }
    /***
     **
     **
     ** Permet de nettoyer le canvas
     **
     **
     ***/
    clearRect() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    /***
     **
     **
     ** Dessine le background et le sol du jeu
     **
     **
     ***/
    drawBackground() {
        // Background
        ctx.drawImage(spriteSheet, 0, 0, 144, 250, 0, 0, ctx.canvas.width, ctx.canvas.height);

        // Floor
        for (const frame in this.floor.frames) {
            ctx.drawImage(
                spriteSheet,
                292,
                0,
                168,
                44,
                this.floor.frames[frame],
                ctx.canvas.height - 100,
                ctx.canvas.width,
                100
            );
        }
    }
    /***
     **
     **
     ** Fait defiler le sol a l'infini avec les images en decalées
     **
     **
     ***/
    mooveFloor() {
        const floor = this.floor;
        for (const frame in floor.frames) {
            if (floor.frames[frame] + this.ctx.canvas.width <= 0) {
                floor.frames[frame] = this.ctx.canvas.width;
            } else {
                floor.frames[frame] -= 0.5;
            }
        }
    }
    /***
     **
     **
     ** Dessine le bird et change son orientation selon son etat
     **
     **
     ***/
    drawBird(birdFrame) {
        const bird = this.bird;

        const ctx = this.ctx;

        bird.frames.forEach((_, index) => {
            ctx.setTransform(1, 0, 0, 1, bird.posX + bird.size / 2, bird.posY + bird.size / 2);

            ctx.rotate((this.bird.currentRotate * Math.PI) / 180);

            if (birdFrame === index) {
                ctx.drawImage(
                    spriteSheet,
                    bird.frames[index].imgPosX,
                    bird.frames[index].imgPosY,
                    bird.frames[index].size,
                    bird.frames[index].size,
                    -bird.size * 0.5,
                    -bird.size * 0.5,
                    bird.size,
                    bird.size
                );
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0);
        });
    }
    /***
     **
     **
     ** Permet de faire voler l'oiseau au click et en pressant la touche espace
     **
     **
     ***/
    fly() {
        clearInterval(this.upGravityIntervalID);
        clearTimeout(this.endFlyTimeoutID);

        let currentFlyValue = 0;

        const flyValue = 40;

        this.bird.state = 'fly';

        this.bird.gravity = 0;

        /**
         * Quand le user arrete de click a gravité augmente jusqu'a la limite definie
         */
        this.endFlyTimeoutID = setTimeout(() => {
            console.log('END FLY');
            this.upGravityIntervalID = setInterval(() => {
                if (this.bird.gravity <= this.gravity) {
                    this.bird.gravity += this.gravity * 0.004;
                } else {
                    console.log('GRAVITY MAX');
                    clearInterval(this.upGravityIntervalID);
                }
            }, 0);
        }, 100);

        /**
         * Fait voler le bird avec un effet smooth
         */
        let flyIntervalID = setInterval(() => {
            if (currentFlyValue <= flyValue) {
                currentFlyValue++;
                this.bird.posY -= this.bird.flyValue;
            } else {
                clearInterval(flyIntervalID);
            }
        }, 0);

        this.clearFallTimeoutID();
    }
    /***
     **
     **
     ** Permet de faire tomber l'oiseau jusqu'a que la position Y defini (this.floor.value)
     **
     **
     ***/
    fall() {
        if (this.bird.posY >= this.floor.value) {
            this.resetGame();
            return;
        }
        this.setFallTimeoutID();

        this.bird.posY += this.bird.gravity;
    }
    /***
     **
     **
     ** Si l'utilisateur ne fait pas voler le bird pendant le timeout defini le bird 'tombe'
     **
     **
     ***/
    setFallTimeoutID() {
        this.fallTimeoutID.push(
            setTimeout(() => {
                this.bird.state = 'fall';
            }, 600)
        );
    }
    /***
     **
     **
     ** Nettoie les fall timeout ID
     **
     **
     ***/
    clearFallTimeoutID() {
        this.fallTimeoutID.forEach((timeoutID) => {
            clearTimeout(timeoutID);
        });
        this.fallTimeoutID = [];
    }
    /***
     **
     **
     ** Dessine le jeu !
     **
     **
     ***/
    drawGame(stage) {
        clearInterval(this.gameIntervalID);
        clearInterval(this.birdSpriteIntervalID);

        console.log('DRAW GAME');

        let birdFrame = 0; // L'image actuelle du sprite

        // Change l'image tout les X secondes
        this.birdSpriteIntervalID = setInterval(() => {
            birdFrame++;
        }, 100);

        // Quand la partie commence le bird fait 'fly' une fois
        if (stage === 'start') {
            this.fly();
        }

        this.gameIntervalID = setInterval(() => {
            if (birdFrame === 3) birdFrame = 0;

            this.clearRect();

            this.drawBackground();

            this.drawBird(birdFrame);

            this.mooveFloor();

            if (stage === 'start') {
                this.fall();

                /**
                 * Gere les effet de rotate avec un effet smooth
                 */
                if (this.bird.state === 'fall') {
                    if (this.bird.currentRotate <= 90) {
                        this.bird.currentRotate += 2;
                    }
                } else if (this.bird.state === 'fly') {
                    if (this.bird.currentRotate >= -15) {
                        this.bird.currentRotate -= 15;
                    }
                }
            }
        }, 0);
    }
    /***
     **
     **
     ** Mets fin au jeu / reset le jeu
     **
     **
     ***/
    resetGame() {
        clearInterval(this.gameIntervalID);
        clearInterval(this.birdSpriteIntervalID);
        this.clearRect();
        this.setProps();
        this.isStarted = false;
        this.drawGame();
        console.log('END GAME');
    }
}
