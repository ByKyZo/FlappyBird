class Game {
    ctx;
    score = 0;
    gameIntervalID; // Gere l'instance du jeu
    birdSpriteIntervalID; // Gere les images sprites du bird
    upGravityIntervalID; // Gere la monté de gravité
    endFlyTimeoutID; // Gere la fin du vol du bird
    pipes = [];
    isStarted = false;
    pipeMinHeightRatio = null;
    pipeMaxHeightRatio = null;
    GODMODE = null;
    bird = {
        size: 80,
        posX: ctx.canvas.width / 3, // Position de depart du bird
        posY: null, // moins la taille de l'oiseau
        state: null,
        gravity: null,
        currentRotate: null,
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
    pipe = {
        width: 80,
        height: ctx.canvas.height,
        imgWidth: 26,
        imgHeight: 162,
        up: {
            imgPosX: 56,
            imgPosY: 322,
        },
        down: {
            imgPosX: 84,
            imgPosY: 322,
        },
    };
    floor = {
        value: ctx.canvas.height - 140, // Valeur du sol
        frames: {
            before: -ctx.canvas.width + 2,
            middle: 0 + 1,
            after: ctx.canvas.width,
        },
    };
    // TODO Faire l'acceuil du jeu
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
     ** Mets en place les options du jeu
     **
     **
     ***/
    setOption() {
        this.gravity = 6; // Gravite plus elle est elevé plus l'oiseau sera attiré par le sol etc...
        this.flyValue = 1.2; // La valeur a ajouté pour faire voler l'oiseau
        this.speed = 0.7; // Vitesse du jeu
        this.spaceBetweenPipe = this.bird.size * 1.3; // Espace entre 2 tuyaux
        this.pipeMinHeightRatio = 0.85; // Valeur min de la hauteur d'un tuyau
        this.pipeMaxHeightRatio = 0.45; // Valeur max de la hauteur d'un tuyau
        this.fallRotateOnGravityPercent = 0.3; // a quelle pourcentage de la gravité l'oiseau effectura une rotation
        this.GODMODE = false;
    }
    /***
     **
     **
     ** Mets en place les valeurs du bird qui change au court du temps
     **
     **
     ***/
    setProps() {
        this.setOption();
        this.bird = {
            ...this.bird,
            posY: ctx.canvas.height / 2 - 80, // moins la taille de l'oiseau
            state: 'idle',
            gravity: this.gravity,
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
                floor.frames[frame] -= this.speed;
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
     ** Permet de faire voler l'oiseau avec une gravité
     **
     **
     ***/
    fly() {
        clearInterval(this.upGravityIntervalID);
        clearTimeout(this.endFlyTimeoutID);

        let currentFlyValue = 0;

        const flyValue = 50;

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
                    /**
                     * Quand la gravité de l'oiseau arrive a X % de la gravité il fait une rotation vers le bas
                     */
                    if (this.bird.gravity >= this.gravity * this.fallRotateOnGravityPercent) {
                        this.bird.state = 'fall';
                    }
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
                this.bird.posY -= this.flyValue;
            } else {
                clearInterval(flyIntervalID);
            }
        }, 0);
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

        this.bird.posY += this.bird.gravity;
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

        if (this.GODMODE) {
            for (let i = 1; i <= 3; i++) {
                console.warn(`/${i}\\ Attention le god mode est activé`);
            }
        }

        let birdFrame = 0; // L'image actuelle du sprite

        // Change l'image tout les X secondes
        this.birdSpriteIntervalID = setInterval(() => {
            birdFrame++;
        }, 100);

        // Quand la partie commence le bird fait 'fly' une fois
        if (stage === 'start') {
            this.fly();
        }

        this.setPipeProps();

        this.gameIntervalID = setInterval(() => {
            if (birdFrame === 3) birdFrame = 0;

            // this.clearRect();

            this.drawBackground();

            this.drawBird(birdFrame);

            this.mooveFloor();

            if (stage === 'start') {
                this.fall();

                this.drawPipe();

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

            this.setScore();
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
        this.score = 0;
        console.log('END GAME');
    }
    /***
     **
     **
     ** Mets fin au jeu / reset le jeu
     **
     **
     ***/
    drawPipe() {
        const ctx = this.ctx;

        this.pipes.forEach((pipe) => {
            pipe.x -= this.speed;

            // const hitboxX = 28;
            const hitboxX = 34;
            const hitboxYUp = 16;
            const hitboxYDown = 40;

            /**
             * Detecte les collisions des tuyaux avec les hitbox
             * ! LE GODMODE NE PRENDS PAS EN COMPTE LES COLLIONS
             */
            if (
                !this.GODMODE &&
                (this.pipe.height - pipe.up.Y - hitboxYUp >= this.bird.posY ||
                    this.ctx.canvas.height - (this.pipe.height - pipe.down.Y + hitboxYDown) <=
                        this.bird.posY) &&
                pipe.x + hitboxX <= this.bird.posX + this.bird.size &&
                pipe.x + this.pipe.width >= this.bird.posX
            ) {
                this.resetGame();
            }

            /**
             * Detecte si le bird a passer un tuyau et incremente un point
             */
            if (
                pipe.x + this.pipe.width + 1 >= this.bird.posX &&
                pipe.x + this.pipe.width <= this.bird.posX
            ) {
                this.score++;
                console.log(this.score);
            }

            if (pipe.x + this.pipe.width <= 0) {
                /**
                 * Reset les tuyaux quand il arrive au bord (x <= 0)
                 */
                const randomPipeUpHeight = this.generateRandomPipeHeight();

                const pipeDownHeight =
                    ctx.canvas.height - randomPipeUpHeight + this.spaceBetweenPipe;

                pipe.up.height = randomPipeUpHeight;

                pipe.down.height = pipeDownHeight;

                pipe.x = ctx.canvas.width;
            }

            /**
             * Dessine les tuyaux
             */
            // Pipe Up
            ctx.drawImage(
                spriteSheet,
                this.pipe.up.imgPosX,
                this.pipe.up.imgPosY,
                this.pipe.imgWidth,
                this.pipe.imgHeight,
                pipe.x,
                -pipe.up.Y,
                this.pipe.width,
                ctx.canvas.height
            );

            // Pipe Down
            ctx.drawImage(
                spriteSheet,
                this.pipe.down.imgPosX,
                this.pipe.down.imgPosY,
                this.pipe.imgWidth,
                this.pipe.imgHeight,
                pipe.x,
                pipe.down.Y,
                this.pipe.width,
                ctx.canvas.height
            );
        });
    }
    /***
     **
     **
     ** Prepare les tuyaux
     **
     **
     ***/
    setPipeProps() {
        this.pipes = [];
        for (let i = 1; i <= 2; i++) {
            const randomPipeUpHeight = this.generateRandomPipeHeight();

            const pipeDownHeight = ctx.canvas.height - randomPipeUpHeight + this.spaceBetweenPipe;

            this.pipes.push({
                x: this.ctx.canvas.width / 2 + (this.ctx.canvas.width - this.pipe.width * 2) * i,
                up: {
                    Y: randomPipeUpHeight,
                },
                down: {
                    Y: pipeDownHeight,
                },
            });
        }
    }
    /***
     **
     **
     ** Genere une hauteur aleatoire pour les tuyaux
     **
     **
     ***/
    generateRandomPipeHeight = () => {
        return this.getRandomNumber(
            this.ctx.canvas.height * this.pipeMaxHeightRatio,
            this.ctx.canvas.height * this.pipeMinHeightRatio
        );
    };
    /***
     **
     **
     ** Affiche le score actuelle
     **
     **
     ***/
    setScore = () => {
        this.ctx.strokeStyle = 'black';
        this.ctx.font = '70pt VT323';
        ctx.lineWidth = 6;
        this.ctx.textAlign = 'center';
        this.ctx.strokeText(this.score, this.ctx.canvas.width / 2, 110);
        ctx.fillStyle = 'white';
        this.ctx.fillText(this.score, this.ctx.canvas.width / 2, 110);
    };

    getRandomNumber = (max, min) => {
        const minValue = min || 0;

        const minValueNotZero = min || 1;

        const minValueToMax = min ? 1 : 0;

        return Math.floor(Math.random() * (max + minValueToMax - minValue) + minValueNotZero);
    };
}
