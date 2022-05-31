const countDownSec = 0//3
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
        this.paused = false
        this.currentGameTime = 0
        this.state = gameState.menu
        this.ticker = 0
        this.preList = []
        this.preListDisplay = []
        this.currentMovingBlock = new FallingBlock(this.fallTick, this.row, this.column)

        //0,0 at left bottom corner
        this.board = {
            C1: [],
            C2: []
        }
        this.hidden = {
            C1: [],
            C2: []
        }

        this.initBoard = () => {
            for (let c = 0; c < this.column; c++) {
                this.board.C1[c] = 0
                this.board.C2[c] = 0
                this.hidden.C1[c] = 0
                this.hidden.C2[c] = 0
            }
        }

        this.subscriber = []
        this.subscribe = (callback) => {
            this.subscriber.push(callback)
        }
        this.emit = (e) => {
            this.subscriber.forEach(v => v(e))
        }
        this.eventKind = {
            //for render
            grouped: 1,
            cleared: 2,
            //for record
            input: 11,
            blockGenerated: 21,
            blockPlaced: 22,//might not be usful
        }

        this.score = 0
        this.scannerScore = 0
        this.scanner = 0
        this.scannerCounter = this.scanTick
        this.grouped = {
            C1: [],
            C2: []
        }

        this.groupHandler = new GroupHandler(this.column, this.row)

        this.dropLock = false

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
        console.log(this.gameTime())

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
                this.startGame()
                return gameState.started
            }
        }

        this.startGame = () => {
            this.ticker = this.gameTime() * this.tickPerSecond
            this.currentMovingBlock.setPattern(decodeBlockNumber(generateBlockNumber()))

            for (let i = 0; i < 4; i++) {
                const num = generateBlockNumber()
                this.preList[i] = num
                this.preListDisplay[i] = decodeBlockNumber(num)
            }
            this.initBoard()

            this.score = 0
            this.scannerScore = 0
            this.scanner = 0
            this.scannerCounter = this.scanTick
            this.grouped = {
                C1: [],
                C2: []
            }
            this.groupHandler.reset()

            this.dropLock = false
            console.log('start!')
        }

        this.startedState = () => {
            if (this.ticker > 0) {
                if (!this.paused) {
                    this.currentMovingBlock.fall()
                    this.checkAndPlaceCurrentMovingBlock()
                    this.moveScanner()

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

        this.findBottom = (v) => {
            let mask = 1
            let result = 0
            while (result < this.row) {
                if (mask > v) {
                    return result
                }
                mask <<= 1
                result++
            }
            console.error('findBottom exceed row')
            return
        }

        this.moveScanner = () => {
            if (this.scannerCounter > 0) {
                this.scannerCounter--
            } else {
                this.scannerCounter = this.scanTick
                if (this.scanner > 0) {
                    console.log(`do clear ${this.scanner}`)
                    this.scannerScore +=
                        this.checkRelatedAndclear(this.grouped.C1, this.board.C1[this.scanner])
                        + this.checkRelatedAndclear(this.grouped.C2, this.board.C2[this.scanner])
                    // this.reorgBoard()
                }
                this.scanner++
                if (this.scanner === this.column) {
                    this.score += this.scannerScore
                    this.scannerScore = 0
                    this.scanner = 0
                }
                // console.log('scanner at', this.scanner)
            }
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
                this.checkGroup4Block(leftIdx, 1)
                this.getNewBlock()
                return true
            }

            const offset = this.row - this.currentMovingBlock.falled + 1
            const mask = 1 << (this.row - this.currentMovingBlock.falled)
            let leftPlaced = ((this.board.C1[leftIdx] | this.board.C2[leftIdx]) & mask) === mask ? 2 : 0
            let rightPlaced = ((this.board.C1[rightIdx] | this.board.C2[rightIdx]) & mask) === mask ? 1 : 0

            const condition = leftPlaced | rightPlaced
            if (condition === 0) {
                return false
            }

            let right = this.currentMovingBlock.getRight()
            let left = this.currentMovingBlock.getLeft()
            let bottom
            switch (condition) {
                case 1:
                    if (offset == this.row) {
                        console.log("end?? case 1")
                        //#TODO special handle the slide effect
                        this.state = gameState.result
                        return true
                    }
                    this.board.C1[rightIdx] |= right.C1 << offset
                    this.board.C2[rightIdx] |= right.C2 << offset
                    //find left
                    console.log('falled', this.currentMovingBlock.falled)
                    bottom = this.findBottom(this.board.C1[leftIdx] | this.board.C2[leftIdx], this.row - this.currentMovingBlock.falled)
                    this.board.C1[leftIdx] |= left.C1 << bottom
                    this.board.C2[leftIdx] |= left.C2 << bottom
                    this.checkGroup2Block(leftIdx, bottom + 1)
                    this.checkGroup2Block(rightIdx, offset + 1)
                    break
                case 2:
                    if (offset == this.row) {
                        console.log("end?? case 2")
                        //#TODO special handle the slide effect
                        this.state = gameState.result
                        return true
                    }
                    this.board.C1[leftIdx] |= left.C1 << offset
                    this.board.C2[leftIdx] |= left.C2 << offset
                    //find right
                    bottom = this.findBottom(this.board.C1[rightIdx] | this.board.C2[rightIdx], this.row - this.currentMovingBlock.falled)
                    this.board.C1[rightIdx] |= right.C1 << bottom
                    this.board.C2[rightIdx] |= right.C2 << bottom
                    this.checkGroup2Block(leftIdx, offset + 1)
                    this.checkGroup2Block(rightIdx, bottom + 1)
                    break
                case 3:
                    if (offset == this.row) {
                        console.log("end?? case 3")
                        this.state = gameState.result
                        return true
                    }
                    //place
                    this.board.C1[rightIdx] |= right.C1 << offset
                    this.board.C2[rightIdx] |= right.C2 << offset
                    this.board.C1[leftIdx] |= left.C1 << offset
                    this.board.C2[leftIdx] |= left.C2 << offset
                    this.checkGroup4Block(leftIdx, offset + 1)
                    break
                default:
                    console.error('unexpected place')
            }
            this.getNewBlock()
            return true
        }

        //check x-1, y ~ x+1, y-1
        this.checkGroup4Block = (x, y) => {
            // console.log('checkGroup4Block', x, y)
            if (x < 0 || x >= this.column) console.error('checkGroup4Block x', x)
            if (y < 0 || y >= this.row) console.error('checkGroup4Block y', y)
            let xList = []
            let yList = []
            if (x > 0) xList.push(x - 1)
            if (x < this.column - 1) xList.push(x)
            if (x < this.column - 2) xList.push(x + 1)

            if (y > 0) yList.push(y)
            if (y > 1) yList.push(y - 1)

            for (let i = 0; i < xList.length; i++)
                for (let j = 0; j < yList.length; j++)
                    this.checkGroupSingle(xList[i], yList[j])
        }
        //check x-1, y ~ x, y-1
        this.checkGroup2Block = (x, y) => {
            // console.log('checkGroup2Block', x, y)
            if (x < 0 || x >= this.column) console.error('checkGroup2Block x', x)
            if (y < 0 || y >= this.row) console.error('checkGroup2Block y', y)
            let xList = []
            let yList = []
            if (x > 0) xList.push(x - 1)
            if (x < this.column - 1) xList.push(x)

            if (y > 0) yList.push(y)
            if (y > 1) yList.push(y - 1)

            for (let i = 0; i < xList.length; i++)
                for (let j = 0; j < yList.length; j++)
                    this.checkGroupSingle(xList[i], yList[j])
        }
        this.checkGroupSingle = (x, y) => {
            // console.log('check', x, y)
            const mask = 3 << (y - 1)
            if ((this.board.C1[x] & this.board.C1[x + 1] & mask) == mask) {
                console.log('C1 group', x, y)
                this.addGroup(this.grouped.C1, x, y)
                this.groupHandler.addGrouped(INNER_COLOR.C1, x, y)
            }
            else if ((this.board.C2[x] & this.board.C2[x + 1] & mask) == mask) {
                console.log('C2 group', x, y)
                this.addGroup(this.grouped.C2, x, y)
                this.groupHandler.addGrouped(INNER_COLOR.C2, x, y)
            }
        }
        this.addGroup = (target, x, y) => {
            this.emit({ kind: this.eventKind.grouped, x, y })
            target.push(y + x * this.row)
            target.sort((a, b) => a - b)

            console.log(target)
            // console.log(this.relatedGroup(y + x * this.row))
        }
        // this.relatedGroup = (v) => {
        //     let related = {
        //         left: [],
        //         right: []
        //     }
        //     let isBottom = false
        //     let isTop = false
        //     let modResult = v % this.row
        //     if (modResult === 1) {
        //         isBottom = true
        //     } else if (modResult === this.row - 1) {
        //         isTop = true
        //     }
        //     if (v > this.row) {//find left
        //         const base = v - this.row
        //         if (!isBottom) related.left.push(base - 1)
        //         related.left.push(base)
        //         if (!isTop) related.left.push(base + 1)
        //     }
        //     if (v / this.row < this.column - 2) {//find right
        //         const base = v + this.row
        //         if (!isBottom) related.right.push(base - 1)
        //         related.right.push(base)
        //         if (!isTop) related.right.push(base + 1)
        //     }
        //     return related
        // }
        this.checkRelatedAndclear = (target, board) => {
            // const currentColumn = target.filter(v => ~~(v / this.row) == this.scanner).map(v => v % this.row)
            // for(let i = 0; i < currentColumn.length; i ++){
            //     let related = 7 << (currentColumn[i]-1)
            //     if (!related) {
            //         //try clear all related
            //     }
            // }

            // console.log('checkRelatedAndclear', currentColumn)
            // return currentColumn.length
            return 0
        }

        this.checkWholeBoard = () => {
            for (let c = 0; c < this.column - 1; c++) {
                for (let r = 1; r < thie.row; r++) {
                    if ((this.board.C1[x] & this.board.C1[x + 1] & mask) == mask) {
                        console.log('C1 group', x, y)
                        this.addGroup(this.grouped.C1, x, y)
                    }
                    else if ((this.board.C2[x] & this.board.C2[x + 1] & mask) == mask) {
                        console.log('C2 group', x, y)
                        this.addGroup(this.grouped.C2, x, y)
                    }
                }
            }
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

        /// input handler
        this.inputStart = (up) => {
            // console.log('start', up)
            if (!up) return
            switch (this.state) {
                case gameState.menu:
                    this.state = gameState.countDown
                    this.ticker = countDownSec * this.tickPerSecond
                    return
            }
        }
        this.inputUp = (up) => {
            // console.log('up', up)
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
                    if (!develop && this.paused) return
                    this.currentMovingBlock.rotate()
                    return
            }
        }
        this.inputDown = (up) => {
            // console.log('down', up)
            switch (this.state) {
                case gameState.menu:
                    if (up) return
                    this.currentGameTime++
                    if (this.currentGameTime >= this.timeOption.length) {
                        this.currentGameTime = 0
                    }
                    console.log(this.gameTime())
                    return
                case gameState.started:
                    if (up) {
                        if (this.dropLock) this.dropLock = false
                        return
                    } else {
                        if (this.dropLock) return
                        if (!develop && this.paused) return
                        this.currentMovingBlock.moveDown()
                        this.dropLock = this.checkAndPlaceCurrentMovingBlock()
                        return
                    }
            }
        }
        this.inputLeft = (up) => {
            // console.log('left', up)
            if (up) return
            switch (this.state) {
                case gameState.started:
                    if (!develop && this.paused) return
                    this.currentMovingBlock.moveH(-1)
                    return
            }

        }
        this.inputRight = (up) => {
            // console.log('right', up)
            if (up) return
            switch (this.state) {
                case gameState.started:
                    if (!develop && this.paused) return
                    this.currentMovingBlock.moveH(1)
                    return
            }
        }
        this.inputEnd = (up) => {
            // console.log('end', up)
        }
        this.inputPause = (up) => {
            if (develop ? up : !up) return
            // console.log('pause', up)
            switch (this.state) {
                case gameState.started:
                    this.paused = !this.paused
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

    this.fallProcess = () => {
        return 1 - this.currentTicker / this.fallTicker
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
        // console.log(this.pattern)
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

const GroupHandler = function (column, row) {
    let board = {
        C1: [],
        C2: []
    }
    this.nextGroup = 0

    const rowLimit = row - 1
    const columnLimit = column - 1

    this.reset = () => {
        for (let c = 0; c < columnLimit; c++) {
            board.C1[c] = []
            board.C2[c] = []
            for (let r = 0; r < rowLimit; r++) {
                board.C1[c][r] = -1
                board.C2[c][r] = -1
            }
        }
        this.nextGroup = 0
    }
    this.reset()

    this.getBoard = () => {
        return board
    }

    this.findRelated = (board, x, y) => {
        let candidate = []

        const xNotFirst = x > 0
        const xNotLast = x < columnLimit - 1
        const yNotFirst = y > 0
        const yNotLast = y < rowLimit - 1

        if (xNotFirst) {
            if (board[x - 1][y] !== -1)
                candidate.push(board[x - 1][y])
            if (yNotFirst && board[x - 1][y - 1] !== -1)
                candidate.push(board[x - 1][y - 1])
            if (yNotLast && board[x - 1][y + 1] !== -1)
                candidate.push(board[x - 1][y + 1])
        }

        if (board[x][y] !== -1)
            candidate.push(board[x][y])
        if (yNotFirst && board[x][y - 1] !== -1)
            candidate.push(board[x][y - 1])
        if (yNotLast && board[x][y + 1] !== -1)
            candidate.push(board[x][y + 1])

        if (xNotLast) {
            if (board[x + 1][y] !== -1)
                candidate.push(board[x + 1][y])
            if (yNotFirst && board[x + 1][y - 1] !== -1)
                candidate.push(board[x + 1][y - 1])
            if (yNotLast && board[x + 1][y + 1] !== -1)
                candidate.push(board[x + 1][y + 1])
        }

        console.log('before', candidate)
        candidate.sort((a, b) => a - b)
        candidate = candidate.filter((v, idx) => {
            if (idx === 0) return true
            return v !== candidate[idx - 1]
        })
        console.log('after', candidate)
        const target = candidate.shift()
        if (target !== undefined) {
            console.log('shifted', candidate)
            for (let i = 0; i < candidate.length; i++) {
                this.mergeGroupBToA(board, target, candidate[i])
            }
            console.log('group', target)
            return target
        } else {
            let target = this.nextGroup
            this.nextGroup++
            console.log('group', target)
            return target
        }
    }

    this.addGrouped = (color, x, y) => {
        switch (color) {
            case INNER_COLOR.C1:
                board.C1[x][y] = this.findRelated(board.C1, x, y)
                console.log('board.C1', board.C1)
                break
            case INNER_COLOR.C2:
                board.C2[x][y] = this.findRelated(board.C2, x, y)
                console.log('board.C2', board.C2)
                break
            default:
                console.error(`GroupHandler.addGrouped color: ${color}`)
        }
    }

    this.clearGroup = (color, group) => {
        let target
        switch (color) {
            case INNER_COLOR.C1:
                target = board.C1
                break
            case INNER_COLOR.C2:
                target = board.C2
                break
            default:
                console.error(`GroupHandler.clearGroup color: ${color}`)
        }
        for (let c = 0; c < columnLimit; c++) {
            for (let r = 0; r < rowLimit; r++) {
                if (target[c][r] === group)
                    target[c][r] = -1
            }
        }
    }

    this.mergeGroupBToA = (target, groupA, groupB) => {
        if (groupA === groupB) {
            console.warn(`same group blocked: ${groupA}`)
            return
        }
        for (let c = 0; c < columnLimit; c++) {
            for (let r = 0; r < rowLimit; r++) {
                if (target[c][r] === groupB) target[c][r] = groupA
            }
        }
        console.log(`mergeGroup ${groupB} to ${groupA}`)
    }

    this.getClearMapAndUpdate = (groups) => {
        let result = []
        for (let c = 0; c < columnLimit; c++) {
            let currentColumn = 0
            let mask = 3
            for (let r = 0; r < rowLimit; r++) {
                const groupC1 = board.C1[c][r]
                const groupC2 = board.C2[c][r]
                if ((groupC1 !== -1 && groups.indexOf(groupC1) !== -1) || (groupC2 !== -1 && groups.indexOf(groupC2) !== -1)) {
                    currentColumn |= mask
                    result[c] |= mask

                    board.C1[c][r] = -1
                    board.C2[c][r] = -1
                }
                mask <<= 1
            }
            result.push(currentColumn)
        }
        result.push(0)
        return result
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
