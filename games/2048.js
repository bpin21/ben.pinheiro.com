let cnv, ctx;
const colors = ['#8B62E4','#5185F6','#62C0FF','#86DAE9','#81F495','#96F550','#BAEE29','#F5F500','#F3A712','#E4572E','#C42A2A','#FF15B9','#A22AE2', '#5A40A3', '#8772D3'];
const secondColors = ['','#9EBBFA','#C2E7FF','#CBEFF6','#D9FCDF','#C4F99F','#D4F47B','#FFFF47','#F7C664','#EF9A81','#DF6868','#FF70D4','#C881EE','#907BCC','#BDB1E7'];
let nodes;
let widthScale = 0.895;
let heightScale = 0.8;
let gridScale = 0.7;
let cnvMrg = [0,0];
let blockSize, gridLen, gap;
let grid, gridCoords;
let gameOver = false;
let movesLeft = true;
let gameOverObj;
let score = 0;
let mouseX, mouseY;
let animationLen = 10;
let animationTimer = 0;
// ON LOAD // 
window.onload = function() {    
    document.addEventListener('keydown', logKey);
    cnv = document.getElementById("canvas");
    cnv.addEventListener('mousemove', e => {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });
    cnv.addEventListener('mousedown', pressButton);
    cnv.width = window.innerWidth * widthScale;
    cnv.height = window.innerHeight * heightScale;
    ctx = cnv.getContext('2d');
    gridLen = cnv.height * gridScale;
    gap = gridLen / 15;
    blockSize = gridLen / 4;
    
    // create background/grid
    background = [new Grid()];
    gameOverObj = new GameOver();
    // spawn initial blocks
    for (var i = 0; i < 16; i++) {
        grid[i] = null;
    }
    spawnBlock();
    spawnBlock();
    loop();
}

// FUNCTIONS //
function logKey(e) {
    if (animationTimer > 0) { return; }
    var event = window.event ? window.event : e;
    switch (event.keyCode) {
        case 37:
            move('left', false);
            break;      
        case 38:
            move('up', false);
            break;
        case 39:
            move('right', false);
            break;
        case 40:
            move('down', false);
            break;
        default:
            break;

    }
}
function move(dir, check) {
    var blocks = [];
    var moving = false;
    let merging;
    for (let block of grid) {if (block) {blocks.push(block);}}
    switch (dir) {
        case 'left':
            blocks.sort(sortLeft);
            while (blocks.length > 0) {
                var block = blocks.pop(); 
                var row = block.row;
                var toCol = block.col;
                merging = false;
                for (var col = block.col - 1; col >= 0; col--) {
                    // check empty
                    if (grid[col * 4 + row] == null) {
                        toCol = col;
                    } 
                    // check merge
                    else if (grid[col * 4 + row].val == block.val) {
                        toCol = col;
                        merging = true;
                        break;
                    } 
                    else { break; }
                }
                // move
                if (toCol != block.col) {
                    if (!check) {
                        if (merging) {
                            block.val++;
                            merging = false;
                        }
                        animateMovement(block.col * 4 + row, toCol, row);
                        grid[block.col * 4 + row] = null;
                        grid[toCol * 4 + row] = block;
                        block.gridId = toCol * 4 + row;
                        block.col = toCol;
                        moving = true;
                    } else {
                        movesLeft = true;
                    }
                }
            }
            break;
        case 'right':
            blocks.sort(sortRight);
            while (blocks.length > 0) {
                var block = blocks.pop(); 
                var row = block.row;
                var toCol = block.col;
                for (var col = block.col + 1; col < 4; col++) {
                    // check empty
                    if (grid[col * 4 + row] == null) {
                        toCol = col;
                    } 
                    // check merge
                    else if (grid[col * 4 + row].val == block.val) {
                        toCol = col;
                        merging = true;
                        break;
                    } else {
                        break;
                    }
                }
                // move
                if (toCol != block.col) {
                    if (!check) {
                        if (merging) {
                            block.val++;
                            merging = false;
                        }
                        animateMovement(block.col * 4 + row, toCol, row);
                        grid[block.col * 4 + row] = null;
                        grid[toCol * 4 + row] = block;
                        block.gridId = toCol * 4 + row;
                        block.col = toCol;
                        moving = true;
                    } else {
                        movesLeft = true;
                    }
                }
            }
            break;
        case 'down':
            blocks.sort(sortDown);
            while (blocks.length > 0) {
                var block = blocks.pop(); 
                var toRow = block.row;
                var col = block.col;
                for (var row = block.row + 1; row < 4; row++) {
                    // check empty
                    if (grid[col * 4 + row] == null) { toRow = row; }
                    // check merge
                    else if (grid[col * 4 + row].val == block.val) {
                        toRow = row;
                        merging = true;
                        break;
                    } else {
                        break;
                    }
                }
                // move
                if (toRow != block.row) {
                    if (!check) {
                        if (merging) {
                            block.val++;
                            merging = false;
                        }
                        animateMovement(col * 4 + block.row, col, toRow);
                        grid[col * 4 + block.row] = null;
                        grid[col * 4 + toRow] = block;
                        block.gridId = col * 4 + toRow;
                        block.row = toRow;
                        moving = true;
                    } else {
                        movesLeft = true;
                    }
                }
            }
            break;
        case 'up':
            blocks.sort(sortUp);
            while (blocks.length > 0) {
                var block = blocks.pop(); 
                var toRow = block.row;
                var col = block.col;
                for (var row = block.row - 1; row >= 0; row--) {
                    // check empty
                    if (grid[col * 4 + row] == null) { toRow = row; }
                     // check merge
                    else if (grid[col * 4 + row].val == block.val) {
                        toRow = row;
                        merging = true;
                        break;
                    } else {
                        break;
                    }
                }
                // move
                if (toRow != block.row) {
                    if (!check) {
                        if (merging) {
                            block.val++;
                            merging = false;
                        }
                        animateMovement(col * 4 + block.row, col, toRow);
                        grid[col * 4 + block.row] = null;
                        grid[col * 4 + toRow] = block;
                        block.gridId = col * 4 + toRow;
                        block.row = toRow;
                        moving = true;
                    } else {
                        movesLeft = true;
                    }
                }
            }
            break;
        default:
            break;
    }
    if (moving) {
        animationTimer = animationLen;
        spawnBlock();
    }
}
function animateMovement(fromId, toCol, toRow) {
    var from = grid[fromId];
    from.animating = true;
    // horizontal movement
    if (from.col != toCol) {
        from.speed = (toCol - from.col) * (blockSize + gap) / animationLen;
        from.dir = 'horizontal';
    } 
    // vertical movement
    else {
        from.speed = (toRow - from.row) * (blockSize + gap) / animationLen;
        from.dir = 'vertical';
    }
}
function spawnBlock() {
    var locs = [];
    for (var i = 0; i < 16; i++) { if (grid[i] == null) { locs.push(i); } }
    if (locs.length > 0) {
        var loc = locs[Math.floor(Math.random() * locs.length)];
        var val;
        if (Math.random() > 0.8) { val = 2; } else { val = 1; }
        grid[loc] = new Block(loc, val);
    }
}
function checkGameOver() {
    for (let g of grid) {
        if (g == null) { return; }
    }
    movesLeft = false;
    move('left', true);
    if (!movesLeft) { move('right', true); } 
    if (!movesLeft) { move('up', true); }
    if (!movesLeft) { move('down', true); }
    if (movesLeft) { return; }
    gameOver = true;
}
function checkButton() {
    var width = blockSize * 2 - gap/2;
    var height = blockSize - gap/2;
    var X = (cnv.width * .4) - (gridLen / 2) - (gap * 2.5) + ((gridLen + 5*gap));
    var Y = (cnv.height / 2) - (gridLen / 2) - (gap * 2.5) + ((gap/2));

    if (mouseX >= X & mouseX <= X + width & mouseY >= Y & mouseY <= Y + height) {
        return true;
    } 
    return false;
}
function pressButton(e) {
    if (e.which == 1 & checkButton()) {
        newGame();
    }
}
function newGame() {
    background = [new Grid()];
    gameOver = false;
    spawnBlock();
    spawnBlock();

}
function sortRight(first, second) {
    if (first.col > second.col) {
       return 1;
    }
    if (first.col < second.col) {
       return -1;
    }
    return 0;
}
function sortLeft(first, second) {
    if (first.col > second.col) {
       return -1;
    }
    if (first.col < second.col) {
       return 1;
    }
    return 0;
}
function sortDown(first, second) {
    if (first.row > second.row) {
       return 1;
    }
    if (first.row < second.row) {
       return -1;
    }
    return 0;
}
function sortUp(first, second) {
    if (first.row > second.row) {
       return -1;
    }
    if (first.row < second.row) {
       return 1;
    }
    return 0;
}
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
  }

// CLASSES //
function Grid() {
    this.x = cnv.width * .4;
    this.y = cnv.height / 2;
    this.or = [this.x - gridLen / 2 - 2.5 * gap, this.y - gridLen / 2 - 2.5 * gap]
    //init grid
    gridCoords = [];
    grid = [];
    for (var j = 0; j < 4; j++) { 
        for (var i = 0; i < 4; i++) { 
            gridCoords.push([this.or[0] + (j + 0.5) * (blockSize + gap) + gap/4, this.or[1] + (i + 0.5) * (blockSize + gap) + gap/4]);
            grid.push(null);
        } 
    } 
    this.lineColor = 'rgb(75,75,75)';
    this.color = 'rgb(136, 140, 143)';
    this.update = function() {
        this.x = cnv.width * .4;
        this.y = cnv.height / 2;
        this.or = [this.x - gridLen / 2 - 2.5 * gap, this.y - gridLen / 2 - 2.5 * gap];

        gridLen = cnv.height * gridScale;
        gap = gridLen / 15;
        // update grid
        gridCoords = [];
        for (var j = 0; j < 4; j++) { 
            for (var i = 0; i < 4; i++) { 
                gridCoords.push([this.or[0] + (j + 0.5) * (blockSize + gap) + gap/4, this.or[1] + (i + 0.5) * (blockSize + gap) + gap/4]);
            } 
        } 
    }
    this.render = function() {
        // background
        ctx.fillStyle = this.lineColor;
        ctx.beginPath();
        ctx.roundRect(this.or[0], this.or[1], gridLen + 5 * gap, gridLen + 4.5 * gap, blockSize/10);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.rect(this.or[0] + gap / 2, this.or[1] + gap / 2, gridLen + 4 * gap, gridLen + 4 * gap);
        ctx.closePath(); ctx.fill();
        // grid lines 
        ctx.fillStyle = this.lineColor;
        ctx.beginPath();
        var gridX = this.or[0] + blockSize + gap;
        for (var i = 0; i < 4; i++) { 
            ctx.rect(gridX + i * (blockSize + gap), this.or[1] + gap/2, gap/2, gridLen + 4 * gap);
        } 
        var gridY = this.or[1] + blockSize + gap;
        for (var i = 0; i < 4; i++) { 
            ctx.rect(this.or[0] + gap/2, gridY + i * (blockSize + gap), gridLen + 4 * gap, gap/2);
        } 
        ctx.closePath(); ctx.fill();
        // sidebar
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(gridX + 3 * (blockSize + gap) + gap/2, this.or[1], 8*gap, gridLen + 4.5 * gap, blockSize/10);
        ctx.closePath(); ctx.fill();
        // new game 
        if (checkButton()) { ctx.fillStyle = 'rgb(181, 168, 116)'; }
         else { ctx.fillStyle = 'rgba(75,75,75,0.8)'; }
        ctx.beginPath();
        ctx.roundRect(this.or[0] + gridLen + gap*5, this.or[1] + gap/2, blockSize * 2 - gap/2, blockSize - gap/2, blockSize/10);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.font = (blockSize * .38).toString() + "px Arial";
        ctx.textAlign = "center";
        ctx.fillText("New", this.or[0] + gridLen + gap*8.5, this.or[1] + gap*2);
        ctx.fillText("Game", this.or[0] + gridLen + gap*8.5, this.or[1] + gap*3.25);
        ctx.font = (blockSize / 2).toString() + "px Arial";
        // score
        ctx.fillText("Score:", this.or[0] + gridLen + gap*8.5, this.or[1] + gridLen + gap);
        ctx.fillText(score.toString(), this.or[0] + gridLen + gap*8.5, this.or[1] + gridLen + gap * 3);
    }

}
function Block(gridId, val) {
    this.gridId = gridId;
    this.x = gridCoords[gridId][0];
    this.y = gridCoords[gridId][1];
    this.row = gridId % 4;
    this.col = Math.floor(gridId / 4);
    this.val = val;
    this.color = colors[val];        
    this.secondColor = secondColors[val];
    this.number = (2 ** val).toString();
    this.fontSize = gap * 1.9;
    this.animating = true;
    this.dir = null;
    this.size = 1;
    this.speed = 0;
    animationTimer = Math.floor(animationLen);
    this.update = function() {
        if (animationTimer == 0) {
            this.animating = false;
        }
        if (!this.animating) {
            this.x = gridCoords[this.gridId][0];
            this.y = gridCoords[this.gridId][1];
            this.row = this.gridId % 4;
            this.col = Math.floor(this.gridId / 4);
        }
        
        this.color = colors[this.val];
        this.secondColor = secondColors[this.val];
        this.number = (2 ** this.val).toString();

        if (Math.floor(Math.log10(2 ** val)) == 2) {
            this.fontSize = Math.floor(gap * 1.7);
        }
        else if (Math.floor(Math.log10(2 ** val)) > 2) {
            this.fontSize = Math.floor(gap * 1.5);
        } else { this.fontSize = Math.floor(gap * 1.9);}
            
    }
    this.render = function() {

    this.grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, blockSize * this.size / 100);
    this.grd.addColorStop(0, this.secondColor);
    this.grd.addColorStop(.4, this.color);
    this.grd.addColorStop(.9, 'rgba(0,0,0,0.8)');
        ctx.fillStyle = this.grd;
        ctx.beginPath();
        ctx.roundRect(this.x - (blockSize/2) * (this.size / 100), this.y - (blockSize/2) * (this.size / 100), blockSize * this.size / 100, blockSize * this.size / 100, blockSize / 10 * this.size / 100);
        ctx.closePath();
        ctx.fill();
        ctx.font = (this.fontSize*this.size/100).toString() + "px Arial";
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.textAlign = "center";
        ctx.fillText(this.number, this.x, this.y + gap*.625);
    }
    this.animate = function() {
        if (this.dir == 'horizontal') {
            this.x += this.speed;
        } else if (this.dir == 'vertical') {
            this.y += this.speed;
        } else {
            this.size += 100 / (animationLen);
            if (this.size == 100) {
                this.animating = false;
            }
        }
    }

}
function GameOver() {
    this.x = cnv.width / 2;
    this.y = cnv.height / 2;
    this.width = cnv.width / 2;
    this.height = cnv.height / 2;
    this.color = 'rgba(181, 168, 116, .75)';
    this.fontSize = this.height / 4;
    this.update = function() {
        this.x = cnv.width / 2;
        this.y = cnv.height / 2;
        this.width = cnv.width / 2;
        this.height = cnv.height / 2;
        this.fontSize = this.height / 4;
    }
    this.render = function() {        
        ctx.fillStyle = 'rgba(75, 75, 75, 0.8)';
        ctx.beginPath();
        ctx.rect(this.x - this.width/2 - gap/2, this.y - this.height/2 - gap/2, this.width + gap, this.height + gap);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.textAlign = "center";
        ctx.font = (Math.floor(this.fontSize)).toString() + "px Arial";
        ctx.fillText("Game Over!", this.x, this.y - gap );
        ctx.font = (this.fontSize*.7).toString() + "px Arial";
        ctx.fillText("Score:", this.x, this.y + gap * 1.2 );

        ctx.font = (this.fontSize).toString() + "px Arial";
        ctx.fillText(score.toString(), this.x, this.y + gap * 4);
    }
}
function Score() {
    score = 0;
    for (g of grid) {
        if (g) {
            score += 2 ** g.val;
        }
    }
}
// MAIN LOOP // 
function loop() {
    // time and frame
    cnv.height = window.innerHeight * heightScale;
    cnv.width = window.innerWidth * widthScale;
    // updates
    gridLen = cnv.height * gridScale;
    blockSize = gridLen / 4;
    // background
    ctx = cnv.getContext('2d');
    ctx.fillStyle = 'rgba(181, 168, 116, 1)';
    ctx.fillRect(cnvMrg[0], cnvMrg[1], cnv.width, cnv.height);
    // update and render //
    Score();
    if (animationTimer > 0) {
        animationTimer--;
        for (let block of grid) {
            if (block) {
                if (block.animating) {
                    block.animate();
                }
            }
        }
    }
    for (let part of background) {
        part.update();
        part.render();
    } 
    for (let node of grid) {
        if (node) {
            node.update();
            node.render();
        }
    }
    checkGameOver();
    if (gameOver) {
        gameOverObj.update();
        gameOverObj.render();
    }
    requestAnimationFrame(loop);
}
