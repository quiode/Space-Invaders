"use strict";
var Player = /** @class */ (function () {
    function Player(canvas, position, size) {
        if (position === void 0) { position = { x: 0, y: 0 }; }
        if (size === void 0) { size = 50; }
        this.canvas = canvas;
        this.position = position;
        this.size = size;
        this.img_url = 'assets/player.png';
        this.shots = [];
        this.ctx = canvas.getContext('2d');
        this.img = new Image();
        this.img.src = this.img_url;
    }
    Player.prototype.draw = function () {
        // Draws the player
        this.ctx.drawImage(this.img, this.position.x, this.position.y, this.size, this.size);
        // Makes a shot
        this.shoot();
    };
    Player.prototype.shoot = function () {
        // Makes a shot
        this.shots.push(new Shot(this.canvas, this.position));
    };
    return Player;
}());
var Enemy = /** @class */ (function () {
    function Enemy(canvas, size, position) {
        if (position === void 0) { position = { x: 0, y: 0 }; }
        this.canvas = canvas;
        this.size = size;
        this.position = position;
        this.img_url = 'assets/enemy.png';
        this.go_left = false;
        this.ctx = this.canvas.getContext('2d');
        this.img = new Image();
        this.img.src = this.img_url;
    }
    Enemy.prototype.move = function () {
        var step = 0.25;
        // Checks if the enemy as reached the left or right edge of the screen
        if (this.position.x > this.canvas.width - this.canvas.width / 20 - this.size) {
            this.go_left = true;
            this.position.x -= step;
            this.position.y += this.size;
        }
        else if (this.position.x < this.canvas.width / 20) {
            this.go_left = false;
            this.position.x += step;
            this.position.y += this.size;
        }
        // Moves the enemy
        this.position.x += this.go_left ? -step : step;
        this.draw();
    };
    Enemy.prototype.draw = function () {
        // Draws the enemy
        this.ctx.drawImage(this.img, this.position.x, this.position.y, this.size, this.size);
    };
    return Enemy;
}());
var Shot = /** @class */ (function () {
    function Shot(canvas, position) {
        if (position === void 0) { position = { x: 0, y: 0 }; }
        this.canvas = canvas;
        this.position = position;
        this.ctx = this.canvas.getContext('2d');
    }
    Shot.prototype.draw = function () {
        // Draws the shot
        this.ctx.moveTo(this.position.x, this.position.y);
        this.ctx.lineWidth = 5;
        // stroke style red in hex
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineTo(this.position.x, this.position.y + 10);
    };
    Shot.prototype.move = function () {
        this.position.y += 1;
        this.draw();
    };
    return Shot;
}());
var Game = /** @class */ (function () {
    function Game(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.background_img = new Image();
        this.enemies = [];
    }
    Game.prototype.load_game = function () {
        this.create_background();
        this.create_player();
        this.create_enemies();
    };
    Game.prototype.start_game = function () {
        var _this = this;
        this.load_game();
        // Game loup
        var loop = setInterval(function () {
            _this.clear();
            _this.draw_background();
            _this.enemies.forEach(function (enemy) {
                enemy.move();
            });
            _this.player.draw();
        }, 1000 / 60);
    };
    Game.prototype.create_player = function () {
        var size = 25;
        this.player = new Player(this.canvas, {
            x: this.canvas.width / 2 - size / 2,
            y: this.canvas.height - size - size / 5,
        }, size);
    };
    Game.prototype.create_enemies = function () {
        var row_amount = 10;
        var size = (this.canvas.width - this.canvas.width / 10) / 2;
        for (var i = 0; i < row_amount; i++) {
            this.enemies.push(new Enemy(this.canvas, size / row_amount, {
                x: (size / row_amount) * i + this.canvas.width / 20,
                y: 0,
            }));
        }
    };
    Game.prototype.create_background = function () {
        var _this = this;
        this.background_img.onload = function () {
            var _a;
            (_a = _this.context) === null || _a === void 0 ? void 0 : _a.drawImage(_this.background_img, 0, 0, _this.canvas.width, _this.canvas.height);
        };
        this.background_img.src = 'assets/background.jpg';
    };
    Game.prototype.draw_background = function () {
        var _a;
        (_a = this.context) === null || _a === void 0 ? void 0 : _a.drawImage(this.background_img, 0, 0, this.canvas.width, this.canvas.height);
    };
    Game.prototype.clear = function () {
        var _a;
        (_a = this.context) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    return Game;
}());
// Appears Title Screen
window.addEventListener('load', function () {
    var title_header = document.getElementsByTagName('header')[0];
    var transition_time = 5;
    title_header.style.opacity = '1';
    title_header.style.transitionDuration = transition_time + 's';
    // Let's the player start the game witch a click
    document.getElementsByTagName('header')[0].addEventListener('click', load_game);
});
// Loads the game
function load_game() {
    // Removes the title screen
    var title_header = document.getElementsByTagName('header')[0];
    title_header.style.display = 'none';
    // Loads the game
    var game = new Game(document.getElementsByTagName('canvas')[0]);
    game.start_game();
}
//# sourceMappingURL=script.js.map