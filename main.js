
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game, x, y) {
    this.player = 1;
    this.radius = 5;
    this.visualRadius = 20;
    this.health = 100;
    this.colors = ["Red", "Green", "Blue", "White"];
  //  Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
    Entity.call(this, game, this.radius + x, this.radius + y);
  
    this.setNoType();
    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
    this.following;
    
    console.log(this.following);
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;


Circle.prototype.setNoType = function () {
    this.color = 3;
    this.visualRadius = 200;
};
Circle.prototype.setFireType = function () {
    this.color = 0;
    this.visualRadius = 70;
};

Circle.prototype.setGrassType = function () {
    this.color = 1;
    this.visualRadius = 70;
    
    //this.velocity.x = -this.velocity.x;
   // this.velocity.y = -this.velocity.y;
}
Circle.prototype.setWaterType = function () {
    this.color = 2;
    
   // this.velocity.x = -this.velocity.x;
    this.visualRadius = 70;
}

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
    
  
    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius+5;
        if (this.collideRight()) this.x = 800 - this.radius-5;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius+5;
        if (this.collideBottom()) this.y = 800 - this.radius-5;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        
        var ent = this.game.entities[i];
        if (!ent.removeFromWorld) {
            if (ent !== this && this.collide(ent)) {
                this.battle(ent);
            }
           
            if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
                var dist = distance(this, ent);
                if (this.following === undefined && (this.color + 1) % 3 === ent.color) {
                    this.following = ent;
                }
                
                if (this.following !== undefined) {
                    if (!this.following.removeFromWorld) {
                        var difX = (this.following.x - this.x)/dist;
                        var difY = (this.following.y - this.y)/dist;
                        this.velocity.x += difX * acceleration / (dist*dist);
                        this.velocity.y += difY * acceleration / (dist * dist);
                        var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                        if (speed > maxSpeed) {
                            var ratio = maxSpeed / speed;
                            this.velocity.x *= ratio;
                            this.velocity.y *= ratio;
                        }
                    } else {
                        this.following = undefined;
                    } 
                } 
            }  if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: 10 }) && !ent.removeFromWorld) {
                var difX = (ent.x - this.x) / dist ;
                var difY = (ent.y - this.y) / dist ;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            } 
        
        }

    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.battle = function (ent) {
    if ((this.color + 1) % 3 === ent.color) {
        ent.health -= 1;
        if (ent.health < 1) {
            ent.removeFromWorld = true;
        }
    } else if ((this.color + 2) % 3 === ent.color) {
        this.health -= 1;
        if (this.health < 1) {
            this.removeFromWorld = true;
        }
    }

    this.bumpEachOther(ent);
}

Circle.prototype.bumpEachOther = function (ent) {
    var temp = { x: this.velocity.x, y: this.velocity.y };
    
    var dist = distance(this, ent);
    var delta = this.radius + ent.radius - dist;
    var difX = (this.x - ent.x)/dist;
    var difY = (this.y - ent.y)/dist;

    this.x += difX * delta / 1;
    this.y += difY * delta / 1;
    ent.x -= difX * delta / 1;
    ent.y -= difY * delta / 1;

    this.velocity.x = ent.velocity.x * friction + 10;
    this.velocity.y = ent.velocity.y * friction + 10;

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    ent.velocity.x = temp.x * friction + 10;
    ent.velocity.y = temp.y * friction + 10;

    var speed = Math.sqrt(ent.velocity.x * ent.velocity.x + ent.velocity.y * ent.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        ent.velocity.x *= ratio;
        ent.velocity.y *= ratio;
    }
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    ent.x += ent.velocity.x * this.game.clockTick;
    ent.y += ent.velocity.y * this.game.clockTick;

}

Circle.prototype.draw = function (ctx) {
    if (!this.removeFromWorld) {
        ctx.beginPath();
        ctx.fillStyle = this.colors[this.color];
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    }
};



// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var itAcceleration = 10000;
var maxSpeed = 100;
var chaseMaxSpeed = 130;
var itMaxSpeed = 80;
var vaccineMaxSpeed = 85;
var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
   
 /*
    var circle = new Circle(gameEngine, 0, 0);
    circle.setGrassType();
    gameEngine.addEntity(circle);

    circle = new Circle(gameEngine, 450, 700);
    circle.setWaterType();
    gameEngine.addEntity(circle);
 
    circle = new Circle(gameEngine, 900, 0);
    circle.setFireType();
    gameEngine.addEntity(circle);
*/


    var circle;    
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 10; j++) {
            circle = new Circle(gameEngine, 50+j*15, 0 + i*15);
            circle.setFireType();
            gameEngine.addEntity(circle);
        }
    }

    
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 10; j++) {
            circle = new Circle(gameEngine, 300+j*15, 800+i*15);
            circle.setGrassType();
            gameEngine.addEntity(circle);
        }
    }

    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 10; j++) {
            circle = new Circle(gameEngine, 600+j*15, 0+i*15);
            circle.setWaterType();
            gameEngine.addEntity(circle);
        }
    }


    gameEngine.init(ctx);
    gameEngine.start();
});
