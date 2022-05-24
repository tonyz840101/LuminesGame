class Renderer {
    constructor(lCanvas, hCanvas, config, colorProvider) {
        this.lCanvas = lCanvas
        this.hCanvas = hCanvas
        this.lCtx = lCanvas.getContext("2d")
        this.hCtx = hCanvas.getContext("2d")

        this.adjustX = config.adjustX || 4
        this.adjustY = config.adjustY || 2
        this.column = config.column || 16
        this.row = config.row || 10
        this.shade = config.shade || 3

        this.colorProvider = colorProvider

        this.resizeCanvas()

        window.addEventListener('resize', () => {
            this.resizeCanvas()
        })
    }

    resizeCanvas() {
        this.unit = Math.min(~~(window.innerWidth / 24), ~~(window.innerHeight / 16))
        this.lCanvas.width = this.unit * 24
        this.lCanvas.height = this.unit * 16
        this.hCanvas.width = this.unit * 24
        this.hCanvas.height = this.unit * 16
        //update params
        this.edgeX = this.unit * this.column
        this.edgeY = this.unit * this.row

        this.drawGrid()
    }

    //draw board, suppose to be changed in very low frequency
    drawGrid() {
        this.lCtx.strokeStyle = this.colorProvider.boardLine;
        this.lCtx.lineWidth = 2;
        for (let c = 0; c < this.column + 1; c++) {
            let xStart = (this.adjustX + c) * this.unit
            let yStart = (this.adjustY + 2) * this.unit
            this.lCtx.beginPath()

            this.lCtx.moveTo(xStart, yStart)
            this.lCtx.lineTo(xStart, yStart + this.edgeY)

            this.lCtx.stroke()
            this.lCtx.closePath()
        }

        for (let r = 0; r < this.row + 1; r++) {
            let xStart = this.adjustX * this.unit
            let yStart = (this.adjustY + r + 2) * this.unit
            this.lCtx.beginPath()

            this.lCtx.moveTo(xStart, yStart)
            this.lCtx.lineTo(xStart + this.edgeX, yStart)

            this.lCtx.stroke()
            this.lCtx.closePath()
        }
    }

    drawSingleBlock(color, x, y, shadeOn, transparency) {
        this.hCtx.beginPath()
        if (transparency) {
            this.hCtx.fillStyle = this.colorProvider.getTColor(color)
        } else {
            this.hCtx.fillStyle = this.colorProvider.getOriginalColor(color)
        }

        this.hCtx.rect(x * this.unit + 1, y * this.unit + 1, this.unit - 2, this.unit - 2)
        this.hCtx.fill()
        this.hCtx.closePath()
        if (shadeOn === false) return

        this.hCtx.fillStyle = this.colorProvider.getShadeColor(color)
        this.hCtx.lineWidth = this.shade + 1
        this.hCtx.beginPath()
        this.hCtx.rect(x * this.unit + this.shade, y * this.unit + this.shade, this.unit - 2 * this.shade, this.unit - 2 * this.shade)
        this.hCtx.stroke()
        this.hCtx.closePath()
    }

    drawBlocks(color, blocks, shadeOn, transparency) {
        if (blocks.length === 0) {
            return
        }
        this.hCtx.beginPath()
        if (transparency) {
            this.hCtx.fillStyle = this.colorProvider.getTColor(color)
        } else {
            this.hCtx.fillStyle = this.colorProvider.getOriginalColor(color)
        }
        for (let i = 0; i < blocks.length; i++) {
            this.hCtx.rect(blocks[i].x * this.unit + 1, blocks[i].y * this.unit + 1, this.unit - 2, this.unit - 2)
        }
        this.hCtx.fill()
        this.hCtx.closePath()
        if (shadeOn === false) return

        this.hCtx.strokeStyle = this.colorProvider.getShadeColor(color)
        this.hCtx.lineWidth = this.shade + 1
        this.hCtx.beginPath()
        for (let i = 0; i < blocks.length; i++) {
            this.hCtx.rect(blocks[i].x * this.unit + this.shade, blocks[i].y * this.unit + this.shade, this.unit - 2 * this.shade, this.unit - 2 * this.shade)
        }
        this.hCtx.stroke()
        this.hCtx.closePath()
    }

    render(game) {
        let renderC1 = []
        let renderC2 = []
        switch (game.state) {
            case gameState.started:
                //render falling
                if (game.currentMovingBlock.pattern.length !== 0) {
                    for (let i = 0; i < 4; i++) {
                        let currentBlock = game.currentMovingBlock.getPosition(i)
                        currentBlock.x += this.adjustX
                        currentBlock.y += this.adjustY
                        if (game.currentMovingBlock.pattern[i] === game.innerColor.C1) {
                            renderC1.push(currentBlock)
                        } else {
                            renderC2.push(currentBlock)
                        }
                    }
                }
            case gameState.result:
                this.hCtx.clearRect(0, 0, this.hCanvas.width, this.hCanvas.height)
                for (let c = 0; c < this.column; c++) {
                    let currentC1 = game.board.C1[c]
                    let currentC2 = game.board.C2[c]
                    for (let r = 0; r < this.row; r++) {
                        if (currentC1 & 1 === 1) {
                            renderC1.push({ x: this.adjustX + c, y: this.adjustY + 1 + this.row - r })
                        } else if (currentC2 & 1 === 1) {
                            renderC2.push({ x: this.adjustX + c, y: this.adjustY + 1 + this.row - r })
                        }
                        currentC1 >>= 1
                        currentC2 >>= 1
                    }
                }
                //render group
                //render scanner
                // for (let i = 0; i < renderC1.length; i++) {
                //     this.drawSingleBlock(this.colorProvider.enum.C1, renderC1[i].x, renderC1[i].y, true, false)
                // }
                // for (let i = 0; i < renderC2.length; i++) {
                //     this.drawSingleBlock(this.colorProvider.enum.C2, renderC2[i].x, renderC2[i].y, true, false)
                // }
                this.drawBlocks(this.colorProvider.enum.C1, renderC1, true, false)
                this.drawBlocks(this.colorProvider.enum.C2, renderC2, true, false)
                break
        }

        window.requestAnimationFrame(() => this.render(game))
    }

    insertEffect(effect) {
        console.log('get effect', effect)
    }

    // start() {
    //     window.requestAnimationFrame()

    //     window.getNextA
    // }
}