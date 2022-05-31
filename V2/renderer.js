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

        this.effectList = []

        this.resizeCanvas()

        window.addEventListener('resize', () => {
            this.resizeCanvas()
        })
    }
    startRender(game) {
        this.rTime = Date.now()
        this.game = game
        this.render(this.getDeltaTime())
    }
    getDeltaTime() {
        const now = Date.now()
        const deltaTime = now - this.rTime
        this.rTime = now
        return deltaTime
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

    // drawSingleBlock(color, x, y, shadeOn, transparency) {
    //     this.hCtx.beginPath()
    //     if (transparency) {
    //         this.hCtx.fillStyle = this.colorProvider.getTColor(color)
    //     } else {
    //         this.hCtx.fillStyle = this.colorProvider.getOriginalColor(color)
    //     }

    //     this.hCtx.rect(x * this.unit + 1, y * this.unit + 1, this.unit - 2, this.unit - 2)
    //     this.hCtx.fill()
    //     this.hCtx.closePath()
    //     if (shadeOn === false) return

    //     this.hCtx.fillStyle = this.colorProvider.getShadeColor(color)
    //     this.hCtx.lineWidth = this.shade + 1
    //     this.hCtx.beginPath()
    //     this.hCtx.rect(x * this.unit + this.shade, y * this.unit + this.shade, this.unit - 2 * this.shade, this.unit - 2 * this.shade)
    //     this.hCtx.stroke()
    //     this.hCtx.closePath()
    // }

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
            this.hCtx.rect(blocks[i].x + 1, blocks[i].y + 1, this.unit - 2, this.unit - 2)
        }
        this.hCtx.fill()
        this.hCtx.closePath()
        if (shadeOn === false) return

        this.hCtx.strokeStyle = this.colorProvider.getShadeColor(color)
        this.hCtx.lineWidth = this.shade + 1
        this.hCtx.beginPath()
        for (let i = 0; i < blocks.length; i++) {
            this.hCtx.rect(blocks[i].x + this.shade, blocks[i].y + this.shade, this.unit - 2 * this.shade, this.unit - 2 * this.shade)
        }
        this.hCtx.stroke()
        this.hCtx.closePath()
    }

    render(deltaTime) {
        const game = this.game
        // console.log('deltaTime', deltaTime)
        let renderC1 = []
        let renderC2 = []
        switch (game.state) {
            case gameState.started:
                this.hCtx.clearRect(0, 0, this.hCanvas.width, this.hCanvas.height)
                //render falling
                if (game.currentMovingBlock.pattern.length !== 0) {
                    for (let i = 0; i < 4; i++) {
                        let currentBlock = game.currentMovingBlock.getPosition(i)
                        currentBlock.x = (currentBlock.x + this.adjustX) * this.unit
                        currentBlock.y = (currentBlock.y + this.adjustY) * this.unit
                        if (game.currentMovingBlock.pattern[i] === game.innerColor.C1) {
                            renderC1.push(currentBlock)
                        } else {
                            renderC2.push(currentBlock)
                        }
                    }
                }
                for (let c = 0; c < this.column; c++) {
                    let currentC1 = game.board.C1[c]
                    let currentC2 = game.board.C2[c]
                    for (let r = 0; r < this.row; r++) {
                        if (currentC1 & 1 === 1) {
                            renderC1.push({ x: (this.adjustX + c) * this.unit, y: (this.adjustY + 1 + this.row - r) * this.unit })
                        } else if (currentC2 & 1 === 1) {
                            renderC2.push({ x: (this.adjustX + c) * this.unit, y: (this.adjustY + 1 + this.row - r) * this.unit })
                        }
                        currentC1 >>= 1
                        currentC2 >>= 1
                    }
                }
                this.drawBlocks(this.colorProvider.enum.C1, renderC1, true, false)
                this.drawBlocks(this.colorProvider.enum.C2, renderC2, true, false)
                this.renderScanner(game.scanner, 1 - game.scannerCounter / game.scanTick, game.scannerScore)
                break
            case gameState.result:
                this.hCtx.clearRect(0, 0, this.hCanvas.width, this.hCanvas.height)
                for (let c = 0; c < this.column; c++) {
                    let currentC1 = game.board.C1[c]
                    let currentC2 = game.board.C2[c]
                    for (let r = 0; r < this.row; r++) {
                        if (currentC1 & 1 === 1) {
                            renderC1.push({ x: (this.adjustX + c) * this.unit, y: (this.adjustY + 1 + this.row - r) * this.unit })
                        } else if (currentC2 & 1 === 1) {
                            renderC2.push({ x: (this.adjustX + c) * this.unit, y: (this.adjustY + 1 + this.row - r) * this.unit })
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

        for (let i = 0; i < this.effectList.length; i++) {
            const effect = this.effectList[i]
            switch (effect.kind) {
                case effectKind.grouped:
                    this.renderGrouped(effect.x, effect.y, effect.timeLeft / effect.time)
                    break
                case effectKind.cleared:
                    this.renderShatteredBlock(effect.x, effect.y, effect.timeLeft / effect.time)
                    break
                default:
                    console.log('unknown effect kind', effect.kind)
            }
            if (!this.game.paused)
                effect.timeLeft -= deltaTime
        }
        this.effectList = this.effectList.filter(v => v.timeLeft > 0)

        window.requestAnimationFrame(() => this.render(this.getDeltaTime()))
    }


    //{ kind: effectKind, x,y,time,timeLeft}
    insertEffect(effect) {
        console.log('get effect', effect)
        this.effectList.push(effect)
    }

    renderGrouped(x, y, process) {
        const xBase = (x + this.adjustX - process) * this.unit
        const yBase = (y + this.adjustY - process) * this.unit
        this.hCtx.strokeStyle = 'rgba(255, 255, 255, ' + (0.5 - (process / 2)) + ')'//'rgba(255, 255, 0, 0.9)'
        this.hCtx.lineWidth = this.shade + 1
        this.hCtx.beginPath()
        this.hCtx.rect(xBase + this.shade / 2, yBase + this.shade / 2, (2 * process + 2) * this.unit - this.shade, (2 * process + 2) * this.unit - this.shade)
        this.hCtx.stroke()
        this.hCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
        this.hCtx.lineWidth = 2
        this.hCtx.beginPath()
        this.hCtx.rect(xBase, yBase, (2 * process + 2) * this.unit, (2 * process + 2) * this.unit)
        this.hCtx.stroke()
        this.hCtx.closePath()
    }

    renderShatteredBlock(x, y, process) {
        const size = this.unit
        const shortW = size / 2 * process
        const longW = size - shortW
        const color = this.colorProvider.cleared - ~~(this.colorProvider.cleared * process)
        const xBase = (x + this.adjustX) * this.unit
        const yBase = (y + this.adjustY) * this.unit
        this.hCtx.fillStyle = `rgba(${color}, ${color}, ${color}, 0.8)`
        this.hCtx.beginPath()
        this.hCtx.rect(xBase + 1, yBase + 1, shortW - 1, longW - 1)
        this.hCtx.rect(xBase + shortW, yBase + 1, longW - 1, shortW - 1)
        this.hCtx.rect(xBase + 1, yBase + size - shortW, longW - 1, shortW - 1)
        this.hCtx.rect(xBase + size - shortW, yBase + shortW, shortW - 1, longW - 1)
        this.hCtx.fill()
        this.hCtx.closePath()
    }

    renderScanner(x, process, score) {
        const baseX = x + this.adjustX + process
        const baseXUnit = baseX * this.unit
        const baseYUnit = (this.adjustY + 2) * this.unit

        this.hCtx.beginPath()
        this.hCtx.lineWidth = 8
        this.hCtx.strokeStyle = 'rgba(255, 0, 0, 0.4)'
        this.hCtx.moveTo(baseXUnit, baseYUnit)
        this.hCtx.lineTo(baseXUnit, baseYUnit + this.edgeY)
        this.hCtx.stroke()

        this.hCtx.lineWidth = 6
        this.hCtx.strokeStyle = 'rgba(255, 128, 128, 0.4)'
        this.hCtx.moveTo(baseXUnit, baseYUnit)
        this.hCtx.lineTo(baseXUnit, baseYUnit + this.edgeY)
        this.hCtx.stroke()

        this.hCtx.lineWidth = 2
        this.hCtx.strokeStyle = 'rgba(255, 255, 255, 1)'
        this.hCtx.moveTo(baseXUnit, baseYUnit)
        this.hCtx.lineTo(baseXUnit, baseYUnit + this.edgeY)
        this.hCtx.stroke()

        this.hCtx.font = ~~(this.unit * 3 / 4) + "px Microsoft JhengHei"
        this.hCtx.fillStyle = 'rgb(255, 255, 255)'
        this.hCtx.fillText(score, (baseX - 1.1) * this.unit, (this.adjustY + 1.9) * this.unit)

        this.hCtx.rect((baseX - 2) * this.unit, (this.adjustY + 1.2) * this.unit, 2 * this.unit, 0.8 * this.unit)
        this.hCtx.moveTo(baseXUnit, (this.adjustY + 1.2) * this.unit)
        this.hCtx.lineTo((baseX + 0.5) * this.unit, (this.adjustY + 1.6) * this.unit)
        this.hCtx.lineTo(baseXUnit, baseYUnit)
        this.hCtx.stroke()
        this.hCtx.closePath()
    }

    // start() {
    //     window.requestAnimationFrame()

    //     window.getNextA
    // }
}

const effectKind = {
    grouped: 1,
    cleared: 2,
}