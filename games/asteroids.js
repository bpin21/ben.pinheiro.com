let cnv, ctx, entities, background, ship, roids, bullets;
let ui, gameOver, gameStart, spawner, score, gameLevel;
let starSize = 10;
let starSpeed = 10;
let initStarNum = 20;
let lineWidth = 3;
let dir = Math.PI * 3 / 2;
let left = false;
let right = false;
let up = false;
let shootDelay = 15;
let shootTimer = 0;
let bulletSpeed = 20;
let roidSpeed = 1;
let roidRad = 25;
let partSpeed = 20;
let lives = 3;
let deathTimer = 0;
let deathLength = 140;
let numDeathParts = 14;
let shakeDelay = 50;
let shakeTimer = 0;
let spawnDelay = 50;
let mouseX, mouseY;
let start = true; 
// ON LOAD // 
window.onload = function() {    
    document.addEventListener('keyup', logKeyUp);
    document.addEventListener('keydown', logKeyDown);
    cnv = document.getElementById("canvas");
    cnv.addEventListener('mousedown', pressButton);
    cnv.addEventListener('mousemove', e => {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });
    cnv.width = window.innerWidth;
    cnv.height = window.innerHeight;
    ctx = cnv.getContext('2d');
    gameStart = new GameStart();
    gameOver = new GameOver();
    background = []; entities = [];
    ship = new Ship();
    for (var starX = 0; starX < cnv.width; starX += cnv.width / initStarNum) {
        for (var starY = 0; starY < cnv.height; starY += cnv.height / initStarNum) {
            background.push(new Star(starX + Math.random()*starSize*10, starY + Math.random()*starSize*10));
        }
    }
    loop();
}

// FUNCTIONS //
function logKeyDown(e) {
    var event = window.event ? window.event : e;
    switch (event.keyCode) {
        case 32:
            shoot();
            break;
        case 37:
            left = true;
            break;      
        case 38:
            up = true;
            break;
        case 39:
            right = true;
            break;
        default:
            break;

    }
}
function logKeyUp(e) {
    var event = window.event ? window.event : e;
    switch (event.keyCode) {
        case 37:
            left = false;
            break;      
        case 38:
            up = false;
            break;
        case 39:
            right = false;
            break;
        default:
            break;

    }
}
function checkButton() {
    var width = ship.size * 22;
    var height = 185;
    var X = cnv.width / 2 - ship.size * 11;
    var Y = cnv.height / 2 + ship.size * 5 + 65;
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
    start = false;
    lives = 3;
    entities = [];
    bullets = [];
    roids = [];
    ship = new Ship();
    ui = new UI();
    spawner = new Spawner();
    gameLevel = 1;
    score = 0;
}
function shoot() {
    if (shootTimer != 0 || !ship.alive) { return; }
    entities.push(new Bullet(ship.x + ship.size * Math.cos(dir), ship.y + ship.size * Math.sin(dir), dir))
    shootTimer = shootDelay;
    var gunShotAudio = new Audio('../docs/assets/gun-shot.wav');
    gunShotAudio.play();
}
function checkCollision(x,y, r) {
    for (let roid of roids) {
        if (roid.alive) {
            if (Math.sqrt((roid.x - x) ** 2 + (roid.y - y) ** 2) < roid.r + r) {
                return roid;
            }
        }
    } 
    return null;
}
function checkUFOBullet() {
    for (let bullet of bullets) {
        if (bullet.alive) {
            if (Math.sqrt((ship.x-bullet.x)**2 + (ship.y-bullet.y)**2) < bullet.r + ship.size) {
                bullet.alive = false;
                return true
            }
        }
    }
    return false;
}
function drawShip(x, y, size, uiFlag) {
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.lineWidth = lineWidth;
    if (!uiFlag) {
        ctx.translate(x, y);
        ctx.rotate(dir - Math.PI / 2);
        ctx.translate(-x, -y);
    }
    ctx.beginPath();
    ctx.moveTo(x - size*.7 , y - size);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x + size *.7, y - size);
    ctx.lineTo(x - size *.7, y - size);
    if (up & !uiFlag) {
        ctx.moveTo(x - size/4, y - size);
        ctx.lineTo(x, y - size*1.5);
        ctx.lineTo(x + size/4, y - size);
    }
    ctx.closePath(); ctx.stroke(); ctx.fill();
    if (!uiFlag) {
        ctx.translate(x, y);
        ctx.rotate(-1 * (dir - Math.PI / 2));
        ctx.translate(-x, -y);
    }
}

// CLASSES //
function Star(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * starSize/2 +  2;
    if (Math.random() > 0.9) {
        this.size += this.size/2;
    }
    if (Math.random() > 0.95) {
        this.size *= 2;
    }
    this.speed = Math.random() * starSpeed / this.size  + .5;
    this.a = .5 - .5/this.size;
    this.update = function() {
        this.y -= this.speed;
    }
    this.render = function() {
        ctx.fillStyle = 'rgba(255,255,255,'+this.a+')';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
}
function Bullet(x, y, d) {
    this.x = x;
    this.y = y;
    this.speed = bulletSpeed + Math.sqrt(ship.xSpeed ** 2 + ship.ySpeed ** 2);
    this.dir = d;
    this.r = 5;
    this.size = this.r;
    this.alive = true;
    this.time = 60;
    this.update = function() {
        this.time--;
        if (this.time == 0) { this.alive = false; }
        this.x += this.speed * Math.cos(this.dir);
        this.y += this.speed * Math.sin(this.dir);
        if (start) {var roid = false} else {
        var roid = checkCollision(this.x, this.y, this.r); }
        if (roid) {
            roid.alive = false;
            if (roid.level > 1 & !roid.dead) {
                roids.push(new Roid(roid.x, roid.y, roid.level - 1));
                roids.push(new Roid(roid.x, roid.y, roid.level - 1));
            }
            var tempDir;
            for (var d = 0; d < Math.PI*2; d += Math.PI*2/numDeathParts) {
                tempDir = d + Math.random() * Math.PI/numDeathParts
                background.push(new Part(this.x + this.r*Math.cos(tempDir), this.y + this.r*Math.sin(tempDir), tempDir, roid.r / 6 * Math.random() + roid.r / 5));
            }
            score += Math.floor(roid.r) * 5;
            shakeTimer = roid.r/5 + 5;
            roid.dead = true;
            this.alive = false;
            var explosionAudio = new Audio('../docs/assets/roid-explosion.wav');
            explosionAudio.play();
        }
        if (this.x < 0) { this.x += cnv.width; }
        if (this.x > cnv.width) { this.x -= cnv.width; }
        if (this.y < 0) { this.y += cnv.height; }
        if (this.y > cnv.height) { this.y -= cnv.height; }
    }
    this.render = function() {
        this.draw(this.x, this.y, this.r);
        if (this.x - this.size < 0 ) { this.draw(this.x + cnv.width, this.y, this.size); }
        if (this.x + this.size > cnv.width) { this.draw(this.x - cnv.width, this.y, this.size); }
        if (this.y - this.size < 0 ) { this.draw(this.x, this.y + cnv.height, this.size); } 
        if (this.y + this.size > cnv.height) { this.draw(this.x, this.y - cnv.height, this.size); }
    }
    this.draw = function(x, y, r) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(255,255,255)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.closePath(); ctx.stroke();
    }
}
function UFOBullet(x, y, d) {
    this.x = x;
    this.y = y;
    this.speed = bulletSpeed + Math.sqrt(ship.xSpeed ** 2 + ship.ySpeed ** 2);
    this.dir = d;
    this.r = 5;
    this.size = this.r;
    this.alive = true;
    this.time = 50;
    this.update = function() {
        if (this.alive) {
            this.time--;
            if (this.time == 0) { this.alive = false; }
            this.x += this.speed * Math.cos(this.dir);
            this.y += this.speed * Math.sin(this.dir);

            if (this.x < 0) { this.x += cnv.width; }
            if (this.x > cnv.width) { this.x -= cnv.width; }
            if (this.y < 0) { this.y += cnv.height; }
            if (this.y > cnv.height) { this.y -= cnv.height; }
        }
    }
    this.render = function() {
        this.draw(this.x, this.y, this.r);
        if (this.x - this.size < 0 ) { this.draw(this.x + cnv.width, this.y, this.size); }
        if (this.x + this.size > cnv.width) { this.draw(this.x - cnv.width, this.y, this.size); }
        if (this.y - this.size < 0 ) { this.draw(this.x, this.y + cnv.height, this.size); } 
        if (this.y + this.size > cnv.height) { this.draw(this.x, this.y - cnv.height, this.size); }
    }
    this.draw = function(x, y, r) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(255,255,255)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.closePath(); ctx.stroke();
    }
}
function Ship() {
    this.x = cnv.width / 2;
    this.y = cnv.height / 2;
    this.size = 30;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.rotSpeed = 0.075;
    this.thrust = 0.2;
    this.drag = 0.05;
    this.alive = true;
    this.audioDelay = 0;
    this.update = function() {
        if (this.audioDelay > 0) {
            this.audioDelay --;
        }
        if (this.alive) {
            this.x += this.xSpeed;
            this.y += this.ySpeed;
            if (left & !right) { dir -= this.rotSpeed; }
            if (right & !left) { dir += this.rotSpeed; }
            if (up) {
                this.xSpeed += this.thrust * Math.cos(dir);
                this.ySpeed += this.thrust * Math.sin(dir);
                var tempDir = dir + Math.PI + (0.5 - Math.random()) * Math.PI/4;
                background.push(new Part(this.x + this.size*Math.cos(tempDir), this.y + this.size*Math.sin(tempDir), tempDir, ship.size/3 * Math.random()));
                if (this.audioDelay == 0) {
                    var engineAudio = new Audio('../docs/assets/engine.wav');
                    engineAudio.play();
                    this.audioDelay = 15;
                }
            }
            if (this.xSpeed > 0) { this.xSpeed -= this.drag; }
            if (this.xSpeed < 0) { this.xSpeed += this.drag; }
            if (this.ySpeed > 0) { this.ySpeed -= this.drag; }
            if (this.ySpeed < 0) { this.ySpeed += this.drag; }
            if (this.x < 0) { this.x += cnv.width; }
            if (this.x > cnv.width) { this.x -= cnv.width; }
            if (this.y < 0) { this.y += cnv.height; }
            if (this.y > cnv.height) { this.y -= cnv.height; }
            if (!start) {
                if (checkCollision(this.x, this.y, this.size) || checkUFOBullet()) {
                    this.alive = false;
                    lives--;
                    deathTimer = deathLength;
                    var tempDir;
                    for (var d = 0; d < Math.PI*2; d += Math.PI/numDeathParts) {
                        tempDir = d + Math.random() * Math.PI/numDeathParts
                        background.push(new Part(this.x + this.size*Math.cos(tempDir), this.y + this.size*Math.sin(tempDir), tempDir, ship.size * Math.random() + ship.size / 5));
                    }
                    shakeTimer = shakeDelay;
                    if (lives == 0) {
                        var gameOverAudio = new Audio('../docs/assets/game-over.wav');
                        gameOverAudio.play();
                    } else {
                        var shipExplosionAudio = new Audio('../docs/assets/ship-explosion.wav');
                        shipExplosionAudio.play();
                    }   
                }
            }
        }
    }
    this.render = function() {
        drawShip(this.x, this.y, this.size, false);
        if (this.x - this.size < 0 ) { drawShip(this.x + cnv.width, this.y, this.size, false); }
        if (this.x + this.size > cnv.width) { drawShip(this.x - cnv.width, this.y, this.size, false); }
        if (this.y - this.size < 0 ) { drawShip(this.x, this.y + cnv.height, this.size, false); } 
        if (this.y + this.size > cnv.height) { drawShip(this.x, this.y - cnv.height, this.size, false); }
    }
}
function Part(x, y, dirr, size) {
    this.x = x;
    this.y = y;
    this.dir = dirr;
    this.speed = partSpeed / 2 * Math.random() + partSpeed / 5;
    this.size = size;
    this.alpha = 0.3 + Math.random() * 0.3;
    this.update = function() {
        this.x += this.speed * Math.cos(this.dir);
        this.y += this.speed * Math.sin(this.dir);
        this.speed -= this.speed / 20;
        this.alpha -= this.alpha / 100;
    }
    this.render = function() {
        ctx.fillStyle = 'rgba(255,255,255,' + this.alpha + ')';
        ctx.beginPath();
        ctx.rect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.closePath(); ctx.fill();
    }
}
function Roid(x, y, level) {
    this.x = x;
    this.y = y;
    this.level = level;
    this.r = roidRad * level;
    this.dir = Math.random() * Math.PI * 2;
    this.speed = Math.random() * roidSpeed * (gameLevel/2) * (4 - level) / 2 + roidSpeed * 2;
    this.alive = true;
    this.dead = false;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = this.speed / 100;
    this.type = Math.floor(Math.random() * 3);
    this.update = function() {
        this.rotation += this.rotationSpeed;
        this.x += this.speed * Math.cos(this.dir);
        this.y += this.speed * Math.sin(this.dir);
        if (this.x < 0) { this.x += cnv.width; }
        if (this.x > cnv.width) { this.x -= cnv.width; }
        if (this.y < 0) { this.y += cnv.height; }
        if (this.y > cnv.height) { this.y -= cnv.height; }
    }
    this.render = function() {
        this.drawRoid(this.x, this.y, this.r);
        if (this.x - this.r < 0 ) {
            this.drawRoid(this.x + cnv.width, this.y, this.r);
        }
        if (this.x + this.r > cnv.width) {
            this.drawRoid(this.x - cnv.width, this.y, this.r);
        }
        if (this.y - this.r < 0 ) {
            this.drawRoid(this.x, this.y + cnv.height, this.r);
        } 
        if (this.y + this.r > cnv.height) {
            this.drawRoid(this.x, this.y - cnv.height, this.r);
        }
    }
    this.drawRoid = function(x, y, r) {
        ctx.lineWidth = this.level ** 2 / 2 + 1;
        ctx.strokeStyle = 'rgb(255,255,255)';
        ctx.translate(x, y);
        ctx.rotate(this.rotation);
        ctx.translate(-x, -y);
        ctx.beginPath();
        switch (this.type) {
            case 1:
                ctx.moveTo(x - r, y);
                ctx.lineTo(x - r * .85, y - r *.7);
                ctx.lineTo(x - r * .65, y - r *.9);
                ctx.lineTo(x + .2*r, y - r * .8);
                ctx.lineTo(x + .5*r, y - r * .9);
                ctx.lineTo(x +  .8*r, y - r *.86);
                ctx.lineTo(x + r * .78, y);
                ctx.lineTo(x + r * .78, y);
                ctx.lineTo(x + r, y + r * .7);
                ctx.lineTo(x + r*.8, y + r * .9);
                ctx.lineTo(x, y + r);
                ctx.lineTo(x - r *.7, y + r *.6);
                break;
            case 2:
                ctx.moveTo(x - r, y - r/2);
                ctx.lineTo(x - r, y + r/2);
                ctx.lineTo(x - r/2, y + r/2);
                ctx.lineTo(x - r*.8, y + r);
                ctx.lineTo(x + r/2, y + r);
                ctx.lineTo(x + r, y + r/2);
                ctx.lineTo(x + r, y + r*.4);
                ctx.lineTo(x + r*.6, y);
                ctx.lineTo(x + r, y - r*.4);
                ctx.lineTo(x + r, y - r/2);
                ctx.lineTo(x + r*.8, y - r);
                ctx.lineTo(x + r*.4, y - r*.8);
                ctx.lineTo(x, y - r);
                break;
            default:
                ctx.moveTo(x - r, y - r/2);
                ctx.lineTo(x - r, y - r*.6);
                ctx.lineTo(x - r*.8, y - r/2);
                ctx.lineTo(x - r*.7, y - r*.8);
                ctx.lineTo(x - r/2, y - r*.75);
                ctx.lineTo(x, y - r);
                ctx.lineTo(x + r*.6, y - r*.8);
                ctx.lineTo(x + r*.8, y - r*.9);
                ctx.lineTo(x + r, y - r/2);
                ctx.lineTo(x + r*.9, y);
                ctx.lineTo(x + r*.7, y + r/2);
                ctx.lineTo(x + r*.4, y + r*.88);
                ctx.lineTo(x, y + r*.7);
                ctx.lineTo(x - r/2, y + r*.9);
                ctx.lineTo(x - r, y + r*.6);
                ctx.lineTo(x - r*.8, y);
                break;    
        }
        ctx.closePath(); ctx.stroke();
        ctx.translate(x, y);
        ctx.rotate(-this.rotation);
        ctx.translate(-x, -y);
    }
}
function GameOver() {
    this.x = cnv.width / 2;
    this.y = cnv.height / 2;
    this.rad = 20;
    this.font = Math.floor(cnv.width / 10).toString() + "px Arial";
    this.update = function() {
        this.x = cnv.width / 2;
        this.y = cnv.height / 2;
        this.font = Math.floor(cnv.width / 10).toString() + "px Arial";
    }
    this.render = function() {
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.strokeStyle = 'rbg(255,255,255)';
        ctx.font = this.font;
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", this.x, this.y - ship.size * 4.5);
        ctx.lineWidth = 4;
        ctx.font = "120px Arial";
        ctx.strokeText("New Game", this.x, this.y + ship.size * 10.5);
        ctx.beginPath();
        
        ctx.moveTo(this.x - ship.size * 11, this.y + ship.size * 5 + 65 + this.rad); // top left
        ctx.arc(this.x - ship.size * 11 + this.rad, this.y + ship.size * 5 + 65 + this.rad, this.rad, Math.PI, Math.PI * 3/2);
        ctx.lineTo(this.x + ship.size * 11 - this.rad, this.y + ship.size * 5 + 65); // top right
        ctx.arc(this.x + ship.size * 11 - this.rad, this.y + ship.size * 5 + 65 + this.rad, this.rad, Math.PI * 3/2, Math.PI * 2);
        ctx.lineTo(this.x + ship.size * 11, this.y + ship.size * 5 + 185 - this.rad); // bot right
        ctx.arc(this.x + ship.size * 11 - this.rad, this.y + ship.size * 5 + 185 - this.rad, this.rad, 0, Math.PI/2);
        ctx.lineTo(this.x - ship.size * 11 + this.rad, this.y + ship.size * 5 + 185); // bot left
        ctx.arc(this.x - ship.size * 11 + this.rad, this.y + ship.size * 5 + 185 - this.rad, this.rad, Math.PI/2, Math.PI);
        ctx.closePath();
        if (checkButton()) { 
            ctx.fill();
            ctx.strokeStyle = 'rgb(0,0,0)';
            ctx.strokeText("New Game", this.x, this.y + ship.size * 10.5);
        } else { 
            ctx.stroke(); 
        }
    }
}
function GameStart() {
    this.x = cnv.width / 2;
    this.y = cnv.height / 2;
    this.rad = 20;
    this.font = Math.floor(cnv.width / 10).toString() + "px Arial";
    this.update = function() {
        this.x = cnv.width / 2;
        this.y = cnv.height / 2;
        this.font = Math.floor(cnv.width / 10).toString() + "px Arial";
    }
    this.render = function() {
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.strokeStyle = 'rgb(255,255,255)';
        ctx.font = this.font;
        ctx.textAlign = "center";
        ctx.fillText("ASTEROIDS", this.x, this.y - ship.size * 4.5);
        ctx.lineWidth = 4;
        ctx.font = "120px Arial";
        ctx.strokeText("New Game", this.x, this.y + ship.size * 10.5);
        ctx.beginPath();
        ctx.moveTo(this.x - ship.size * 11, this.y + ship.size * 5 + 65 + this.rad); // top left
        ctx.arc(this.x - ship.size * 11 + this.rad, this.y + ship.size * 5 + 65 + this.rad, this.rad, Math.PI, Math.PI * 3/2);
        ctx.lineTo(this.x + ship.size * 11 - this.rad, this.y + ship.size * 5 + 65); // top right
        ctx.arc(this.x + ship.size * 11 - this.rad, this.y + ship.size * 5 + 65 + this.rad, this.rad, Math.PI * 3/2, Math.PI * 2);
        ctx.lineTo(this.x + ship.size * 11, this.y + ship.size * 5 + 185 - this.rad); // bot right
        ctx.arc(this.x + ship.size * 11 - this.rad, this.y + ship.size * 5 + 185 - this.rad, this.rad, 0, Math.PI/2);
        ctx.lineTo(this.x - ship.size * 11 + this.rad, this.y + ship.size * 5 + 185); // bot left
        ctx.arc(this.x - ship.size * 11 + this.rad, this.y + ship.size * 5 + 185 - this.rad, this.rad, Math.PI/2, Math.PI);
        ctx.closePath(); if (checkButton()) { 
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.font = "120px Arial";
            ctx.strokeStyle = 'rgb(0,0,0)';
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.strokeText("New Game", this.x, this.y + ship.size * 10.5);
        } else { 
            ctx.stroke(); 
        }
        ctx.font = "80px Arial";
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = 'rgb(255,255,255)';
        ctx.strokeText('Move:', this.x - cnv.width/4, this.y);
        ctx.strokeText('Shoot:', this.x + cnv.width/4, this.y);
        var keySize = 50;
        var keyGap = 15;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - cnv.width/4 - keySize*2, this.y + ship.size*3, keySize, keySize);
        ctx.beginPath();
        ctx.moveTo(this.x - cnv.width/4 - keySize*1.8, this.y + ship.size*3 + keySize/2);
        ctx.lineTo(this.x - cnv.width/4 - keySize*1.25, this.y + ship.size*3 + keySize*.2);
        ctx.lineTo(this.x - cnv.width/4 - keySize*1.25, this.y + ship.size*3 + keySize*.8);
        ctx.closePath(); ctx.fill();
        ctx.strokeRect(this.x - cnv.width/4 - keySize + keyGap, this.y + ship.size*3, keySize, keySize);
        ctx.beginPath();
        ctx.moveTo(this.x - cnv.width/4 + keySize*.5 + keyGap, this.y + ship.size*3 + keySize*.2);
        ctx.lineTo(this.x - cnv.width/4 + keySize*.5 + keyGap, this.y + ship.size*3 + keySize*.8);
        ctx.lineTo(this.x - cnv.width/4 + keySize*1.1 + keyGap, this.y + ship.size*3 + keySize/2);
        ctx.closePath(); ctx.fill();
        ctx.strokeRect(this.x - cnv.width/4 - keySize + keyGap, this.y + ship.size*3 - keySize - keyGap, keySize, keySize);
        ctx.beginPath();
        ctx.moveTo(this.x - cnv.width/4 - keySize*.8 + keyGap, this.y + ship.size*2.75 - keySize +keyGap*2);
        ctx.lineTo(this.x - cnv.width/4 - keySize*.5 + keyGap, this.y + ship.size*3 - keySize*.8 - keyGap);
        ctx.lineTo(this.x - cnv.width/4 - keySize*.2 + keyGap, this.y + ship.size*2.75 - keySize + keyGap*2);
        ctx.closePath(); ctx.fill();
        ctx.strokeRect(this.x - cnv.width/4 + keyGap*2, this.y + ship.size*3, keySize, keySize);
        ctx.font = "40px Arial";
        ctx.fillText("SPACE", this.x + cnv.width/4, this.y + keySize*2);
        ctx.strokeRect(this.x + cnv.width/4 - keySize*2.25, this.y + keySize*1.25, keySize * 4.5, keySize);
        

    }
}
function UI() {
    this.liveSize = ship.size / 2;
    this.liveX = this.liveSize * 3;
    this.liveY = this.liveSize * 3;
    this.update = function() {}
    this.render = function() {
        if (!start) {
            for (var i = 0; i < lives; i++) {
                drawShip(this.liveX + i * this.liveSize * 3, this.liveY, this.liveSize, true);    
            }
            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.fillStyle = ctx.strokeStyle;
            ctx.textAlign = "center";
            if (lives == 0) {
                ctx.font = "120px Arial";
                ctx.lineWidth = 4;
                ctx.strokeText("Score:", cnv.width/2, cnv.height/2 + this.liveSize * 2);
                ctx.fillText(score, cnv.width/2, cnv.height/2 + this.liveSize * 11);
            } else {
                ctx.font = "40px Arial";
                ctx.lineWidth = 2;
                ctx.strokeText("Score:", this.liveX + this.liveSize*3, this.liveY + this.liveSize * 4);
                ctx.strokeText(score, this.liveX + this.liveSize*3, this.liveY + this.liveSize * 7);
            }
        }
    }
}
function Spawner() {
    gameLevel = 1;
    this.delay = 0;
    this.spawned = [false];
    this.update = function() {
        this.delay--;
        if (this.delay < 0) { this.delay = 0; }
        if (!this.spawned[gameLevel - 1] & this.delay == 0) {
            this.spawn(gameLevel);
            this.spawned[gameLevel - 1] = true;
            this.spawned[gameLevel] = false;
        }
        var roidsLeft = false;
        for (var roid of roids) {
            if (roid.alive) { roidsLeft = true; }
        }
        if (!roidsLeft & this.delay == 0) { gameLevel++; this.delay = spawnDelay; }
    }
    this.spawn = function(lvl) {
        var roidX, roidY;
        var audio = new Audio("../docs/assets/level-start.wav");
        audio.play();
        switch (lvl) {
            case 1:
                //roids.push(new UFO());
                roids.push(new Roid(cnv.width/3, cnv.height*.1, 3));
                roids.push(new Roid(cnv.width*.8, cnv.height*.35, 3));
                break;
            case 2:
                for (var i = 0; i < 3; i++) {
                    roidX = Math.random() * cnv.width;
                    roidY = Math.random() * cnv.height;
                    while (Math.sqrt((roidX-ship.x)**2 + (roidY-ship.y)**2) < roidRad * 3) {
                        roidX = Math.random() * cnv.width;
                        roidY = Math.random() * cnv.height;
                    }
                    roids.push(new Roid(roidX, roidY, 3));
                }
                roids.push(new UFO());
                break;
            case 3:
                for (var i = 0; i < 3; i++) {
                    roidX = Math.random() * cnv.width;
                    roidY = Math.random() * cnv.height;
                    while (Math.sqrt((roidX-ship.x)**2 + (roidY-ship.y)**2) < roidRad * 3) {
                        roidX = Math.random() * cnv.width;
                        roidY = Math.random() * cnv.height;
                    }
                    roids.push(new Roid(roidX, roidY, 3));
                    if (Math.random() > 0.8) { roids.push(new UFO()); }
                }
                break;
            default:
                for (var i = 0; i < 4; i++) {
                    roidX = Math.random() * cnv.width;
                    roidY = Math.random() * cnv.height;
                    while (Math.sqrt((roidX-ship.x)**2 + (roidY-ship.y)**2) < roidRad * 3) {
                        roidX = Math.random() * cnv.width;
                        roidY = Math.random() * cnv.height;
                    }
                    roids.push(new Roid(roidX, roidY, 3));
                    if (Math.random() > 1 - gameLevel/15) { roids.push(new UFO()); }
                }
                break;
        }
    }
}
function UFO() {
    this.x = cnv.width / 4;
    this.y = cnv.height / 2;
    this.r = Math.random() * 60 + 40;
    this.alive = true;
    this.dead = false;
    this.spawning = true;
    this.shotDelay = 200;
    this.speed = Math.random() * 2 * gameLevel/2 + gameLevel / 2;
    this.dir = Math.atan2(ship.y-this.y, ship.x-this.x);
    this.direction = Math.random() * Math.PI * 2;
    this.update = function() {
        if (this.spawning) {
            if (Math.random() > 0.5) { this.x = this.r * 2; } else { this.x = cnv.width - this.r * 2; }
            this.y = Math.random() * cnv.height * .8 + cnv.height * 0.1;
            this.spawning = false;
        }
        if (Math.random() > 0.99) {
            this.direction = Math.random() * Math.PI * 2;
        }
        this.dir = Math.atan2(ship.y-this.y, ship.x-this.x);
        this.x += this.speed * Math.cos(this.direction) + 1;
        this.y += this.speed * Math.sin(this.direction);
        if (this.x < 0) { this.x += cnv.width; }
        if (this.x > cnv.width) { this.x -= cnv.width; }
        if (this.y < 0) { this.y += cnv.height; }
        if (this.y > cnv.height) { this.y -= cnv.height; }
        if (deathTimer == 0) {
            this.shotDelay--; if (this.shotDelay < 0) { this.shotDelay = 0; }
            if (this.shotDelay == 0 & Math.random() > 0.99) {
                bullets.push(new UFOBullet(this.x + this.r*Math.cos(this.dir), this.y + this.r*Math.sin(this.dir), this.dir));
                this.shotDelay = 200;
                var ufoShotAudio = new Audio('../docs/assets/ufo-shot.wav');
                ufoShotAudio.play();
            }
        }
    }
    this.render = function() { 
        this.drawUFO(this.x, this.y, this.r);
        if (this.x - this.r < 0 ) { this.drawUFO(this.x + cnv.width, this.y, this.r); }
        if (this.x + this.r > cnv.width) { this.drawUFO(this.x - cnv.width, this.y, this.r); }
        if (this.y - this.r < 0 ) { this.drawUFO(this.x, this.y + cnv.height, this.r); } 
        if (this.y + this.r > cnv.height) { this.drawUFO(this.x, this.y - cnv.height, this.r); }
    }
    this.drawUFO = function(x, y, r) {
        ctx.strokeStyle = 'rgb(255,255,255)';
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.lineWidth = lineWidth;
        ctx.moveTo(x - r, y - r/10);
        ctx.lineTo(x - r, y - r/5);
        ctx.lineTo(x - r/2, y - r/3);
        ctx.arc(x - r/4, y - r/3, r/3.5, Math.PI, Math.PI * 2);
        ctx.lineTo(x - r/2, y - r/3);
        ctx.lineTo(x, y - r/3);
        ctx.lineTo(x + r/2, y - r/5);
        ctx.lineTo(x + r/2, y - r/10);
        ctx.lineTo(x - r, y - r/10);
        ctx.lineTo(x - r, y);
        ctx.lineTo(x + r/2, y);
        ctx.lineTo(x + r/2, y - r/10);
        ctx.lineTo(x + r/2, y + r/10);
        ctx.lineTo(x, y + r/3);
        ctx.lineTo(x - r/2, y + r/3);
        ctx.lineTo(x - r, y + r/10);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
}

// MAIN LOOP // 
function loop() {
    cnv.height = window.innerHeight - 4;
    cnv.width = window.innerWidth;
    shootTimer--; if (shootTimer < 0) { shootTimer = 0; }
    shakeTimer--; if (shakeTimer < 0) { shakeTimer = 0; } 
    // background
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    if (shakeTimer > 0) {
        ctx.translate(Math.random() * shakeTimer ** 2 / 2 - shakeTimer ** 2 / 4, Math.random() * shakeTimer ** 2 / 2 - shakeTimer ** 2 / 4);
    }
    if (Math.random() > 0.7) {background.push(new Star(Math.random() * cnv.width, cnv.height+20)); }
    // update and render //
    var new_parts = [];
        for (let part of background) {
        if (part.x + part.size * 5 > 0 & part.x - part.size * 5< cnv.width & part.y + part.size * 5 > 0 & part.y - part.size * 5 < cnv.height) {
            part.update();
            part.render();
            new_parts.push(part);
        }
        } parts = new_parts;
    if (!start) { 
        spawner.update();
        
        for (let roid of roids) {
            if (roid) { if (roid.alive) { roid.update(); roid.render(); } }
        } 
        var new_ents = [];
        for (let ent of entities) {
            if (ent) {
                if (ent.alive) {
                    ent.update();
                    ent.render();
                    new_ents.push(ent);
                }
            }
        } entities = new_ents;
        var new_bullets = [];
        for (let bullet of bullets) {
            if (bullet) {
                if (bullet.alive) {
                    bullet.update();
                    bullet.render();
                    new_bullets.push(bullet);
                }
            }
        } bullets = new_bullets;
        if (ship.alive) { ship.update(); ship.render(); } else {
        deathTimer--;
        if (deathTimer <= 0 & lives > 0 & !checkCollision(this.x, this.y, this.size)) {
            ship = new Ship();
        }
        }
        ui.update(); ui.render();
    }
    if (lives == 0) { gameOver.update(); gameOver.render(); }
    if (start) {

        gameStart.update(); gameStart.render(); ship.update(); ship.render();
        new_ents = [];
        for (let ent of entities) {
             if (ent) { 
                if (ent.alive) {
                     ent.update();
                    ent.render();
                     new_ents.push(ent); } } } entities = new_ents;
    }
    requestAnimationFrame(loop);
}
