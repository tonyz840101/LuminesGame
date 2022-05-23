class ObjColor {
    constructor(colorConfig) {
        this.C1 = colorConfig.C1 || '#cccccc'
        this.C1T = colorConfig.C1T || 'rgba(144, 144, 144, 0.5)'
        this.C1Shade = colorConfig.C1Shade || 'rgba(255, 255, 255, 0.9)'
        this.C2 = colorConfig.C2 || '#ff0000'
        this.C2T = colorConfig.C2T || 'rgba(255, 0, 0, 0.5)'
        this.C2Shade = colorConfig.C2Shade || 'rgba(0, 0, 0, 0.25)'
        this.text = colorConfig.text || '#000000'
        this.boardLine = colorConfig.boardLine || 'rgba(77, 77, 77, 1)'

        this.enum = {
            C1: 1,
            C1T: 2,
            C1Shade: 3,
            C2: 4,
            C2T: 5,
            C2Shade: 6,
        }
        Object.freeze(this.enum)
    }

    getTColor(v) {
        switch (v) {
            case this.enum.C1:
            case this.enum.C1T:
            case this.enum.C1Shade:
                return this.C1T
            case this.enum.C2:
            case this.enum.C2T:
            case this.enum.C2Shade:
                return this.C2T
        }
    }

    getShadeColor(v) {
        switch (v) {
            case this.enum.C1:
            case this.enum.C1T:
            case this.enum.C1Shade:
                return this.C1Shade
            case this.enum.C2:
            case this.enum.C2T:
            case this.enum.C2Shade:
                return this.C2Shade
        }
    }

    getOriginalColor(v) {
        switch (v) {
            case this.enum.C1:
            case this.enum.C1T:
            case this.enum.C1Shade:
                return this.C1
            case this.enum.C2:
            case this.enum.C2T:
            case this.enum.C2Shade:
                return this.C2
        }
    }
}