var objCube = function () {//controlable Block
	//var tmp = 
	//console.log(tmp);
	let tmp = grid.nextBlock();
	this.Position = [
		{ x: 7, y: 0, c: '' },
		{ x: 7, y: 1, c: '' },
		{ x: 8, y: 1, c: '' },
		{ x: 8, y: 0, c: '' },];
	for (let i = 0; i < 4; i++) {
		this.Position[i].c = tmp.c[i];
	}
	this.dropCounter = 0;
	//console.log(this.Position);
}

objCube.prototype.draw = function () {
	for (let i = 0; i < 4; i++) {
		drawSingleBlock(this.Position[i].c, this.Position[i].x + adjustX, this.Position[i].y + adjustY, true, false);
	}
}

objCube.prototype.rotate = function () {
	let tmp = this.Position[0].c;
	this.Position[0].c = this.Position[1].c;
	this.Position[1].c = this.Position[2].c;
	this.Position[2].c = this.Position[3].c;
	this.Position[3].c = tmp;
}

objCube.prototype.moveLeft = function () {
	if (this.dropCounter < 0) this.dropCounter = 0;

	if (this.Position[0].x == 0) return;
	if (grid.g[this.Position[0].y][this.Position[0].x - 1] || grid.g[this.Position[1].y][this.Position[1].x - 1]) return;

	for (let i = 0; i < 4; i++) {
		this.Position[i].x--;
	}
	this.dropCounter -= moveStd;
}

objCube.prototype.moveRight = function () {
	if (this.dropCounter < 0) this.dropCounter = 0;

	if (this.Position[2].x == column - 1) return;
	if (grid.g[this.Position[2].y][this.Position[2].x + 1] || grid.g[this.Position[3].y][this.Position[3].x + 1]) return;

	for (let i = 0; i < 4; i++) {
		this.Position[i].x++;
	}
	this.dropCounter -= moveStd;
}

objCube.prototype.moveDown = function () {
	if (this.Position[1].y > 10) {
		this.inPosition('up');//up
		return;
	}
	else if (grid.g[this.Position[1].y + 1][this.Position[1].x] && grid.g[this.Position[2].y + 1][this.Position[2].x]) {
		this.inPosition('all');
		return;
	}
	else if (grid.g[this.Position[1].y + 1][this.Position[1].x]) {
		this.inPosition('left');
		return;
	}
	else if (grid.g[this.Position[2].y + 1][this.Position[2].x]) {
		this.inPosition('right');
		return;
	}
	for (let i = 0; i < 4; i++) {
		this.Position[i].y++;
	}
	this.dropCounter = 0;
}

objCube.prototype.inPosition = function (checkPart) {
	if (this.Position[1].y < 2) {
		effect.effectList[effect.effectList.length] = { type: 4, frame: FPS / 5 };
		draw();
		gameResult();
		return;
	}
	for (let i = 0; i < 4; i++) {
		grid.g[this.Position[i].y][this.Position[i].x] = { group: false, show: true, color: this.Position[i].c };
	}
	switch (checkPart) {
		case 'up':
			group.addCheck(this.Position[0].x, this.Position[0].y);
			group.addCheck(this.Position[3].x, this.Position[3].y);
			break;
		case 'left':
			group.addCheck(this.Position[1].x, this.Position[1].y);
			group.addCheck(this.Position[0].x, this.Position[0].y);
			break;
		case 'right':
			group.addCheck(this.Position[2].x, this.Position[2].y);
			group.addCheck(this.Position[3].x, this.Position[3].y);
			break;
		case 'all':
			group.addCheck(this.Position[1].x, this.Position[1].y);
			group.addCheck(this.Position[2].x, this.Position[2].y);
			group.addCheck(this.Position[0].x, this.Position[0].y);
			group.addCheck(this.Position[3].x, this.Position[3].y);
			break;
	}
	grid.adjust();
	down = false;
	cube = new objCube();
}

objCube.prototype.fall = function () {
	this.dropCounter++;
	if (this.Position[1].y > 10 || grid.g[this.Position[1].y + 1][this.Position[1].x] || grid.g[this.Position[2].y + 1][this.Position[2].x]) {
		if (this.dropCounter >= dropStd * 3 / 4) {
			this.moveDown();
		}
	}
	else if (this.dropCounter >= dropStd) {
		this.moveDown();
	}
}