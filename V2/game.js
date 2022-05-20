const Game =
    function (setting) {
        /*
        {
            time,
            tickPerSecode,
            column,
            row,
            scanSpeed,
        }
        */
        /// rules
        this.timeOption = setting.timeOption || [90, 180]
        this.tickPerSecode = setting.tickPerSecode || 40
        this.column = setting.column || 16
        this.row = setting.row || 10
        this.scanSpeed = setting.scanSpeed || this.tickPerSecode / 4 //default 4 blocks/sec
        this.fallSpeed = setting.scanSpeed || this.tickPerSecode * 3 / 2 //1.5 sec

        this.innerColor = {
            C1: 1,
            C2: 2
        }

        /// variables
        this.pausing = false
        this.currentGameTime = 0
        this.state = gameState.menu
        this.ticker = 0
        this.preList = []
        this.currentMovingBlock = {
            pattern: [],
            x: 7,
            fall: 0,
            fallTicker: 0
        }

        this.board = {
            C1: [],
            C2: []
        }

        for (let c = 0; c < this.column; c++) {
            this.board.C1[c] = 0
            this.board.C2[c] = 0
        }



        function generateBlockNumber() {
            return ~~(Math.random() * 16)
        }
        for (let i = 0; i < 4; i++) {
            this.preList[i] = generateBlockNumber()
        }

        this.keyHandler = {
            32: (v) => this.inputStart(v),

            87: (v) => this.inputUp(v),//W
            83: (v) => this.inputDown(v),//S
            65: (v) => this.inputLeft(v),//A
            68: (v) => this.inputRight(v),//D
            38: (v) => this.inputUp(v),//A_UP
            40: (v) => this.inputDown(v),//A_DOWN
            37: (v) => this.inputLeft(v),//A_LEFT
            39: (v) => this.inputRight(v),//A_RIGHT

            79: (v) => this.inputEnd(v),//end game
            80: (v) => this.inputPause(v),//pause
            // Z: 90:this.inputUp,
        }

        console.log(this.tickPerSecode)
        this.loop = setInterval(() => this.gameLoop(), this.tickPerSecode)


        this.gameTime = () => {
            return this.timeOption[this.currentGameTime]
        }

        this.generateBlockNumber = generateBlockNumber

        this.decodeBlockNumber = (v) => {
            let result = []
            for (let i = 0; i < 4; i++) {
                result[i] = ((v % 2) == 1) ? innerColor.C2 : innerColor.C1
                tmp = tmp >> 1
            }
            return result
        }



        this.gameLoop = () => {

            console.log(this.state, this.ticker)
            switch (this.state) {
                case gameState.menu:
                    this.state = this.menuState()
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
                default:
                    console.error('unknown state')
                    return
            }
        }

        this.menuState = () => {
            return this.state
        }
        this.countDownState = () => {
            if (this.ticker > 0) {
                this.ticker--
                return this.state
            } else {
                this.ticker = this.gameTime() * this.tickPerSecode
                return gameState.started
            }
        }
        this.startedState = () => {
            if (this.ticker > 0) {
                this.ticker--
                return this.state
            } else {
                return gameState.result
            }
        }
        this.resultState = () => {
            return this.state
        }

        this.handleKeyUp = (e) => {
            const keyCode = e.keyCode
            if (this.keyHandler[keyCode]) {
                this.keyHandler[keyCode](true)
            }
        }

        this.handleKeyDown = (e) => {
            const keyCode = e.keyCode
            if (this.keyHandler[keyCode]) {
                this.keyHandler[keyCode](false)
            }
        }

        this.inputStart = (up) => {
            console.log('start', up)
            if (!up) return
            switch (this.state) {
                case gameState.menu:
                    this.state = gameState.countDown
                    this.ticker = 3 * this.tickPerSecode
                    return
            }
        }
        this.inputUp = (up) => {
            console.log('up', up)
            if (up) return
            switch (this.state) {
                case gameState.menu:
                    this.currentGameTime--
                    if (this.currentGameTime < 0) {
                        this.currentGameTime = this.timeOption.length - 1
                    }
                    console.log(this.gameTime())
                    return
            }
        }
        this.inputDown = (up) => {
            console.log('down', up)
            if (up) return
            switch (this.state) {
                case gameState.menu:
                    this.currentGameTime++
                    if (this.currentGameTime >= this.timeOption.length) {
                        this.currentGameTime = 0
                    }
                    console.log(this.gameTime())
                    return
            }
        }
        this.inputLeft = (up) => {
            console.log('left', up)
        }
        this.inputRight = (up) => {
            console.log('right', up)
        }
        this.inputEnd = (up) => {
            console.log('end', up)
        }
        this.inputPause = (up) => {
            if (!up) return
            console.log('pause', up)
        }



    }

const gameState = {
    menu: 0,
    countDown: 1,
    started: 2,
    result: 3
}
Object.freeze(gameState)
