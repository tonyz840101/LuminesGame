var objGroupControl = function(){
	this.checkList = [];
	this.recheckList = [];
	this.groupList = [];//{id: ,start: ,end: ,score: 1, member: [{x: , y: }], scanned: false}
}
//{group: false, show: true, color: this.Position[i].c};
objGroupControl.prototype.findGroupIndex = function(id){
	var l = this.groupList.length;
	for(var i = 0; i < l; i ++){
		if(this.groupList[i].id == id) return i;
	}
	return -1;
}

objGroupControl.prototype.addCheck = function(x, y){
	if(x-1 >= 0){
		if(grid.g[y][x-1] !== false){
			//console.log((x-1)+' '+y);
			//console.log(grid.g[y][x-1]);
			this.checkList[this.checkList.length] = {x: x-1, y: y};
		}
	}
	this.checkList[this.checkList.length] = {x: x, y: y};
}

objGroupControl.prototype.scanned = function(id){
	//var doDelete = false;
	//console.log(this.groupList.length);
	var l = this.groupList.length;
	//console.log(l);
	var l2 = scanner.scanningId.length, l3 = scanner.preDelete.length;
	for(var i = 0; i < l; i ++){
		var index = {n: Math.floor(scanner.X/unit), r: scanner.X/unit};
			//console.log(this.groupList[i].id+'  '+this.groupList[i].scanned+' '+(index.r));
		if(this.groupList[i].scanned === false && this.groupList[i].start == index.n && index.r-this.groupList[i].start < 1.5){
			
			//console.log('add id '+this.groupList[i].id);
			this.groupList[i].scanned = true;
			scanner.scanningId[l2] = this.groupList[i].id;
			l2 ++;
		}
	}
	l = this.groupList.length;
	l2 = scanner.scanningId.length;
	l3 = scanner.preDelete.length;
	for(var i = 0; i < l; i ++){//scanningId若不是空的就不adjust();
		var index = {n: Math.floor(scanner.X/unit), r: scanner.X/unit};
		if(this.groupList[i].scanned === true && this.groupList[i].end < index.n){
			//console.log('do '+this.groupList[i].id);
			//console.log('delete '+this.groupList[i].id+'??');
			var ind = scanner.scanningId.indexOf(this.groupList[i].id);
			//console.log(ind);
			if(ind != -1){
				//console.log('transfering...');
				scanner.preDelete[l3] = scanner.scanningId[ind];
				l3 ++;
				scanner.scanningId.splice(ind, 1);
				l2 --;
			}
			if(l2 == 0 && l3 > 0){
				//console.log('clear');
				for(var j = 0; j < l3; j ++){
					//console.log(this.findGroupIndex(scanner.preDelete[j]));
					var score = this.groupList[this.findGroupIndex(scanner.preDelete[j])].score;
					scanner.Score += score;
					grid.score += score;
					this.deleteGroup(scanner.preDelete[j]);
					l --;
					i --;
					scanner.preDelete.splice(j, 1);
					l3 --;
					j --;
				}
				grid.adjust();
			}
			//doDelete = true;
		}
	}
	/*console.log(scanner.scanningId);
	console.log(scanner.preDelete);*/
}

objGroupControl.prototype.addMember = function(x, y, id){
	var tmp = this.findGroupIndex(id), e = true;
	var a = this.groupList[tmp];
	var l = a.member.length;
	//console.log(tmp);
	//if(tmp !== false){
		//tmp = this.groupList[tmp];
	//this.groupList[tmp].member[this.groupList[tmp].member.length] = {x: x, y: y};
	//Y優先，Y相同，再比X
	for(var i = 0; i < l; i ++){
		if(a.member[i].y > y){
			a.member.splice(i,0,{x: x, y: y});
			//console.log('Y greater');
			e = false;
			break;
		}
		else if(a.member[i].y == y){
			if(a.member[i].x > x){
				a.member.splice(i,0,{x: x, y: y});
				//console.log('X greater');
				e = false;
				break;
			}
			else if(i == l-1) {
				a.member.push({x: x, y: y});
				//console.log('Last');
				e = false;
				break;
			}
		}
		else if(i == l-1) {
			a.member.push({x: x, y: y});
			//console.log('Last');
			e = false;
			break;
		}
	}
	if(!e){
		a.score ++;
		//console.log('      exist '+this.groupList[tmp].score);
		a.start = Math.min(x, a.start);
		a.end = Math.max(x+1, a.end);
		grid.fillGroup(x, y, id);
	}
	else console.log('addError');
	//}
}

objGroupControl.prototype.mergeGroup = function(x, y, identified){
	var ind1 = this.findGroupIndex(identified[0]), ind2 = this.findGroupIndex(identified[1]);//index
	var minor = -1, major = -1;
	
	if(this.groupList[ind1].id > this.groupList[ind2].id){//id2併入id1，砍掉id2
		minor = identified[1];
		major = identified[0];
	}
	else{//id1併入id2，砍掉id1
		minor = identified[0];
		major = identified[1];
	}
	
	var minorInd = {a: scanner.scanningId.indexOf(minor), b: scanner.preDelete.indexOf(minor)};
	var majorInd = {a: scanner.scanningId.indexOf(major), b: scanner.preDelete.indexOf(major)};
	if(minorInd.a != -1 || majorInd.a != -1){
		if(minorInd.a != -1) scanner.scanningId.splice(minorInd.a, 1);
		else if(minorInd.b != -1) scanner.preDelete.splice(minorInd.b, 1);
		if(majorInd.a == -1){
			scanner.scanningId[scanner.scanningId.length] = major;
			if(majorInd.b != -1) scanner.preDelete.splice(majorInd.b, 1);
		}
	}
	else{
		if(minorInd.b != -1 || majorInd.b != -1){
			if(minorInd.b != -1)
				scanner.preDelete.splice(minorInd.b, 1);
			if(majorInd.b != -1)
				scanner.preDelete.splice(majorInd.b, 1);
			scanner.scanningId[scanner.scanningId.length] = major;
		}
	}
	
	if(minor == identified[1]){//id2併入id1，砍掉id2
		this.addMember(x, y, identified[0]);
		for(var i = 0; i < this.groupList[ind2].score; i ++){
			this.addMember(this.groupList[ind2].member[i].x, this.groupList[ind2].member[i].y, identified[0]);
		}
		if(this.groupList[ind2].scanned) this.groupList[ind1].scanned = true;
		this.groupList.splice(ind2, 1);
	}
	else{//id1併入id2，砍掉id1
		this.addMember(x, y, identified[1]);
		for(var i = 0; i < this.groupList[ind1].score; i ++){
			this.addMember(this.groupList[ind1].member[i].x, this.groupList[ind1].member[i].y, identified[1]);
		}
		if(this.groupList[ind1].scanned) this.groupList[ind2].scanned = true;
		this.groupList.splice(ind1, 1);
	}
	//console.log('Minor: '+minor);
}

objGroupControl.prototype.unGroup = function(id){
	var gpId = this.findGroupIndex(id);
	if(gpId == -1) return;
	var gp = this.groupList[gpId];
	var l = gp.member.length;
	for(var i = 0; i < l; i ++){
		var x = gp.member[i].x, y = gp.member[i].y;
		grid.unGroup(gp.member[i].x, gp.member[i].y);
	}
	this.groupList.splice(gpId, 1);
}

objGroupControl.prototype.makeGroup = function(x, y){
	var identified = grid.identifyGroup(x, y);
	var percentage = (scanner.X/unit - x)/2;
	if(percentage > 1) percentage = 0;
	//console.log('    group '+x+' '+y);
	
	//if(Math.floor(scanner.X/unit) == x+1){//這組右半部正在被掃描
	if(percentage > 0.75){//這組右半部正在被掃描
		this.recheckList.push({x: x, y: y});
		//console.log('recheck');
		return;
	}
	//console.log(identified);
	switch(identified.length){
		case 0://new
			//console.log('      new');
			/*if(percentage > 0.75){//這組右半部正在被掃描
				this.recheckList[this.recheckList.length] = {x: x, y: y};
				console.log('recheck');
				return;
			}*/
			var tmp = 1;
			while(this.findGroupIndex(tmp) != -1)tmp ++;
			grid.fillGroup(x, y, tmp);
			this.groupList[this.groupList.length] = {id: tmp, start: x, end: x+1, score: 1, member: [{x: x, y: y}], scanned: false};
			
			effect.effectList[effect.effectList.length] = {type: 0, frame: FPS/2, x: x, y: y};
			break;
		case 1://exist
			//if(this.groupList[this.findGroupIndex(identified[0])].scanned) return;
			if(grid.g[y][x+1].group == grid.g[y+1][x+1].group && grid.g[y+1][x+1].group == grid.g[y+1][x].group && grid.g[y+1][x].group == grid.g[y][x].group){
				//console.log('redundant');
				return;
			}
			/*else if(percentage > 0.75){//這組右半部正在被掃描
				this.recheckList[this.recheckList.length] = {x: x, y: y};
				console.log('recheck');
				return;
			}*/
			//console.log('      exist ');
			this.addMember(x, y, identified[0]);
			
			effect.effectList[effect.effectList.length] = {type: 0, frame: FPS/2, x: x, y: y};
			break;
		case 2://merge
			//console.log('      2Merge');
			this.mergeGroup(x, y, identified);
			
			effect.effectList[effect.effectList.length] = {type: 0, frame: FPS/2, x: x, y: y};
			/*var ind1 = this.findGroupIndex(identified[0]), ind2 = this.findGroupIndex(identified[1]);//index
			var minor = -1, major = -1;
			
			if(this.groupList[ind1].id > this.groupList[ind2].id){//id2併入id1，砍掉id2
				minor = identified[1];
				major = identified[0];
			}
			else{//id1併入id2，砍掉id1
				minor = identified[0];
				major = identified[1];
			}
			
			var minorInd = {a: scanner.scanningId.indexOf(minor), b: scanner.preDelete.indexOf(minor)};
			var majorInd = {a: scanner.scanningId.indexOf(major), b: scanner.preDelete.indexOf(major)};
			if(minorInd.a != -1 || majorInd.a != -1){
				if(minorInd.a != -1) scanner.scanningId.splice(minorInd.a, 1);
				else if(minorInd.b != -1) scanner.preDelete.splice(minorInd.b, 1);
				if(majorInd.a == -1){
					scanner.scanningId[scanner.scanningId.length] = major;
					if(majorInd.b != -1) scanner.preDelete.splice(majorInd.b, 1);
				}
			}
			else{
				if(minorInd.b != -1 || majorInd.b != -1){
					if(minorInd.b != -1)
						scanner.preDelete.splice(minorInd.b, 1);
					if(majorInd.b != -1)
						scanner.preDelete.splice(majorInd.b, 1);
					scanner.scanningId[scanner.scanningId.length] = major;
				}
			}
			
			if(minor == identified[1]){//id2併入id1，砍掉id2
				this.addMember(x, y, identified[0]);
				for(var i = 0; i < this.groupList[ind2].score; i ++){
					this.addMember(this.groupList[ind2].member[i].x, this.groupList[ind2].member[i].y, identified[0]);
				}
				if(this.groupList[ind2].scanned) this.groupList[ind1].scanned = true;
				this.groupList.splice(ind2, 1);
			}
			else{//id1併入id2，砍掉id1
				this.addMember(x, y, identified[1]);
				for(var i = 0; i < this.groupList[ind1].score; i ++){
					this.addMember(this.groupList[ind1].member[i].x, this.groupList[ind1].member[i].y, identified[1]);
				}
				if(this.groupList[ind1].scanned) this.groupList[ind2].scanned = true;
				this.groupList.splice(ind1, 1);
			}
			*/
			break;
		case 3://merge, may not be possible
			console.log('      3Merge needed');
			break;
		case 4://error
			console.log('      4Error');
			break;
		default:
			console.log('      ????');
			break;
	}
}

objGroupControl.prototype.deleteGroup = function(id){//刪group & all block inside
	var gpId = this.findGroupIndex(id);
	if(gpId == -1) return;
	var gp = this.groupList[gpId];
	var l = gp.member.length;
	for(var i = 0; i < l; i ++){
		var x = gp.member[i].x, y = gp.member[i].y;
		effect.effectList.push({type: 3, frame: FPS/5, x: x+adjustX, y: y+adjustY});
		effect.effectList.push({type: 3, frame: FPS/5, x: x+1+adjustX, y: y+adjustY});
		effect.effectList.push({type: 3, frame: FPS/5, x: x+adjustX, y: y+1+adjustY});
		effect.effectList.push({type: 3, frame: FPS/5, x: x+1+adjustX, y: y+1+adjustY});
		grid.clearGroup(x, y);
	}
	this.groupList.splice(gpId, 1);
	//console.log('delete group'+id);
}

function drawSingleGroup(x, y){
	switch(grid.g[y][x].color){
		case 'C1':
			ctx.strokeStyle = grid.C1;
			break;
		case 'C2':
			ctx.strokeStyle = grid.C2;
			break;
	}
	ctx.lineWidth = (shade+1)*2;
	ctx.beginPath();
	ctx.moveTo((x+adjustX+1)*unit, (y+adjustY)*unit);
	ctx.lineTo((x+adjustX+1)*unit, (y+adjustY+2)*unit);
	ctx.moveTo((x+adjustX)*unit, (y+adjustY+1)*unit);
	ctx.lineTo((x+adjustX+2)*unit, (y+adjustY+1)*unit);
	ctx.stroke();
	ctx.closePath();

	ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';//'rgba(255, 255, 0, 0.9)';
	ctx.lineWidth = shade+1;
	ctx.beginPath();
	ctx.rect((x+adjustX)*unit+shade/2, (y+adjustY)*unit+shade/2, 2*unit-shade, 2*unit-shade);
	ctx.stroke();
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.rect((x+adjustX)*unit, (y+adjustY)*unit, 2*unit, 2*unit);
	ctx.stroke();
	ctx.closePath();
}

function drawScannedGroup(x, y, X){
	if(X <= x) return;
	var tmp = [{x:x,y:y}, {x:x,y:y+1}, {x:x+1,y:y}, {x:x+1,y:y+1}];
	for(var i = 0; i < 4; i ++){
		if(X>tmp[i].x){
			ctx.beginPath();
			ctx.fillStyle = 'rgb(20, 20, 20)';
			if(X>tmp[i].x+1){
				ctx.rect((tmp[i].x+adjustX)*unit+1, (tmp[i].y+adjustY)*unit+1, unit-2, unit-2);
			}
			else{
				ctx.rect((tmp[i].x+adjustX)*unit+1, (tmp[i].y+adjustY)*unit+1, (X-tmp[i].x)*unit-1, unit-2);
			}
			ctx.fill();
			ctx.closePath();
			
			
			ctx.strokeStyle = 'rgb(77, 77, 77)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			if(X>=tmp[i].x+1) 
				ctx.rect((tmp[i].x+adjustX)*unit, (tmp[i].y+adjustY)*unit, unit, unit);
			else{
				ctx.moveTo((X+adjustX)*unit, (tmp[i].y+adjustY)*unit);
				ctx.lineTo((tmp[i].x+adjustX)*unit, (tmp[i].y+adjustY)*unit);
				ctx.lineTo((tmp[i].x+adjustX)*unit, (tmp[i].y+adjustY+1)*unit);
				ctx.lineTo((X+adjustX)*unit, (tmp[i].y+adjustY+1)*unit);
			}
				ctx.stroke();
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
			ctx.lineWidth = shade+1;
			if(X>=tmp[i].x+1)
				ctx.rect((tmp[i].x+adjustX)*unit+shade, (tmp[i].y+adjustY)*unit+shade, unit-2*shade, unit-2*shade);
			else{
				ctx.moveTo((X+adjustX)*unit, (tmp[i].y+adjustY)*unit+shade);
				ctx.lineTo((tmp[i].x+adjustX)*unit+shade, (tmp[i].y+adjustY)*unit+shade);
				ctx.lineTo((tmp[i].x+adjustX)*unit+shade, (tmp[i].y+adjustY+1)*unit-shade);
				ctx.lineTo((X+adjustX)*unit, (tmp[i].y+adjustY+1)*unit-shade);
			}
			ctx.stroke();
			ctx.closePath();
		}
	}
}

objGroupControl.prototype.draw = function(){
	var l = this.groupList.length;
	for(var i = 0; i < l; i ++){
		var l2 = this.groupList[i].member.length;
		for(var j = 0; j < l2; j ++)
			drawSingleGroup(this.groupList[i].member[j].x, this.groupList[i].member[j].y);
	}
	for(var i = 0; i < l; i ++){
		var l2 = this.groupList[i].member.length;
		for(var j = 0; j < l2; j ++)
			if(this.groupList[i].scanned) drawScannedGroup(this.groupList[i].member[j].x, this.groupList[i].member[j].y, scanner.X/unit);
	}
}

objGroupControl.prototype.check = function(){
	/*while(this.checkList.length){
		this.checkGroup(this.checkList[0].x, this.checkList[0].y);
		this.checkList.splice(0, 1);
	}*/
	var l = this.checkList.length;
	for(var i = 0; i < l; i ++){
		this.checkGroup(this.checkList[i].x, this.checkList[i].y);
	}
	this.checkList = this.recheckList;
	this.recheckList = [];
}

objGroupControl.prototype.checkGroup = function(x, y){
	if(y == 11) return;
	if(grid.g[y][x] === false) return;
	var colorStd = grid.g[y][x].color;
	var preMake = [];
	//console.log('check '+x+' '+y+' '+colorStd);
	//identifyGroup
	if(x-1 >= 0){
		var tmp = [grid.g[y][x-1], grid.g[y+1][x-1], grid.g[y+1][x]];
		//console.log('  left');
		if(tmp[0] && tmp[1] && tmp[2]){
			//console.log(grid.g[y][x-1].color+' '+grid.g[y+1][x-1].color+' '+grid.g[y+1][x].color);
			if(tmp[0].color == colorStd && tmp[1].color == colorStd && tmp[2].color == colorStd){
				if(tmp[0].show && tmp[1].show && tmp[2].show){
					//console.log('left');
					this.makeGroup(x-1, y);
				}
				/*else{
					if(!tmp[0].show) console.log('   unShown '+(x-1)+' '+y+' '+tmp[0].show);
					if(!tmp[1].show) console.log('   unShown '+(x-1)+' '+(y+1)+' '+tmp[1].show);
					if(!tmp[2].show) console.log('   unShown '+x+' '+(y+1)+' '+tmp[2].show);
				}*/
			}
			/*else{
				console.log(tmp[0].color+' '+tmp[1].color+' '+tmp[2].color);
				console.log('   inConsist');
			}*/
		}
		//else console.log('   nonExist');
	}
	if(x+1 < 16){
		var tmp = [grid.g[y][x+1], grid.g[y+1][x+1], grid.g[y+1][x]];
		//console.log('  right');
		if(tmp[0] && tmp[1] && tmp[2]){
			//console.log(grid.g[y][x+1].color+' '+grid.g[y+1][x+1].color+' '+grid.g[y+1][x].color);
			if(tmp[0].color == colorStd && tmp[1].color == colorStd && tmp[2].color == colorStd){
				if(tmp[0].show && tmp[1].show && tmp[2].show){
					//console.log('right');
					this.makeGroup(x, y);
				}
				/*else{
					if(!tmp[0].show) console.log('   unShown '+(x-1)+' '+y+' '+tmp[0].show);
					if(!tmp[1].show) console.log('   unShown '+(x-1)+' '+' '+(y+1)+tmp[1].show);
					if(!tmp[2].show) console.log('   unShown '+x+' '+(y+1)+' '+tmp[2].show);
				}*/
			}
			/*else{
				console.log(tmp[0].color+' '+tmp[1].color+' '+tmp[2].color);
				console.log('   inConsist');
			}*/
		}
		//else console.log('   nonExist');
	}
}

objGroupControl.prototype.finalCount = function(){
	this.check();
	var score = 0;
	var l = this.groupList.length;
	for(var i = 0; i < l; i ++){
		score += this.groupList[i].score;
		this.deleteGroup(this.groupList[i].id);
		l --;
		grid.adjust();
	}
	grid.score += score;
	effect.effectList.push({type: 1, frame: FPS, x: 20.3*unit, y: 11.7*unit, str: '+'+score});
}