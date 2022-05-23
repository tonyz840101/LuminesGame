const Game =
    function (setting) {
        /*
        {
            time,
            tickPerSecond,
            column,
            row,
            scanTick,
            fallTick,
        }
        */
        /// rules
        this.timeOption = setting.timeOption || [90, 180]
        this.tickPerSecond = setting.tickPerSecond || 40
        this.column = setting.column || 16
        this.row = setting.row || 10
        this.scanTick = setting.scanTick || this.tickPerSecond / 4 //default 4 blocks/sec
        this.fallTick = setting.fallTick || this.tickPerSecond * 3 / 2 //1.5 sec

        this.innerColor = INNER_COLOR

        /// variables
        this.pausing = false
        this.currentGameTime = 0
        this.state = gameState.menu
        this.ticker = 0
        this.preList = []
        this.preListDisplay = []
        this.currentMovingBlock = new FallingBlock(this.fallTick, this.row, this.column)

        this.board = {
            C1: [],
            C2: []
        }
        this.hidden = {
            C1: [],
            C2: []
        }

        for (let c = 0; c < this.column; c++) {
            this.board.C1[c] = 0
            this.board.C2[c] = 0
            this.hidden.C1[c] = 0
            this.hidden.C2[c] = 0
        }


        function generateBlockNumber() {
            return ~~(Math.random() * 16)
        }

        const innerColor = {
            C1: 1,
            C2: 2
        }

        function decodeBlockNumber(tmp) {
            let result = []
            for (let i = 0; i < 4; i++) {
                result[i] = ((tmp % 2) == 1) ? innerColor.C2 : innerColor.C1
                tmp = tmp >> 1
            }
            return result
        }

        this.keyHandler = {
            32: (v) => this.inputStart(v),

            87: (v) => this.inputUp(v), //W
            83: (v) => this.inputDown(v), //S
            65: (v) => this.inputLeft(v), //A
            68: (v) => this.inputRight(v), //D
            38: (v) => this.inputUp(v), //A_UP
            40: (v) => this.inputDown(v), //A_DOWN
            37: (v) => this.inputLeft(v), //A_LEFT
            39: (v) => this.inputRight(v), //A_RIGHT

            79: (v) => this.inputEnd(v), //end game
            80: (v) => this.inputPause(v), //pause
            // Z: 90:this.inputUp,
        }

        console.log(this.tickPerSecond)
        this.loop = setInterval(() => this.gameLoop(), 1000 / this.tickPerSecond)


        this.gameTime = () => {
            return this.timeOption[this.currentGameTime]
        }

        this.generateBlockNumber = generateBlockNumber

        this.gameLoop = () => {

            // console.log(this.state, this.ticker)
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
                this.ticker = this.gameTime() * this.tickPerSecond
                this.currentMovingBlock.setPattern(decodeBlockNumber(generateBlockNumber()))

                for (let i = 0; i < 4; i++) {
                    const num = generateBlockNumber()
                    this.preList[i] = num
                    this.preListDisplay[i] = decodeBlockNumber(num)
                }
                console.log('start!')
                return gameState.started
            }
        }
        this.startedState = () => {
            if (this.ticker > 0) {
                if (!this.pausing) {
                    this.currentMovingBlock.fall()
                    this.checkAndPlaceCurrentMovingBlock()

                    this.ticker--
                }
                return this.state
            } else {
                return gameState.result
            }
        }
        this.resultState = () => {
            return this.state
        }

        this.getNewBlock = () => {
            this.currentMovingBlock.setPattern(decodeBlockNumber(this.preList.shift()))
            const num = generateBlockNumber()
            this.preList.push(num)
            this.preListDisplay.shift()
            this.preListDisplay.push(decodeBlockNumber(num))
        }

        this.findBottom = (v, start) => {
            let mask = 1 << start
            while (start !== 0) {
                if (v & mask == 0) {
                    return start
                }
                mask >> 1
                start--
            }
            return 0
        }

        this.checkAndPlaceCurrentMovingBlock = () => {
            //check if fallingBlock lands
            //if reached bottom
            const leftIdx = this.currentMovingBlock.x
            const rightIdx = leftIdx + 1
            if (this.currentMovingBlock.falled === this.row) {
                let right = this.currentMovingBlock.getRight()
                let left = this.currentMovingBlock.getLeft()
                this.board.C1[rightIdx] |= right.C1
                this.board.C2[rightIdx] |= right.C2
                this.board.C1[leftIdx] |= left.C1
                this.board.C2[leftIdx] |= left.C2
                this.getNewBlock()
                return
            }

            const offset = this.row - this.currentMovingBlock.falled + 1
            const mask = 1 << (this.row - this.currentMovingBlock.falled)
            let leftPlaced = ((this.board.C1[leftIdx] | this.board.C2[leftIdx]) & mask) === mask ? 2 : 0
            let rightPlaced = ((this.board.C1[rightIdx] | this.board.C2[rightIdx]) & mask) === mask ? 1 : 0

            const condition = leftPlaced | rightPlaced
            if (condition !== 0) {
                let right = this.currentMovingBlock.getRight()
                let left = this.currentMovingBlock.getLeft()
                let bottom
                switch (condition) {
                    case 1:
                        if (offset == this.row) {
                            this.state = gameState.result
                            return
                        }
                        this.board.C1[rightIdx] |= right.C1 << offset
                        this.board.C2[rightIdx] |= right.C2 << offset
                        //find left
                        bottom = this.findBottom(this.board.C1[leftIdx] | this.board.C2[leftIdx], this.row - this.currentMovingBlock.falled)
                        this.board.C1[leftIdx] |= left.C1 << bottom
                        this.board.C2[leftIdx] |= left.C2 << bottom
                        break
                    case 2:
                        if (offset == this.row) {
                            this.state = gameState.result
                            return
                        }
                        this.board.C1[leftIdx] |= left.C1 << offset
                        this.board.C2[leftIdx] |= left.C2 << offset
                        //find right
                        bottom = this.findBottom(this.board.C1[rightIdx] | this.board.C2[rightIdx], this.row - this.currentMovingBlock.falled)
                        this.board.C1[rightIdx] |= right.C1 << bottom
                        this.board.C2[rightIdx] |= right.C2 << bottom
                        break
                    case 3:
                        if (offset == this.row) {
                            this.state = gameState.result
                            return
                        }
                        //place
                        this.board.C1[rightIdx] |= right.C1 << offset
                        this.board.C2[rightIdx] |= right.C2 << offset
                        this.board.C1[leftIdx] |= left.C1 << offset
                        this.board.C2[leftIdx] |= left.C2 << offset
                        break
                    default:
                        console.error('unexpected place')
                }
                this.getNewBlock()
            }
            return
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
                    this.ticker = 3 * this.tickPerSecond
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
                case gameState.started:
                    this.currentMovingBlock.rotate()
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
                case gameState.started:
                    this.currentMovingBlock.moveDown()
                    this.checkAndPlaceCurrentMovingBlock()
                    return
            }
        }
        this.inputLeft = (up) => {
            console.log('left', up)
            if (up) return
            switch (this.state) {
                case gameState.started:
                    this.currentMovingBlock.moveH(-1)
                    return
            }

        }
        this.inputRight = (up) => {
            console.log('right', up)
            if (up) return
            switch (this.state) {
                case gameState.started:
                    this.currentMovingBlock.moveH(1)
                    return
            }
        }
        this.inputEnd = (up) => {
            console.log('end', up)
        }
        this.inputPause = (up) => {
            if (!up) return
            console.log('pause', up)
            switch (this.state) {
                case gameState.started:
                    this.pausing = !this.pausing
                    return
            }
        }



    }

const FallingBlock = function (ticker, row, column) {
    this.pattern = []
    this.x = 7
    this.falled = 0
    this.fallTicker = ticker
    this.currentTicker = ticker

    this.y = () => {
        console.log(row + 2 - this.falled)
        return row + 2 - this.falled
    }

    this.moveH = (deltaX) => {
        this.currentTicker = ticker

        this.x += deltaX
        if (this.x < 0) this.x = 0
        else if (this.x > column - 2) this.x = column - 2
    }

    this.moveDown = () => {
        this.currentTicker = ticker
        this.falled++
    }

    this.fall = () => {
        if (this.pattern.length === 0) {
            console.error("FallingBlock not initialized")
        }
        this.currentTicker--
        if (this.currentTicker === 0) {
            this.moveDown()
        }
    }

    this.rotate = () => {
        this.pattern.push(this.pattern.shift())
        console.log(this.pattern)
    }

    this.setPattern = (p) => {
        this.pattern = p
        this.currentTicker = ticker
        this.x = 7
        this.falled = 0
    }

    this.getPosition = (pIdx) => {
        return {
            x: this.x + offset[pIdx].x, y: this.falled + offset[pIdx].y
        }
    }

    this.getLeft = () => {
        let C1 = 0
        let C2 = 0
        if (this.pattern[0] === INNER_COLOR.C1) {
            C1 += 2
        } else {
            C2 += 2
        }
        if (this.pattern[1] === INNER_COLOR.C1) {
            C1 += 1
        } else {
            C2 += 1
        }
        return ({
            C1, C2
        })
    }
    this.getRight = () => {
        let C1 = 0
        let C2 = 0
        if (this.pattern[3] === INNER_COLOR.C1) {
            C1 += 2
        } else {
            C2 += 2
        }
        if (this.pattern[2] === INNER_COLOR.C1) {
            C1 += 1
        } else {
            C2 += 1
        }
        return ({
            C1, C2
        })
    }
}

const offset = [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 0 },
]

const INNER_COLOR = {
    C1: 1,
    C2: 2
}

const gameState = {
    menu: 0,
    countDown: 1,
    started: 2,
    result: 3
}
Object.freeze(gameState)
