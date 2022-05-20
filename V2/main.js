
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

    K: 79,//end game
    P: 80,//pause
    Z: 90,
}
const game = new Game({

})
document.addEventListener("keydown", (e) => game.handleKeyDown(e), false);
document.addEventListener("keyup", (e) => game.handleKeyUp(e), false);

const colorProvider = new ObjColor({
    C1: '#cccccc',
    C1T: 'rgba(144, 144, 144, 0.5)',
    C1Shade: 'rgba(255, 255, 255, 0.9)',
    C2: '#ff0000',
    C2T: 'rgba(255, 0, 0, 0.5)',
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


//start game loop
const tick = 1000 / 25

//render
// function
//     requestAnimationFrame