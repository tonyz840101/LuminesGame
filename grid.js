var objGrid = function () {
	this.g = [];
	this.score = 0;
	for (var r = 0; r < row; r++) {
		this.g[r] = [];
		for (var c = 0; c < column; c++) {
			this.g[r][c] = false;
		}
	}
	this.C1 = '#cccccc';
	this.C1T = 'rgba(144, 144, 144, 0.5)';
	this.C1Shade = 'rgba(255, 255, 255, 0.9)';
	this.C2 = '#ff0000';
	this.C2T = 'rgba(255, 0, 0, 0.5)';
	this.C2Shade = 'rgba(0, 0, 0, 0.25)';
	this.falingBlock = [];
	this.preList = [];
	//var testList = [12, 0, 2, 6];
	for (var i = 0; i < 4; i++) {
		var tmp = Math.floor(Math.random() * 16);
		//var tmp = testList[i];
		this.preList[i] = { tag: tmp, c: [] }
		for (var j = 0; j < 4; j++) {
			this.preList[i].c[j] = ((tmp % 2) == 1) ? 'C2' : 'C1';
			tmp = Math.floor(tmp / 2);
		}
	}
	this.preListDisplay = [];
	for (var i = 0; i < 4; i++) {
		this.preListDisplay[i] = [];
		for (var j = 0; j < 4; j++) {
			this.preListDisplay[i][j] = { show: true, color: this.preList[i].c[j] }
		}
	}
}

objGrid.prototype.nextBlock = function () {
	var result = this.preList[0];
	this.preList.splice(0, 1);
	var tmp = Math.floor(Math.random() * 16);
	this.preList[3] = { tag: tmp, c: [] };
	for (var i = 0; i < 4; i++) {
		this.preList[3].c[i] = ((tmp % 2) == 1) ? 'C2' : 'C1';
		tmp = Math.floor(tmp / 2);
	}

	var fallSpeed = (3 / FPS * 10) * -1;
	for (var i = 0; i < 4; i++) {
		var tmp1 = { x: 0, y: 0 };
		var tmp2 = { x: 0, y: 0 };
		switch (i) {
			case 0:
				tmp1.x = 1; tmp1.y = 2;
				tmp2.x = 1; tmp2.y = -1;
				break;
			case 1:
				tmp1.x = 1; tmp1.y = 3;
				tmp2.x = 1; tmp2.y = 0;
				break;
			case 2:
				tmp1.x = 2; tmp1.y = 3;
				tmp2.x = 2; tmp2.y = 0;
				break;
			case 3:
				tmp1.x = 2; tmp1.y = 2;
				tmp2.x = 2; tmp2.y = -1;
				break;
		}
		this.falingBlock.push({
			destination: { x: tmp2.x, y: tmp2.y },
			current: { x: tmp1.x, y: tmp1.y },
			fallSpeed: fallSpeed,
			c: result.c[i],
			source: 1
		});
	}
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			var tmp1 = { x: 0, y: 0 };
			var tmp2 = { x: 0, y: 0 };
			switch (j) {
				case 0:
					tmp1.x = 1; tmp1.y = (3 * i + 5);
					tmp2.x = 1; tmp2.y = (3 * i + 2);
					break;
				case 1:
					tmp1.x = 1; tmp1.y = (3 * i + 6);
					tmp2.x = 1; tmp2.y = (3 * i + 3);
					break;
				case 2:
					tmp1.x = 2; tmp1.y = (3 * i + 6);
					tmp2.x = 2; tmp2.y = (3 * i + 3);
					break;
				case 3:
					tmp1.x = 2; tmp1.y = (3 * i + 5);
					tmp2.x = 2; tmp2.y = (3 * i + 2);
					break;
			}
			this.falingBlock.push({
				destination: { x: tmp2.x, y: tmp2.y },
				current: { x: tmp1.x, y: tmp1.y },
				fallSpeed: fallSpeed,
				c: this.preList[i].c[j],
				source: 1
			});
			this.preListDisplay[i][j].show = false;
			this.preListDisplay[i][j].color = this.preList[i].c[j];
		}
	}
	return result;
}

objGrid.prototype.drawGroup = function () {
	for (var r = 2; r < row; r++) {
		for (var c = 0; c < column; c++) {
			if (this.g[r][c] !== false) {
				if (this.g[r][c].group !== false) {
					ctx.fillStyle = '#000000';
					ctx.font = Math.floor(unit * 3 / 4) + "px Microsoft JhengHei";
					ctx.fillText(this.g[r][c].group, (c + adjustX) * unit, (r + adjustY + 1) * unit);
				}
			}
		}
	}
}

objGrid.prototype.draw = function () {
	ctx.font = (unit * 2 + "px Microsoft JhengHei");
	ctx.fillStyle = 'rgb(255, 255, 255)';
	ctx.fillText(this.score, 20.3 * unit, 13 * unit);
	for (var r = 0; r < row; r++) {
		for (var c = 0; c < column; c++) {
			if (this.g[r][c].show) {
				drawSingleBlock(this.g[r][c].color, (c + adjustX), (r + adjustY), (this.g[r][c].group === false), false);
			}
		}
	}
	if (state != gameState.gaming) return;
	//console.log(this.preListDisplay);

	for (var i = 0; i < 4; i++) {
		var tmp = this.preListDisplay[i];
		for (var j = 0; j < 4; j++) {
			if (tmp[j].show) {
				switch (j) {
					case 0:
						drawSingleBlock(tmp[j].color, 1, (3 * i + 2), true, false);
						break;
					case 1:
						drawSingleBlock(tmp[j].color, 1, (3 * i + 3), true, false);
						break;
					case 2:
						drawSingleBlock(tmp[j].color, 2, (3 * i + 3), true, false);
						break;
					case 3:
						drawSingleBlock(tmp[j].color, 2, (3 * i + 2), true, false);
						break;
				}

			}
		}
	}
	if (pause) return;
	//{destination: {x: ,y: }, current: {x: ,y: }, fallSpeed: (unit), source:}//Json格式的樣版
	var check = [];
	var l = this.falingBlock.length;
	for (var i = 0; i < l; i++) {//畫移動中的方塊
		var curretObj = this.falingBlock[i];
		//console.log(curretObj);
		drawSingleBlock(curretObj.c, curretObj.current.x, curretObj.current.y, true, (curretObj.source == 0));
		this.falingBlock[i].current.y += curretObj.fallSpeed;//繼續移動
		if (((this.falingBlock[i].current.y >= curretObj.destination.y) && curretObj.source == 0) ||
			((this.falingBlock[i].current.y <= curretObj.destination.y) && curretObj.source == 1)
		) {//停止移動
			var tmp = curretObj.destination;
			if (curretObj.source == 0) {//grid 動畫
				/*this.g[tmp.y-adjustY][tmp.x-adjustX].show = true;
				check[check.length] = {x: tmp.x-adjustX, y: tmp.y-adjustY};*/
				//group.addCheck(tmp.x-adjustX, tmp.y-adjustY);//落地後可以判斷group
			}
			else if (curretObj.source == 1) {//未來方塊 動畫
				var tmpY = Math.floor(tmp.y / 3);
				var tmpX = (tmp.y % 3 == 0) ? [1, 2] : [0, 3];
				tmpX = (tmp.x == 1) ? tmpX[0] : tmpX[1];
				if (tmp.y % 3 == 0) tmpY--;
				//console.log(tmpX+' '+tmpY);
				if (tmpY >= 0) this.preListDisplay[tmpY][tmpX].show = true;

			}
			this.falingBlock[i] = false;
			this.falingBlock.splice(i, 1);
			l--;
			i--;
		}
	}
	l = check.length;
	for (var i = 0; i < l; i++) {
		group.addCheck(check[i].x, check[i].y);
	}
	//cover
	ctx.beginPath();
	ctx.fillStyle = '#000000';
	ctx.rect(unit, 0, unit * 2, unit * 1);
	ctx.rect(unit, 15 * unit, unit * 2, unit * 2);
	ctx.fill();
	ctx.closePath();;
}

objGrid.prototype.identifyGroup = function (x, y) {//
	//console.log('    '+grid.g[y][x+1].group +' '+ grid.g[y+1][x+1].group +' '+ grid.g[y+1][x].group +' '+ grid.g[y][x].group);
	var resultList = [];
	if (this.g[y][x].group !== false) {
		if (resultList.indexOf(this.g[y][x].group) == -1) resultList[resultList.length] = this.g[y][x].group;
	}
	if (this.g[y][x + 1].group !== false) {
		if (resultList.indexOf(this.g[y][x + 1].group) == -1) resultList[resultList.length] = this.g[y][x + 1].group;
	}
	if (this.g[y + 1][x + 1].group !== false) {
		if (resultList.indexOf(this.g[y + 1][x + 1].group) == -1) resultList[resultList.length] = this.g[y + 1][x + 1].group;
	}
	if (this.g[y + 1][x].group !== false) {
		if (resultList.indexOf(this.g[y + 1][x].group) == -1) resultList[resultList.length] = this.g[y + 1][x].group;
	}
	return resultList;
}

objGrid.prototype.clearGroup = function (x, y) {
	this.g[y][x] = false;
	this.g[y][x + 1] = false;
	this.g[y + 1][x + 1] = false;
	this.g[y + 1][x] = false;
}

objGrid.prototype.unGroup = function (x, y) {
	this.g[y][x].group = false;
	this.g[y][x + 1].group = false;
	this.g[y + 1][x + 1].group = false;
	this.g[y + 1][x].group = false;
}

objGrid.prototype.fillGroup = function (x, y, id) {
	if (this.g[y][x].group != id) this.g[y][x].group = id;
	if (this.g[y][x + 1].group != id) this.g[y][x + 1].group = id;
	if (this.g[y + 1][x + 1].group != id) this.g[y + 1][x + 1].group = id;
	if (this.g[y + 1][x].group != id) this.g[y + 1][x].group = id;
}

objGrid.prototype.adjust = function () {
	for (var i = 0; i < column; i++) {//從每個column中
		var tmp1 = row - 1;
		//console.log(i);
		while ((this.g[tmp1][i] !== false) && tmp1 >= 0) tmp1--;//找底層連續方塊的頂端
		if (tmp1 > 2) {//可能有需要下墜的方塊
			var tmp2 = tmp1;
			while ((this.g[tmp2][i] === false) && tmp2 >= 2) {//找到第一個需要下墜的方塊
				//console.log('  '+tmp2);
				tmp2--;
			}
			//tmp2 --;
			//if((this.g[tmp2][i].group === false) && tmp2 >= 0){
			if (tmp2 > 1) {
				while (tmp2 > 1) {
					if (this.g[tmp2][i]) {//需要下墜的方塊之間若是有空格就跳過
						if (this.g[tmp2][i].group !== false) group.unGroup(this.g[tmp2][i].group);
						var fallSpeed = (tmp1 - tmp2) / FPS * 10;
						this.falingBlock[this.falingBlock.length] = {
							destination: { x: (i + adjustX), y: (tmp1 + adjustY) },
							current: { x: (i + adjustX), y: (tmp2 + fallSpeed + adjustY) },
							fallSpeed: fallSpeed,
							c: this.g[tmp2][i].color,
							source: 0
						};

						group.addCheck(i, tmp1);
						this.g[tmp1][i] = { group: false, show: true, color: this.g[tmp2][i].color };
						this.g[tmp2][i] = false;
						tmp1--;
					}
					tmp2--;
				}
			}
			//}
		}
	}
}