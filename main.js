var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var FPS = 60;//FPS降低，100時會有group偵測錯誤的bug
var slowScale = 1;//緩速倍率，值越大放越慢
var gameTime = 180;//遊戲時間(秒)
var unit = 20;
var edgeX = unit * column;
var edgeY = unit * (row - 2);
var blockPerSec = unit / FPS;
var animationFall = 200 * blockPerSec;
var column = 16;
var row = 12;
var adjustX = 4;
var adjustY = 2;
var gameState = {
	'starting': 0,
	'counting': 1,
	'gaming': 2,
	'result': 3
}

var dropStd = FPS / 2;
var moveStd = dropStd - 10;
var shade = 3;//effect
var scanner = false;
var state = gameState.starting;//starting gaming
var grid = false;
var cube = false;
var group = false;
var effect = new controlEffect();
var down = true;

var pause = false;
var upPressed = false;
var rightPressed = false;
var leftPressed = false;
var downPressed = false;

var waitCounter = 0;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("keypress", keyPressHandler, false);

console.log('Press \'space\' key to start.');
console.log('P to pause');
console.log('K to end game');
console.log('Z to speed up');

function keyPressHandler(e) {
	if (e.keyCode == 32) {
		if (state == gameState.starting) {
			state = gameState.counting;
			effect = new controlEffect();
			waitCounter = 4 * FPS;
			grid = new objGrid();
		}
		else if (state == gameState.result) {
			state = gameState.starting;
			gameClear();
		}
	}
}

function keyDownHandler(e) {
	if (pause) return;
	if (e.keyCode == 37 || e.keyCode == 65) {
		if (cube) cube.moveLeft();
	}
	if (e.keyCode == 38 || e.keyCode == 87) {//up
		if (cube) cube.rotate();
	}
	if (e.keyCode == 39 || e.keyCode == 68) {
		if (cube) cube.moveRight();
	}
	if (e.keyCode == 40 || e.keyCode == 83) {
		downPressed = true;
	}
	if (e.keyCode == 75) {
		if (state != gameState.gaming) return;
		draw();
		gameResult();
	}
	if (e.keyCode == 90) {
		main();
	}
}

function keyUpHandler(e) {
	if (e.keyCode == 40 || e.keyCode == 83) {
		downPressed = false;
		down = true;
	}
	if (e.keyCode == 80) {
		pause = !pause;
	}
}

function gameInit() {
	dropStd = FPS / 2;
	moveStd = dropStd - 10;
	scanner = new line();
	if (!grid) grid = new objGrid();
	cube = new objCube();
	group = new objGroupControl();
	state = gameState.gaming;//starting gaming
	waitCounter = gameTime * FPS;
}

function gameClear() {
	grid = false;
	cube = false;
	group = false;
	effect = new controlEffect();
	down = true;

	downPressed = false;
}

function gameResult() {
	console.log('End');
	//group.finalCount();
	state = gameState.result;
	cube = false;
	scanner = false;
	waitCounter = FPS * 10;
}

function resizeCanvas() {
	let w_width = $(window).width(), w_height = $(window).height();
	unit = Math.min(~~(w_width / 24), ~~(w_height / 16));
	edgeX = unit * column;
	edgeY = unit * (row - 2);
	$('#myCanvas').attr("width", unit * 24).attr("height", unit * 16);
	blockPerSec = unit / FPS;
	animationFall = 200 * blockPerSec;
}

resizeCanvas();

$(window).resize(function () {
	resizeCanvas();
	if (pause) draw();
});

function drawSingleBlock(color, x, y, shadeOn, transparency) {
	ctx.beginPath();
	switch (color) {
		case 'C1':
			if (transparency) ctx.fillStyle = grid.C1T;
			else ctx.fillStyle = grid.C1;
			break;
		case 'C2':
			if (transparency) ctx.fillStyle = grid.C2T;
			else ctx.fillStyle = grid.C2;
			break;
	}
	ctx.rect(x * unit + 1, y * unit + 1, unit - 2, unit - 2);
	ctx.fill();
	ctx.closePath();
	if (shadeOn === false) return;
	switch (color) {
		case 'C1':
			ctx.strokeStyle = grid.C1Shade;
			break;
		case 'C2':
			ctx.strokeStyle = grid.C2Shade;
			break;
	}
	ctx.lineWidth = shade + 1;
	ctx.beginPath();
	ctx.rect(x * unit + shade, y * unit + shade, unit - 2 * shade, unit - 2 * shade);
	/*ctx.moveTo((x)*unit+shade, (y)*unit+shade);
	ctx.lineTo((x+1)*unit-shade, (y)*unit+shade);
	ctx.lineTo((x+1)*unit-shade, (y+1)*unit-shade);
	ctx.lineTo((x)*unit+shade, (y+1)*unit-shade);
	ctx.lineTo((x)*unit+shade, (y)*unit+shade);*/
	ctx.stroke();
	ctx.closePath();
}

function drawGrid() {
	ctx.strokeStyle = 'rgba(77, 77, 77, 1)';
	ctx.lineWidth = 2;
	for (let c = 0; c < column + 1; c++) {
		ctx.beginPath();
		ctx.moveTo((adjustX + c) * unit, (adjustY + 2) * unit); ctx.lineTo((adjustX + c) * unit, (adjustY + 2) * unit + edgeY);
		ctx.stroke();
		ctx.closePath();
	}

	for (let r = 2; r < row + 1; r++) {
		ctx.beginPath();
		ctx.moveTo(adjustX * unit, (adjustY + r) * unit); ctx.lineTo(adjustX * unit + edgeX, (adjustY + r) * unit);
		ctx.stroke();
		ctx.closePath();
	}
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid();
	if (grid) grid.draw();
	if (cube) cube.draw();
	if (group) group.draw();
	//if(grid) grid.drawGroup();
	if (scanner) scanner.draw();
	effect.draw();

}

function main() {
	draw();

	switch (state) {
		case gameState.starting:
			/*if(waitCounter % FPS == 0){
				waitCounter = 0;
				effect.effectList[effect.effectList.length] = {type: 2, frame: FPS, x: 3*unit, y: 9.8*unit, str: 'Press space to start'};
			}
				waitCounter ++;*/
			effect.effectList[effect.effectList.length] = { type: 2, frame: 2, x: 3 * unit, y: 9.8 * unit, str: 'Press space to start' };
			break;
		case gameState.counting:
			effect.countDown(waitCounter);
			if (pause) return;
			waitCounter--;
			if (waitCounter == 0) {
				gameInit();
			}
			break;
		case gameState.gaming:
			if (pause) return;
			if (downPressed) {
				if (down === true) down = 2;
				if (cube && down == 2) cube.moveDown();
			}
			if (waitCounter % FPS == 0) {
				if (waitCounter != 0) {
					effect.effectList[effect.effectList.length] = { type: 2, frame: FPS, x: 20.3 * unit, y: 5.8 * unit, str: waitCounter / FPS };
				}
				else {
					effect.effectList[effect.effectList.length] = { type: 1, frame: FPS, x: 7.5 * unit, y: 9.8 * unit, str: 'Time\'s up' };
					gameResult();
				}
			}
			waitCounter--;
			cube.fall();
			group.check();
			scanner.scanning();
			break;
		case gameState.result:
			if (pause) return;
			if (waitCounter % FPS == 0) {
				switch (waitCounter / FPS) {
					case 8:
						group.finalCount();
						if (group.checkList.length) {
							waitCounter += FPS
						}
						break;
				}
			}
			if (waitCounter) waitCounter--;
			//this.word(this.effectList[i].str, this.effectList[i].x, this.effectList[i].y, this.effectList[i].frame,false);
			break;
	}
}

setInterval(main, 1000 * slowScale / FPS);

/*


























var cubePre = [];
var cubeCur = [];

var dropCounter = 0;
var moveCounter = 0;

var pause = false;
var rightPressed = false;
var leftPressed = false;
var downPressed = false;
var isSpliting = false;

var grid = [];
var column = 16;
var row = 12;

var rotDir = { CW:1, CCW:0 };
var groupCount = 0;

defaultGrid();
drawGrid();

//declare cubeCur, cubePre as a 2d array
for( var i=0; i<4; i++ ){
	cubeCur[i] = [];
	cubePre[i] = [];
}

resetXy();
setColor();


function keyDownHandler(e) {
	if(pause) return;
	if(e.keyCode == 37) {
		if( !isSpliting && cubeCur[0][0] > 0 && ( !grid[ cubeCur[0][0]-1 ][ cubeCur[0][1] ].isFilled && !grid[ cubeCur[1][0]-1 ][ cubeCur[1][1] ].isFilled ) ){
			moveLeft();
			//drawBlock();
			//drawGrid();	
		}	
	}
	else if(e.keyCode == 38) {
		if( !isSpliting ){
			rotate( rotDir.CW );
		}
	}
	else if(e.keyCode == 39) {
		if( !isSpliting && cubeCur[2][0] < 15 && ( !grid[ cubeCur[2][0]+1 ][ cubeCur[2][1] ].isFilled && !grid[ cubeCur[3][0]+1 ][ cubeCur[3][1] ].isFilled ) ){
			moveRight();
			//drawBlock();
			//drawGrid();	
		}					
	}
	else if(e.keyCode == 40) {
		downPressed = true;								
	}
}

function keyUpHandler(e) {
	if(e.keyCode == 37) {
		leftPressed = false;
	}
	else if(e.keyCode == 39) {
		rightPressed = false;
	}
	else if(e.keyCode == 40) {
		downPressed = false;
	}
	else if(e.keyCode == 80) {
		pause = !pause;								
	}
}

//default value for every block
function defaultGrid(){
	for( var c=0; c<column; c++ ){
		grid[c] = [];
		for( var r=0; r<row; r++ ){
			grid[c][r] = { x:c*blockWidth, y:r*blockWidth, color:"black", 
						   isFilled:false, grouped:false, groupNum:0  };			
		}
	}
}

function resetXy(){
	cubeCur[0][0] = cubeCur[1][0] = cubePre[0][0] = cubePre[1][0] = 7;
	cubeCur[2][0] = cubeCur[3][0] = cubePre[2][0] = cubePre[3][0] = 8;
	cubeCur[0][1] = cubeCur[2][1] = cubePre[0][1] = cubePre[2][1] = 0;
	cubeCur[1][1] = cubeCur[3][1] = cubePre[1][1] = cubePre[3][1] = 1;
	downPressed = false;
}

function setColor(){
	for( var i=0; i<4; i++ ){
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = Math.random()<0.5?"red":"white";
	}
}

function drawBlock(){
	for( var c=0; c<column; c++ ){
		for( var r=0; r<row; r++ ){
			ctx.beginPath();
			if( grid[c][r].grouped ){
				ctx.rect(grid[c][r].x, grid[c][r].y, blockWidth, blockWidth);
			}
			else{
				ctx.rect(grid[c][r].x+1, grid[c][r].y+1, blockWidth-2, blockWidth-2);
			}
			
			ctx.fillStyle = grid[c][r].color;
			ctx.fill();
			ctx.closePath();
		}
	}
}

function drawGrid(){
	for( var c=0; c<column; c++ ){
		for( var r=2; r<row; r++ ){
			if( !grid[c][r].grouped ){
				ctx.beginPath();
				ctx.strokeStyle = "gray";
				ctx.rect(grid[c][r].x, grid[c][r].y, blockWidth, blockWidth);
				ctx.stroke();
				ctx.closePath();
			}
		}
	}
}

function rotate( dir ){
	switch( dir ){
		case rotDir.CW:
			var tmp = grid[ cubeCur[3][0] ][ cubeCur[3][1] ].color;
			grid[ cubeCur[3][0] ][ cubeCur[3][1] ].color = grid[ cubeCur[2][0] ][ cubeCur[2][1] ].color;
			grid[ cubeCur[2][0] ][ cubeCur[2][1] ].color = grid[ cubeCur[0][0] ][ cubeCur[0][1] ].color;
			grid[ cubeCur[0][0] ][ cubeCur[0][1] ].color = grid[ cubeCur[1][0] ][ cubeCur[1][1] ].color;
			grid[ cubeCur[1][0] ][ cubeCur[1][1] ].color = tmp;
			break;
		case rotDir.CCW:
			var tmp = grid[ cubeCur[0][0] ][ cubeCur[0][1] ].color;
			grid[ cubeCur[0][0] ][ cubeCur[0][1] ].color = grid[ cubeCur[2][0] ][ cubeCur[2][1] ].color;
			grid[ cubeCur[2][0] ][ cubeCur[2][1] ].color = grid[ cubeCur[3][0] ][ cubeCur[3][1] ].color;
			grid[ cubeCur[3][0] ][ cubeCur[3][1] ].color = grid[ cubeCur[1][0] ][ cubeCur[1][1] ].color;
			grid[ cubeCur[1][0] ][ cubeCur[1][1] ].color = tmp;
			break;
		default:
			console.log("Rotation error.");
			break;
	}
}

function moveLeft(){
	for( var i=0; i<4; i++ ){
		//console.log( "Cur: ("+cubeCur[i][0]+","+cubeCur[i][1]+") =>" );
		cubePre[i][0] = cubeCur[i][0];
		cubePre[i][1] = cubeCur[i][1];
		cubeCur[i][0]--;
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = grid[ cubePre[i][0] ][ cubePre[i][1] ].color;
		//console.log( "("+cubeCur[i][0]+","+cubeCur[i][1]+")" );
	}
	grid[ cubePre[2][0] ][ cubePre[2][1] ].color = "black";
	grid[ cubePre[3][0] ][ cubePre[3][1] ].color = "black";
}

function moveRight(){
	for( var i=3; i>=0; i-- ){
		//console.log( "Cur: ("+cubeCur[i][0]+","+cubeCur[i][1]+") =>" );
		cubePre[i][0] = cubeCur[i][0];
		cubePre[i][1] = cubeCur[i][1];
		cubeCur[i][0]++;
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = grid[ cubePre[i][0] ][ cubePre[i][1] ].color;
		//console.log( "("+cubeCur[i][0]+","+cubeCur[i][1]+")" );
	}
	grid[ cubePre[0][0] ][ cubePre[0][1] ].color = "black";
	grid[ cubePre[1][0] ][ cubePre[1][1] ].color = "black";
}

function moveDown(){
	for( var i=3; i>=0; i-- ){
		//console.log( "Cur: ("+cubeCur[i][0]+","+cubeCur[i][1]+") =>" );
		cubePre[i][0] = cubeCur[i][0];
		cubePre[i][1] = cubeCur[i][1];			
		cubeCur[i][1]++;
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = grid[ cubePre[i][0] ][ cubePre[i][1] ].color;
		//console.log( "("+cubePre[i][0]+","+cubePre[i][1]+") => ("+cubeCur[i][0]+","+cubeCur[i][1]+") "+grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color );
		//console.log( "("+cubeCur[i][0]+","+cubeCur[i][1]+")" );
	}
	grid[ cubePre[0][0] ][ cubePre[0][1] ].color = "black";
	grid[ cubePre[2][0] ][ cubePre[2][1] ].color = "black";
}

function moveDownSide( splitSide ){
	for( var i=0; i<2; i++ ){
		cubePre[splitSide-i][0] = cubeCur[splitSide-i][0];
		cubePre[splitSide-i][1] = cubeCur[splitSide-i][1];
		cubeCur[splitSide-i][1]++;
		grid[ cubeCur[splitSide-i][0] ][ cubeCur[splitSide-i][1] ].color = grid[ cubePre[splitSide-i][0] ][ cubePre[splitSide-i][1] ].color;
	}
	grid[ cubePre[splitSide-1][0] ][ cubePre[splitSide-1][1] ].color = "black";
}

function checkGroup( index ){	
	var xTmp = cubeCur[index][0];
	var yTmp = cubeCur[index][1];
	var temp = [];
	var skip = false;
	//check bottom-left
	if( xTmp-1 >= 0 && yTmp+1 <= 11 ){
		temp[0] = grid[xTmp-1][yTmp];
		temp[1] = grid[xTmp-1][yTmp+1];
		temp[2] = grid[xTmp][yTmp];
		temp[3] = grid[xTmp][yTmp+1];
		for( var i=0; i<4; i++ ){
			if( temp[i].isFilled != true || temp[i].color != temp[2].color ){
				console.log("No bottom-left.");
				skip = true;
			}
		}
		if( !skip ){
			groupCount++;
			console.log( "Group "+groupCount+" found. (bottom-left)" );
			for( var i=0; i<4; i++ ){
				if( !temp[i].grouped ){
					temp[i].grouped = true;
					temp[i].groupNum = groupCount;
				}
			}
		}
		skip = false;
		
	}
}

function drawLine(){
	
	ctx.strokeStyle = '#ff0000';
	ctx.lineWidth = 2;
	ctx.beginPath();
	
	ctx.moveTo(lineX, 0); ctx.lineTo(lineX, 240);
	ctx.stroke();
	ctx.closePath();
	lineX += lineSpeed * blockPerSec;
	if(lineX >= 320) lineX = 0;
}

function draw(){
	if(pause) return;
	drawBlock();
	drawGrid();
	
	if( !isSpliting && downPressed ) {
		if( cubeCur[1][1] < 11 ){
			if( !grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled && !grid[ cubeCur[3][0] ][ cubeCur[3][1]+1 ].isFilled ){
				moveDown();
			}
			else if( !( grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled && grid[ cubeCur[3][0] ][ cubeCur[3][1]+1 ].isFilled ) ){
				isSpliting = true;
				if( grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled ){
					grid[ cubeCur[0][0] ][ cubeCur[0][1] ].isFilled = true;
					grid[ cubeCur[1][0] ][ cubeCur[1][1] ].isFilled = true;					
					checkGroup(1);
					
					splitSide = 3;
				}
				else{
					grid[ cubeCur[2][0] ][ cubeCur[2][1] ].isFilled = true;
					grid[ cubeCur[3][0] ][ cubeCur[3][1] ].isFilled = true;
					splitSide = 1;
				}
			}
			else{
				for( var i=0; i<4; i++ ){
					grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
				}
				resetXy();
				setColor();
				dropCounter = -10;
			}
		}
		else{
			for( var i=0; i<4; i++ ){
				grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
			}
			resetXy();
			setColor();
			dropCounter = -10;
		}		
	}
	
	if( isSpliting ){
		if( cubeCur[splitSide][1] < 11 && !grid[ cubeCur[splitSide][0] ][ cubeCur[splitSide][1]+1 ].isFilled ){
			moveDownSide( splitSide );
		}
		else{
			isSpliting = false;
			grid[ cubeCur[splitSide][0] ][ cubeCur[splitSide][1] ].isFilled = true;
			grid[ cubeCur[splitSide-1][0] ][ cubeCur[splitSide-1][1] ].isFilled = true;
			resetXy();
			setColor();
			dropCounter = -10;
		}
	}
	
	if( !isSpliting && dropCounter == 2000 ){
		if( cubeCur[1][1] < 11 ){
			if( !grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled && !grid[ cubeCur[3][0] ][ cubeCur[3][1]+1 ].isFilled ){
				moveDown();
			}
			else if( !( grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled && grid[ cubeCur[3][0] ][ cubeCur[3][1]+1 ].isFilled ) ){
				isSpliting = true;
				if( grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled ){
					grid[ cubeCur[0][0] ][ cubeCur[0][1] ].isFilled = true;
					grid[ cubeCur[1][0] ][ cubeCur[1][1] ].isFilled = true;
					splitSide = 3;
				}
				else{
					grid[ cubeCur[2][0] ][ cubeCur[2][1] ].isFilled = true;
					grid[ cubeCur[3][0] ][ cubeCur[3][1] ].isFilled = true;
					splitSide = 1;
				}
			}
			else{
				for( var i=0; i<4; i++ ){
					grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
				}
				resetXy();
				setColor();
				dropCounter = -10;
			}		
		}
		else{
			for( var i=0; i<4; i++ ){
				grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
			}
			resetXy();
			setColor();
		}
		dropCounter = -10;
	}
	dropCounter += 10;
	
	
	drawLine();
}
*/