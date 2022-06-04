

    let cnv, ctx, cx, cy, count, entities;
    const colors = ['#8B62E4','#5185F6','#62C0FF','#86DAE9','#81F495','#96F550','#BAEE29','#F5F500','#F3A712','#E4572E','#C42A2A','#FF15B9','#A22AE2', '#5A40A3'];
    

    let nodes;
    let widthScale = 0.9;
    let heightScale = 0.8;
    let gridScale = 0.7;
    let cnvMrg = [0,0];
    let blockSize, gridLen, gap;
    let grid, gridCoords;

    // ON LOAD // 
    window.onload = function() {
        cnv = document.getElementById("canvas");
        cnv.width = window.innerWidth * widthScale;
        cnv.height = window.innerHeight * heightScale;
        ctx = cnv.getContext('2d');
        gridLen = cnv.height * gridScale;
        gap = gridLen / 15;
        blockSize = (gridLen + 5 * gap) / 4;



        background = [];
        nodes = [];
        // create background/grid
        background.push(new Grid());

        // spawn initial blocks
        for (var i = 0; i < 14; i++) {
            nodes.push(new Block(i, i));
        }    
        
        loop();
    }

    // FUNCTIONS //

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
        //this.secondColor = 'rgb(150, 150, 150)';
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
            ctx.rect(this.or[0], this.or[1], gridLen + 5 * gap, gridLen + 4.5 * gap);
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
            ctx.rect(gridX + 3 * (blockSize + gap) + gap/2, this.or[1], 8*gap, gridLen + 4.5 * gap);
            ctx.closePath(); ctx.fill();
            
       
        }

    }
    function Block(gridId, val) {
        this.gridId = gridId;
        this.x = gridCoords[gridId][0];
        this.y = gridCoords[gridId][1];
        this.val = val;
        this.color = colors[val];
        this.number = (2 ** val).toString();
        this.fontSize = gap * 1.9;
        this.update = function() {
            this.x = gridCoords[gridId][0];
            this.y = gridCoords[gridId][1];
            if (Math.floor(Math.log10(2 ** val)) == 2) {
                this.fontSize = Math.floor(gap * 1.7);
            }
            else if (Math.floor(Math.log10(2 ** val)) > 2) {
                this.fontSize = Math.floor(gap * 1.5);
            } else { this.fontSize = Math.floor(gap * 1.9);}
                
        }
        this.render = function() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.rect(this.x - blockSize/2, this.y - blockSize/2, blockSize, blockSize);
            ctx.closePath();
            ctx.fill();
            ctx.font = this.fontSize.toString() + "px Arial";
            ctx.fillStyle = 'rgb(0,0,0)';
            ctx.textAlign = "center";
            ctx.fillText(this.number, this.x, this.y + gap/2);

        }
    }

    // MAIN LOOP // 
    function loop() {
        // time and frame
        count += 1;
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
        for (let part of background) {
            part.update();
            part.render();
        } 
        for (let node of nodes) {
            node.update();
            node.render();
        }   //entities = new_ents;
        
        requestAnimationFrame(loop);
    }
