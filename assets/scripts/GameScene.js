class GameScene extends Phaser.Scene{
    constructor() {
        super("Game");
    }

    preload () {
        this.load.image('bg', 'assets/sprites/background.png');
        this.load.image('card', 'assets/sprites/card.png');

        this.load.image('card1', 'assets/sprites/card1.png');
        this.load.image('card2', 'assets/sprites/card2.png');
        this.load.image('card3', 'assets/sprites/card3.png');
        this.load.image('card4', 'assets/sprites/card4.png');
        this.load.image('card5', 'assets/sprites/card5.png');

    }

    createText(){
        this.timeoutText = this.add.text(250, 510, "", {
            font: '36px Algerian',
            fill: '#ffffff',
        });
        this.attemptsText = this.add.text(250, 540, "",{
            font: '36px Algerian',
            fill: '#ffffff',
        });
    }

    createAttempts(){
        this.attemptsText.setText("Attempts: " + this.attempts);
        ++this.attempts; //+= press;
    }

    onTimerTick(){
        this.timeoutText.setText("Time: " + this.timeout);
        if (this.timeout <= 0){
            this.timer.paused = true;
            this.restart();
        } else {
            --this.timeout;
        }
    }
    createTimer(){

        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.onTimerTick,
            callbackScope: this,
            loop: true,
        });

    }
    create(){
        this.timeout = config.timeout
        this.attempts = config.attempts;
        this.createTimer();
        this.createBackground();
        this.createText();
        this.createCards();
        this.createAttempts();
        this.start();

    }

    restart(){
        let count = 0;
        let onCardMoveComplete = () => {
            ++count;
            if(count >= this.cards.length){
                this.start();
            }
        };
        this.cards.forEach(card => {
            card.move({
                x: this.sys.game.config.width + card.width,
                y: this.sys.game.config.height + card.height,
                delay: card.position.delay,
                callback: onCardMoveComplete
            });
        });
    }

    start(){
        this.initCardPositions();
        this.timeout = config.timeout;
        this.attempts = config.attempts;
        this.openedCard = null;
        this.openedCardsCount = 0;
        this.timer.paused = false;
        this.initCards();
        this.showCards();
    }

    initCards(){
        let positions = Phaser.Utils.Array.Shuffle(this.positions);

        this.cards.forEach(card => {
            card.init(positions.pop());
        });
    }

    showCards(){
        this.cards.forEach(card => {
            card.deph = card.position.delay;
            card.move({
                x: card.position.x,
                y: card.position.y,
                delay: card.position.delay,
            });
        });
    }

    createBackground(){
        this.add.sprite(0, 0, 'bg').setOrigin(0,0);
    }

    createCards(){
        this.cards = [];
        for (let value of config.cards){
            for(let i = 0; i < 2; i++){
                this.cards.push(new Card(this, value));
            }
        }
        this.input.on("gameobjectdown", this.onCardClicked, this);
    }

    onCardClicked(pointer, card){
        this.createAttempts();

        if(card.opened){
            return false;
        }
        if (this.openedCard){
            if (this.openedCard.value === card.value){
                //картинки равны

                this.openedCard = null;
                ++this.openedCardsCount;

                //openedCard.increase();

            } else{
                this.openedCard.close();
                this.openedCard = card;
            }
        } else {
            this.openedCard = card;
        }
        card.open(() => {
            if(this.openedCardsCount === this.cards.length / 2) {
                this.restart();
            }
        });
    }

    initCardPositions (){
        let positions = [];
        let cardTexture = this.textures.get('card').getSourceImage();
        let cardWidth = cardTexture.width + 8;
        let cardHeight = cardTexture.height + 8;
        let offsetX = (this.sys.game.config.width - cardWidth * config.cols) / 2 + cardWidth / 2;
        let offsetY = (this.sys.game.config.height - cardHeight * config.rows) / 2 + cardHeight / 2;

        let id = 0;

        for(let row = 0; row < config.rows; row++){
            for(let col = 0; col < config.cols; col++){
                ++id;
                positions.push({
                    delay: id * 100,
                    x: offsetX + col * cardWidth,
                    y: offsetY + row * cardHeight,
                });
            }
        }
        this.positions = positions;
    }
}



