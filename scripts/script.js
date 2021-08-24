"use strict";
var Player = /** @class */ (function () {
    function Player(position, canvas) {
        if (position === void 0) { position = { x: 0, y: 0 }; }
        this.position = position;
        this.canvas = canvas;
        this.img_url = 'assets/player.png';
    }
    Player.prototype.draw = function () { };
    return Player;
}());
var Enemy = /** @class */ (function () {
    function Enemy(position, canvas) {
        if (position === void 0) { position = { x: 0, y: 0 }; }
        this.position = position;
        this.canvas = canvas;
        this.img_url = 'assets/player.png';
    }
    Enemy.prototype.move = function (x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.position.x += x;
        this.position.y += y;
    };
    Enemy.prototype.draw = function () { };
    return Enemy;
}());
var Shot = /** @class */ (function () {
    function Shot(position, canvas) {
        if (position === void 0) { position = { x: 0, y: 0 }; }
        this.position = position;
        this.canvas = canvas;
    }
    Shot.prototype.draw = function () { };
    return Shot;
}());
var Game = /** @class */ (function () {
    function Game(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.background_img = new Image();
    }
    Game.prototype.load_game = function () {
        this.create_background();
    };
    Game.prototype.start_game = function () { };
    Game.prototype.create_player = function () { };
    Game.prototype.create_enemies = function () { };
    Game.prototype.create_background = function () {
        var _this = this;
        this.background_img.onload = function () {
            var _a;
            (_a = _this.context) === null || _a === void 0 ? void 0 : _a.drawImage(_this.background_img, 0, 0, _this.canvas.width, _this.canvas.height);
        };
        this.background_img.src = 'assets/background.jpg';
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
    game.load_game();
}
//# sourceMappingURL=script.js.map