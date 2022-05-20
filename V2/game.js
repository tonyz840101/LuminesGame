class Game {
    constructor(setting) {
        /*
        {
            time,
            tickPerSecode,
            column,
            row,
            scanSpeed,
        }
        */
        this.time = setting.time || 180
        this.tickPerSecode = setting.tickPerSecode || 40
        this.column = setting.column || 16
        this.row = setting.row || 10
        this.scanSpeed = setting.scanSpeed || this.tickPerSecode / 4 //default 4 blocks/sec

        this.innerColor = {
            C1: 1,
            C2: 2
        }

        this.board = []
        for (let r = 0; r < this.row; r++) {
            this.board[r] = [];
            for (let c = 0; c < this.column; c++) {
                this.board[r][c] = false;
            }
        }
        this.preList = []
        for (let i = 0; i < 4; i++) {
            this.preList[i] = this.generateBlockNumber()
        }
        this.currentMovingBlock = {
            pattern: [],
            x: 7
        }

        this.state = gameState.idle
        this.counter = 0

        this.keyHandler = {
            32: this.inputStart,

            87: this.inputUp,//W
            83: this.inputDown,//S
            65: this.inputLeft,//A
            68: this.inputRight,//D
            38: this.inputUp,//A_UP
            40: this.inputDown,//A_DOWN
            37: this.inputLeft,//A_LEFT
            39: this.inputRight,//A_RIGHT

            79: this.inputEnd,//end game
            80: this.inputPause,//pause
            // Z: 90:this.inputUp,
        }

        console.log(this.keyHandler)
    }

    generateBlockNumber() {
        return ~~(Math.random() * 16)
    }

    decodeBlockNumber(v) {
        let result = []
        for (let i = 0; i < 4; i++) {
            result[i] = ((v % 2) == 1) ? innerColor.C2 : innerColor.C1
            tmp = tmp >> 1
        }
        return result
    }


    gameLoop() {
        switch (this.state) {
            case gameState.idle:
                console.error('why are we still here')
                break
            case gameState.countDown:
                this.state = this.countDownState()
                break
            case gameState.started:
                this.state = this.startedState()
                break
            case gameState.result:
                this.state = this.resultState()
                break
        }
    }

    countDownState() { }
    startedState() { }
    resultState() { }

    handleKeyUp(e) {
        const keyCode = e.keyCode
        if (this.keyHandler[keyCode]) {
            this.keyHandler[keyCode](true)
        }
    }

    handleKeyDown(e) {
        const keyCode = e.keyCode
        if (this.keyHandler[keyCode]) {
            this.keyHandler[keyCode](false)
        }
    }

    inputStart(up) {
        console.log('start', up)
    }
    inputUp(up) {
        console.log('up', up)
    }
    inputDown(up) {
        console.log('down', up)
    }
    inputLeft(up) {
        console.log('left', up)
    }
    inputRight(up) {
        console.log('right', up)
    }
    inputEnd(up) {
        console.log('end', up)
    }
    inputPause(up) {
        console.log('pause', up)
    }

    start() {
        this.loop = setInterval(this.gameLoop, this.tickPerSecode)
        this.state = gameState.countDown
        this.counter = this.tickPerSecode * 3
    }
}

const gameState = {
    idle: 0,
    countDown: 1,
    started: 2,
    result: 3
}
Object.freeze(gameState)
