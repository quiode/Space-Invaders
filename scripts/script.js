"use strict";
// Game Event
var win_event = new CustomEvent('game_won');
var loose_event = new CustomEvent('game_lost');
var Player = /** @class */ (function () {
    function Player(canvas, position, size) {
        var _this = this;
        if (position === void 0) { position = { x: 0, y: 0 }; }
        if (size === void 0) { size = 50; }
        this.canvas = canvas;
        this.position = position;
        this.size = size;
        this.shouldMove = false; // if player moves
        /**
         * true = right
         */
        this.direction = false; // direction = true -> right
        this.img_url = 'assets/player.png';
        this.shots = [];
        this.shootingCounter = 0;
        this.ctx = canvas.getContext('2d');
        this.img = new Image();
        this.img.src = this.img_url;
        // For controls
        document.addEventListener('keydown', function (e) {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                _this.shouldMove = true;
                _this.direction = false;
            }
            else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                _this.shouldMove = true;
                _this.direction = true;
            }
        });
        document.addEventListener('keyup', function (e) {
            if (e.code === 'ArrowLeft' ||
                e.code === 'KeyA' ||
                e.code === 'ArrowRight' ||
                e.code === 'KeyD') {
                _this.shouldMove = false;
            }
        });
    }
    Player.prototype.draw = function () {
        // Moves the player
        this.move();
        // Draws the player
        this.ctx.drawImage(this.img, this.position.x, this.position.y, this.size, this.size);
        // Makes a shot
        if (this.shootingCounter >= Player.shootingSpead) {
            this.shoot();
            this.shootingCounter = 0;
        }
        this.shootingCounter++;
    };
    Player.prototype.shoot = function () {
        // Makes a shot
        this.shots.push(new Shot(this.canvas, {
            x: this.position.x + this.size / 2,
            y: this.position.y - this.size / 2,
        }));
    };
    Player.prototype.move = function () {
        var step = 1;
        var buffer = this.size / 5;
        if (this.shouldMove) {
            if (this.direction && this.position.x + this.size < this.canvas.width - buffer) {
                this.position.x += step;
            }
            else if (!this.direction && this.position.x > 0 + buffer) {
                this.position.x -= step;
            }
        }
    };
    Player.shootingSpead = 60 * 0.75; // in frames
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
        this.health = 100;
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
        if (this.position.y > (this.canvas.height / 10) * 8) {
            document.dispatchEvent(loose_event);
        }
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
        this.strokeLength = 10;
        this.ctx = this.canvas.getContext('2d');
    }
    Shot.prototype.draw = function () {
        // Draws the shot
        this.ctx.beginPath();
        this.ctx.moveTo(this.position.x, this.position.y);
        this.ctx.lineWidth = 2;
        // stroke style red in hex
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineTo(this.position.x, this.position.y + this.strokeLength);
        this.ctx.stroke();
    };
    Shot.prototype.move = function () {
        this.position.y -= 1;
        this.draw();
    };
    Shot.prototype.collisionCheck = function (enemies, wave, maxWaves) {
        var _this = this;
        // Checks if the shot has collided with an enemy
        var collided = false;
        enemies.forEach(function (enemy) {
            if (_this.position.x >= enemy.position.x &&
                _this.position.x <= enemy.position.x + enemy.size &&
                _this.position.y >= enemy.position.y &&
                _this.position.y <= enemy.position.y + enemy.size) {
                collided = true;
                if (wave <= maxWaves / 3) {
                    enemy.health -= 101;
                }
                else if (wave <= (maxWaves / 3) * 2) {
                    enemy.health -= 51;
                }
                else {
                    enemy.health -= 34;
                }
                if (enemy.health <= 0) {
                    enemies.splice(enemies.indexOf(enemy), 1);
                    if (wave == maxWaves && enemies.length === 0) {
                        document.dispatchEvent(win_event);
                    }
                }
            }
        });
        return collided;
    };
    return Shot;
}());
var Game = /** @class */ (function () {
    function Game(canvas) {
        var _this = this;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.background_img = new Image();
        this.enemies = [];
        // Subscribe to events
        document.addEventListener('game_won', function () {
            _this.win_screen();
        });
        document.addEventListener('game_lost', function () {
            _this.loose_screen();
        });
    }
    Game.prototype.load_game = function () {
        this.create_background();
        this.create_player();
        this.create_enemies();
    };
    Game.prototype.start_game = function () {
        var _this = this;
        var waves = 6;
        var wave = 1;
        var spawn_rate = 60 * 15; // in framess
        var spawn_rate_counter = 0;
        this.load_game();
        // Game loup
        var loop = setInterval(function () {
            _this.clear();
            // Spawns enemies
            if (spawn_rate_counter >= spawn_rate) {
                if (wave < waves) {
                    _this.create_enemies();
                    wave++;
                    spawn_rate_counter = 0;
                }
            }
            spawn_rate_counter++;
            _this.draw_background();
            _this.enemies.forEach(function (enemy) {
                enemy.move();
            });
            _this.player.draw();
            _this.player.shots.forEach(function (shot) {
                if (shot.collisionCheck(_this.enemies, wave, waves)) {
                    _this.player.shots.splice(_this.player.shots.indexOf(shot), 1);
                }
                else {
                    shot.move();
                }
            });
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
    Game.prototype.loose_screen = function () {
        this.canvas.style.display = 'none';
        document.getElementById('loose').style.display = 'block';
    };
    Game.prototype.win_screen = function () {
        this.canvas.style.display = 'none';
        document.getElementById('win').style.display = 'block';
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
    document.getElementsByTagName('canvas')[0].style.display = 'block';
    var game = new Game(document.getElementsByTagName('canvas')[0]);
    game.start_game();
}
//# sourceMappingURL=script.js.map