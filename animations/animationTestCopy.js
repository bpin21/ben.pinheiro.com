

    let cnv2, ctx2, cx2, cy2, count2, entities2;
    const colors2 = ['#CE4721', '#B30A00', '#85002E', '#9C088C', '#AD55C9'];
    let nodes2, particles2;
    let spawnDelay2 = 50;
    let decayPct2 = 60;
    let sizeDecay2 = 0.15;
    let numnodes2 = 4;
    let WIDTH2 = window.innerWidth;
    let HEIGHT2= window.innerHeight;
    
    //let mouseX = event.clientX;
    //let mouseY = event.clientY;

    // ON LOAD // 
    window.onload = function() {
        cnv2 = document.getElementById("canvas2");
        cnv2.width = WIDTH2 * 0.9;
        cnv2.height = HEIGHT2* 0.8;
        ctx2 = cnv2.getContext('2d');
        cx2 = cnv2.width / 2;
        cy2 = cnv2.height / 2;
        count2 = 0;
        particles2 = [];
        nodes2 = [];

        // spawn walls
        nodes2.push(new Wall(cx2 / 2, cy2 / 2, 100, 100));
        
        

        // spawn initial particles2
        for (i = 0; i < numnodes2; i++){
            var spawnX = cnv2.width / 2;
            var spawnY = cnv2.height / 2;
            nodes2.push(new Node(spawnX, spawnY, i, Math.PI / numnodes2 + Math.PI * i / 2));
        }
        
        loop();
    }

    // FUNCTIONS //

    // CLASSES //
    function Wall(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.size = 100000;
        this.color = 'rgb(255,0,0)';
        this.update = function() {}
        this.render = function() {
            ctx2.fillStyle = this.color;
            ctx2.beginPath();
            ctx2.rect(this.x, this.y, this.width, this.height);
            ctx2.closePath();
            ctx2.fill();
        }
    }

    function Node(x, y, id, dir) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.size = 20;
        this.dir = dir;
        this.speed = 4;
        //this.r = 0;
        //this.g = 250;
        //this.b = 50;
        //this.color = 'rgb('+ this.r + ','+ this.g +','+ this.b +')';
        this.alpha = 1.;
        this.color = 'rgba(255, 255, 255,' + this.alpha + ')';
        //this.delayId = id;
        this.freq = 15 * Math.PI;
        this.wobble = 10;
        //if (id > numnodes2) {this.delayId = id - numnodes2;}
        this.update = function() {
            // update fields
            //if (this.size * 5 <= 255) {this.r = this.size * 5; this.g = 255 - this.r; console.log(this.g)}
            //this.color = 'rgb('+ this.r + ','+ this.g +','+ this.b +')';
            let oldX = this.x;
            let oldY = this.y;
            this.x += this.speed * Math.cos(this.dir);
            this.y += this.speed * Math.sin(this.dir);
            //this.wobble = 20 * Math.cos(count2 * Math.PI / this.freq);
            this.dir -= this.size * 0.00002 * count2;
            // send out particles2
            //if (count2 % spawnDelay2 == 0){
            this.size -= sizeDecay2;
            if (count2 % 3 == 0) {
                particles2.push(new NodeParticle(this.x, this.y, Math.PI - Math.atan2(oldX - this.x, oldY - this.y) + Math.PI, this.size));
            }
            
        }
        this.render = function() {
            ctx2.fillStyle = this.color;
            ctx2.beginPath();
            ctx2.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
            ctx2.closePath();
            ctx2.fill();
        }
    }

    function NodeParticle(x, y, dir, size) {
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.size = size;
        this.r = 20;
        this.g = 20;
        this.b = 200;
        this.a = 0.5;
        this.color = 'rgba('+ this.r + ',' + this.g + ',' + this.b + ',' +this.a+')';
        this.speed = 0.4 +  Math.random();
        this.collision = false;
        this.rsign = 3.5;
        this.asign = 1;
        let newX;
        let newY;
        let node;
        let n;
        let distance;
        let collisionId
        this.update = function() {
            // update position
            newX = this.x + this.speed * Math.cos(this.dir);
            newY = this.y + this.speed * Math.sin(this.dir);
            // check collision
            /*for (n in nodes2){
                if (n != this.id){
                    node = nodes2[n];
                    distance = Math.sqrt( (node.x-newX)**2 + (node.y-newY)**2 );
                    
                    if (distance < 5) {
                        this.collision = true;
                        node.size += 10/node.size;
                        break
                        // continue
                    }
                }
            } */
            
            this.x = newX;
            this.y = newY;
            this.size -= this.size/5/decayPct2;

            if (this.a < 0.01 || this.a > 0.99) {
                this.asign = this.asign * -1;
            }

            this.a -= 0.02 * this.asign * this.a / 2;

            this.r += this.rsign;
            if (this.r > 255 || this.r < 0) {
                this.rsign *= -1;
                this.r += 2*this.rsign
            }
            this.color = 'rgba('+ this.r + ','+ this.g +','+ this.b + ',' + this.a +')';
        }
        // render
        this.render = function() {
            ctx2.fillStyle = this.color;
            ctx2.beginPath();
            ctx2.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
            ctx2.closePath();
            ctx2.fill();
        }


    }

       
    let new_parts2;
    // MAIN LOOP // 
    function loop() {
        if (window.location.href.toString().split('#')[1] == '2') {
        // time and frame
        count2 += 1;
        HEIGHT2= window.innerHeight * 0.8;
        WIDTH2 = window.innerWidth * 0.9;
        cnv2.height = HEIGHT;
        cnv2.width = WIDTH;
        
        if (count2 % spawnDelay2 == 0) {
            for (i = 0; i < numnodes2; i++){
                var spawnX = cnv2.width / 2;
                var spawnY = cnv2.height / 2;
                nodes2.push(new Node(spawnX, spawnY, i, Math.PI / numnodes2 + Math.PI * i / 2 + count2 / spawnDelay2));
            }
        }
        ctx2 = cnv2.getContext('2d');
        // background
        ctx2.fillStyle = 'rgba(0, 0, 0, .01)';
        ctx2.fillRect(0, 0, WIDTH, HEIGHT);

        // mouse //
        //mouseX = event.clientX;
        //mouseY = event.clientY;

        // update and render //
        new_parts2 = [];
        for (let part of particles2) {
            if (part.x >= 0 & part.x <= cnv2.width & part.y >= 0 & part.y <= cnv2.height & part.size > 1 ) {
                new_parts2.push(part);
                part.update();
                part.render();
            } 
        } 
        particles2 = new_parts2;
        
        new_nodes2 = [];
        for (let node of nodes2) {
            if (node.x >= 0 & node.x <= cnv2.width & node.y >= 0 & node.y <= cnv2.height & node.size > 1 ) {
                new_nodes2.push(node);
                node.update();
                node.render();
            }
            
        }   //entities2 = new_ents;
        
    }
    requestAnimationFrame(loop);
    
}
