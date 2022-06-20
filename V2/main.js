const develop = true

console.log('develop? ', develop)
console.log('Press \'space\' key to start.');
console.log('P to pause');
console.log('K to end game');
console.log('Z to speed up');

const KEYCODE = {
    SPACE: 32,

    W: 87,
    A: 65,
    S: 83,
    D: 68,
    ARROW_UP: 38,
    ARROW_DOWN: 40,
    ARROW_LEFT: 37,
    ARROW_RIGHT: 39,

    K: 79, //end game
    P: 80, //pause
    Z: 90,
}
const game = new Game({
    tickPerSecond: 80
})
document.addEventListener("keydown", (e) => game.handleKeyDown(e), false);
document.addEventListener("keyup", (e) => game.handleKeyUp(e), false);

const c2 = ((colorHexStr) => {
    const intColor = parseInt(colorHexStr.slice(1), 16)
    if (isNaN(intColor)) {
        console.error('C2 parseInt failed')
    }
    const ctR = intColor >> 16
    const ctG = (intColor % (1 << 16)) >> 8
    const ctB = intColor % (1 << 8)
    const ct = `rgba(${ctR}, ${ctG}, ${ctB}, 0.5)`
    // console.log(colorHexStr, ct)
    return {
        o: colorHexStr,
        t: ct
    }

})('#4A4AFF')
// })('#0080FF')
const colorProvider = new ObjColor({
    C1: '#cccccc',
    C1T: 'rgba(144, 144, 144, 0.5)',
    C1Shade: 'rgba(255, 255, 255, 0.9)',
    C2: c2.o,
    C2T: c2.t,
    // C2: '#ff0000',
    // C2T: 'rgba(255, 0, 0, 0.5)',
    C2Shade: 'rgba(0, 0, 0, 0.25)',
})

const renderer = new Renderer(
    document.getElementById("lowFreq"),
    document.getElementById("highFreq"),
    {
        adjustX: 4,
        adjustY: 2,
        column: 16,
        row: 10
    },
    colorProvider
)
renderer.startRender(game)

game.subscribe((e) => {
    switch (e.kind) {
        case game.eventKind.grouped:
            const time = 500
            renderer.insertEffect({
                kind: effectKind.grouped,
                x: e.x,
                y: game.row - e.y + 1,
                time,
                timeLeft: time
            })
            break
        case game.eventKind.cleared:
            break
    }
})
//start game loop
// const tick = 1000 / 25