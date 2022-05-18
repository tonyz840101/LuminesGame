
console.log('Press \'space\' key to start.');
console.log('P to pause');
console.log('K to end game');
console.log('Z to speed up');

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

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

function keyDownHandler(e) {
    console.log('keyDownHandler', e.keyCode)
    // if (e.keyCode == 75) {
    //     if (state != gameState.gaming) return;
    //     draw();
    //     gameResult();
    // }
    // if (pause) return;
    // if (e.keyCode == 37 || e.keyCode == 65) {
    //     if (cube) cube.moveLeft();
    // }
    // if (e.keyCode == 38 || e.keyCode == 87) {//up
    //     if (cube) cube.rotate();
    // }
    // if (e.keyCode == 39 || e.keyCode == 68) {
    //     if (cube) cube.moveRight();
    // }
    // if (e.keyCode == 40 || e.keyCode == 83) {
    //     downPressed = true;
    // }
    // if (e.keyCode == 90) {
    //     main();
    // }
}

function keyUpHandler(e) {
    console.log('keyUpHandler', e.keyCode)
    // if (e.keyCode == 40 || e.keyCode == 83) {
    //     downPressed = false;
    //     down = true;
    // }
    // if (e.keyCode == 80) {
    //     pause = !pause;
    // }
    // if (e.keyCode == 32) {
    //     if (state == gameState.starting) {
    //         state = gameState.counting;
    //         effect = new controlEffect();
    //         waitCounter = 4 * FPS;
    //         grid = new objGrid();
    //     }
    //     else if (state == gameState.result) {
    //         state = gameState.starting;
    //         gameClear();
    //     }
    // }
}


const adjustX = 4
const adjustY = 2
const column = 16
const row = 12
const gameState = {
    starting: 0,
    counting: 1,
    gaming: 2,
    result: 3
}
Object.freeze(gameState)

const colorProvider = new ObjColor({
    C1: '#cccccc',
    C1T: 'rgba(144, 144, 144, 0.5)',
    C1Shade: 'rgba(255, 255, 255, 0.9)',
    C2: '#ff0000',
    C2T: 'rgba(255, 0, 0, 0.5)',
    C2Shade: 'rgba(0, 0, 0, 0.25)',
})

var lCanvas = document.getElementById("lowFreq")
var lCtx = lCanvas.getContext("2d")

var hCanvas = document.getElementById("highFreq")
var hCtx = hCanvas.getContext("2d")

var unit = 20
var edgeX = unit * column
var edgeY = unit * (row - 2)

function resizeCanvas() {
    console.log("resizeCanvas")
    unit = Math.min(~~(window.innerWidth / 24), ~~(window.innerHeight / 16))
    lCanvas.width = unit * 24
    lCanvas.height = unit * 16
    hCanvas.width = unit * 24
    hCanvas.height = unit * 16
    //update params
    edgeX = unit * column;
    edgeY = unit * (row - 2)
}

resizeCanvas();

window.addEventListener('resize', () => {
    resizeCanvas();
    // if (pause) draw();
});

//draw board, suppose to be changed in very low frequency
(function drawGrid() {
    lCtx.strokeStyle = 'rgba(77, 77, 77, 1)';
    lCtx.lineWidth = 2;
    for (let c = 0; c < column + 1; c++) {
        lCtx.beginPath();
        lCtx.moveTo((adjustX + c) * unit, (adjustY + 2) * unit); lCtx.lineTo((adjustX + c) * unit, (adjustY + 2) * unit + edgeY);
        lCtx.stroke();
        lCtx.closePath();
    }

    for (let r = 2; r < row + 1; r++) {
        lCtx.beginPath();
        lCtx.moveTo(adjustX * unit, (adjustY + r) * unit); lCtx.lineTo(adjustX * unit + edgeX, (adjustY + r) * unit);
        lCtx.stroke();
        lCtx.closePath();
    }

})()

//start game loop
const tick = 1000 / 25

//render
// function
//     requestAnimationFrame