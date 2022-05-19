class Game {
    constructor(setting) {
        this.time = setting.time || 180
        this.tick = setting.tick || 40
        this.column = setting.column || 16
        this.row = setting.row || 10
        this.scanSpeed = setting.scanSpeed || this.tick / 4 //default 4 blocks/sec

        this.innerColor = {
            C1: 1,
            C2: 2
        }

        this.board = []
        for (let r = 0; r < row; r++) {
            this.board[r] = [];
            for (let c = 0; c < column; c++) {
                this.g[r][c] = false;
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

    }

    start() {
        this.loop = setInterval(this.gameLoop, this.tick)
    }
}