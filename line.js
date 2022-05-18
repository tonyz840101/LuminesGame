
var line = function () {
	this.X = 0;
	this.Speed = 4;
	this.LastScanned = -1;
	this.Blink = 0;
	this.Score = 0;
	this.scanningId = [];//掃描沒結束的
	this.preDelete = [];//掃描結束後放到這裡，等scanningId空了或掃到底才刪除+調整
}

line.prototype.draw = function () {
	if (state == gameState.starting) return;
	ctx.beginPath();
	ctx.lineWidth = 8;
	ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
	ctx.moveTo(this.X + adjustX * unit, (adjustY + 2) * unit); ctx.lineTo(this.X + adjustX * unit, (adjustY + 2) * unit + edgeY);
	ctx.stroke();
	ctx.lineWidth = 6;
	ctx.strokeStyle = 'rgba(255, 128, 128, 0.4)';
	ctx.moveTo(this.X + adjustX * unit, (adjustY + 2) * unit); ctx.lineTo(this.X + adjustX * unit, (adjustY + 2) * unit + edgeY);
	ctx.stroke();
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
	ctx.moveTo(this.X + adjustX * unit, (adjustY + 2) * unit); ctx.lineTo(this.X + adjustX * unit, (adjustY + 2) * unit + edgeY);
	ctx.stroke();
	ctx.closePath();

	ctx.font = Math.floor(unit * 3 / 4) + "px Microsoft JhengHei";
	ctx.fillStyle = 'rgb(255, 255, 255)';
	ctx.fillText(this.Score, this.X + (adjustX - 1.1) * unit, (adjustY + 1.9) * unit);
	//ctx.fillText(this.X/unit, this.X + (adjustX-1.1)*unit, (adjustY+1.9)*unit);
	ctx.beginPath();
	ctx.lineWidth = 2;
	if (this.Blink > FPS) ctx.strokeStyle = 'rgba(255, 255, 255, ' + (1.5 - this.Blink / FPS / 2) + ')';
	else ctx.strokeStyle = 'rgba(255, 255, 255, ' + (this.Blink / FPS / 2 + 0.5) + ')';
	ctx.rect(this.X + (adjustX - 2) * unit, (adjustY + 1.2) * unit, 2 * unit, 0.8 * unit);
	ctx.moveTo(this.X + adjustX * unit, (adjustY + 1.2) * unit); ctx.lineTo(this.X + (adjustX + 0.5) * unit, (adjustY + 1.6) * unit);
	ctx.lineTo(this.X + adjustX * unit, (adjustY + 2) * unit);
	ctx.stroke();
	ctx.closePath();

	if (pause || state != gameState.gaming) return;
	this.X += this.Speed * blockPerSec;
	if (this.X >= edgeX + unit * 0.3) {
		let l = this.scanningId.length;
		for (let i = 0; i < l; i++) {
			this.preDelete[this.preDelete.length] = this.scanningId[i];
		}
		if (this.scanningId.length == 0 && this.preDelete.length > 0) {
			//console.log('clear');
			l = this.preDelete.length;
			for (let j = 0; j < l; j++) {
				console.log(group.findGroupIndex(this.preDelete[j]));
				let score = group.groupList[group.findGroupIndex(this.preDelete[j])].score;
				this.Score += score;
				grid.score += score;
				group.deleteGroup(this.preDelete[j]);
				this.preDelete.splice(j, 1);
				l--;
				j--;
			}
			grid.adjust();
		}

		grid.score += this.Score;
		//console.log('Total score: '+grid.score);
		this.X = 0;
		this.Score = 0;
		this.scanningId = [];
		this.preDelete = [];
	}
	this.Blink++;
	if (this.Blink == FPS * 2) this.Blink = 0
}
line.prototype.scanning = function () {
	if (Math.floor(Math.floor(this.X) / unit) != this.LastScanned) {
		this.LastScanned = Math.floor(Math.floor(this.X) / unit);
		group.scanned(this.LastScanned);
		//console.log(this.LastScanned);
	}
}