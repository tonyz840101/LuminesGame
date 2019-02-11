var controlEffect = function(){
	this.effectList = [];//{type: , frame: , x: , y:}
}

controlEffect.prototype.square = function(x, y, frame){
	//console.log('square');
	var process = frame/FPS;

	ctx.strokeStyle = 'rgba(255, 255, 255, '+(0.5-(process/2))+')';//'rgba(255, 255, 0, 0.9)';
	ctx.lineWidth = shade+1;
	ctx.beginPath();
	ctx.rect((x+adjustX-process)*unit+shade/2, (y+adjustY-process)*unit+shade/2, (2*process+2)*unit-shade, (2*process+2)*unit-shade);
	ctx.stroke();
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.rect((x+adjustX-process)*unit, (y+adjustY-process)*unit, (2*process+2)*unit, (2*process+2)*unit);
	ctx.stroke();
	ctx.closePath();
}

controlEffect.prototype.word = function(str, x, y, frame, shrink){
	var process = frame/FPS/2;
	ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
	ctx.font = Math.floor(unit*2) + "px Microsoft JhengHei";
	ctx.fillText(str, x, y);
	if(!shrink) return;
	ctx.fillStyle = 'rgba(255, 255, 255, '+(0.5-process/2)+')';
	ctx.font = Math.floor(unit*(2+5*process)) + "px Microsoft JhengHei";
	ctx.fillText(str, x, y);
}

controlEffect.prototype.shatterBlock = function(x, y, frame){
	var process = frame/(FPS/5);
	var size = unit;
	var shortW = size/2*process;
	var longW = size-shortW;
	var color = 255 - Math.floor(255*process);
	ctx.fillStyle = 'rgba('+color+', '+color+', '+color+', 0.8)';
	ctx.beginPath();
	ctx.rect(x*unit+1, y*unit+1, shortW-1, longW-1);
	ctx.rect(x*unit+shortW, y*unit+1, longW-1, shortW-1);
	ctx.rect(x*unit+1, y*unit+size-shortW, longW-1, shortW-1);
	ctx.rect(x*unit+size-shortW, y*unit+shortW, shortW-1, longW-1);
	ctx.fill();
	ctx.closePath();
}

controlEffect.prototype.redScreen = function(frame){
	var process = frame/(FPS/5);
	
	ctx.fillStyle = 'rgba(255, 0, 0, '+(process*0.8)+')';
	ctx.beginPath();
	ctx.rect(0, 0, unit*24, unit*16);
	ctx.fill();
	ctx.closePath();
}

controlEffect.prototype.draw = function(){
	var l = this.effectList.length;
	for(var i = 0; i < l; i ++){
		switch(this.effectList[i].type){
			case 0:
				this.square(this.effectList[i].x, this.effectList[i].y, this.effectList[i].frame);
				break;
			case 1:
				this.word(this.effectList[i].str, this.effectList[i].x, this.effectList[i].y, this.effectList[i].frame,true);
				break;
			case 2:
				this.word(this.effectList[i].str, this.effectList[i].x, this.effectList[i].y, this.effectList[i].frame,false);
				break;
			case 3://x,y are index
				this.shatterBlock(this.effectList[i].x, this.effectList[i].y, this.effectList[i].frame);
				break;
			case 4://don't need x,y
				this.redScreen(this.effectList[i].frame);
				break;
		}
		if(!pause) this.effectList[i].frame --;
		if(this.effectList[i].frame == 0){
			this.effectList.splice(i, 1);
			l --;
			i --;
		}
	}
}

controlEffect.prototype.countDown = function(frame){
	/*if(frame > 3*FPS)
		this.word('3', 11.5*unit, 9.8*unit, frame-3*FPS);
	else if(frame > 2*FPS)
		this.word('2', 11.5*unit, 9.8*unit, frame-2*FPS);
	else if(frame > FPS)
		this.word('1', 11.5*unit, 9.8*unit, frame-1*FPS);
	else
		this.word('GO', 10.5*unit, 9.8*unit, frame);*/
	if(frame == 4*FPS)
		this.effectList[this.effectList.length] = {type: 1, frame: FPS, x: 11.5*unit, y: 9.8*unit, str: '3'};
	if(frame == 3*FPS)
		this.effectList[this.effectList.length] = {type: 1, frame: FPS, x: 11.5*unit, y: 9.8*unit, str: '2'};
	if(frame == 2*FPS)
		this.effectList[this.effectList.length] = {type: 1, frame: FPS, x: 11.5*unit, y: 9.8*unit, str: '1'};
	if(frame == FPS)
		this.effectList[this.effectList.length] = {type: 1, frame: FPS, x: 10.5*unit, y: 9.8*unit, str: 'GO'};
}