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
}