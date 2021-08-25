type position = {
  x: number;
  y: number;
};

// Game Event
const win_event = new CustomEvent('game_won');
const loose_event = new CustomEvent('game_lost');

class Player {
  constructor(
    private canvas: HTMLCanvasElement,
    private position: position = { x: 0, y: 0 },
    private size = 50
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.img = new Image();
    this.img.src = this.img_url;
    // For controls
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.shouldMove = true;
        this.direction = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.shouldMove = true;
        this.direction = true;
      }
    });
    document.addEventListener('keyup', (e: KeyboardEvent) => {
      if (
        e.code === 'ArrowLeft' ||
        e.code === 'KeyA' ||
        e.code === 'ArrowRight' ||
        e.code === 'KeyD'
      ) {
        this.shouldMove = false;
      }
    });
  }
  private shouldMove: boolean = false; // if player moves
  /**
   * true = right
   */
  private direction: boolean = false; // direction = true -> right
  private img_url = 'assets/player.png';
  private ctx: CanvasRenderingContext2D;
  private img: HTMLImageElement;
  public shots: Shot[] = [];
  private static shootingSpead = 60 * 0.75; // in frames
  private shootingCounter = 0;

  draw() {
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
  }

  private shoot() {
    // Makes a shot
    this.shots.push(
      new Shot(this.canvas, {
        x: this.position.x + this.size / 2,
        y: this.position.y - this.size / 2,
      })
    );
  }

  private move() {
    const step = 1;
    const buffer = this.size / 5;
    if (this.shouldMove) {
      if (this.direction && this.position.x + this.size < this.canvas.width - buffer) {
        this.position.x += step;
      } else if (!this.direction && this.position.x > 0 + buffer) {
        this.position.x -= step;
      }
    }
  }
}

class Enemy {
  constructor(
    private canvas: HTMLCanvasElement,
    public size: number,
    public position: position = { x: 0, y: 0 }
  ) {
    this.ctx = this.canvas.getContext('2d')!;
    this.img = new Image();
    this.img.src = this.img_url;
  }
  private img_url = 'assets/enemy.png';
  private img: HTMLImageElement;
  private go_left = false;
  private ctx: CanvasRenderingContext2D;
  public health = 100;

  move() {
    let step = 0.25;
    // Checks if the enemy as reached the left or right edge of the screen
    if (this.position.x > this.canvas.width - this.canvas.width / 20 - this.size) {
      this.go_left = true;
      this.position.x -= step;
      this.position.y += this.size;
    } else if (this.position.x < this.canvas.width / 20) {
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
  }

  private draw() {
    // Draws the enemy
    this.ctx.drawImage(this.img, this.position.x, this.position.y, this.size, this.size);
  }
}

class Shot {
  private ctx: CanvasRenderingContext2D;
  constructor(private canvas: HTMLCanvasElement, private position: position = { x: 0, y: 0 }) {
    this.ctx = this.canvas.getContext('2d')!;
  }
  private strokeLength = 10;

  private draw() {
    // Draws the shot
    this.ctx.beginPath();
    this.ctx.moveTo(this.position.x, this.position.y);
    this.ctx.lineWidth = 2;
    // stroke style red in hex
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineTo(this.position.x, this.position.y + this.strokeLength);
    this.ctx.stroke();
  }

  move() {
    this.position.y -= 1;
    this.draw();
  }

  collisionCheck(enemies: Enemy[], wave: number, maxWaves: number) {
    // Checks if the shot has collided with an enemy
    let collided = false;
    enemies.forEach((enemy) => {
      if (
        this.position.x >= enemy.position.x &&
        this.position.x <= enemy.position.x + enemy.size &&
        this.position.y >= enemy.position.y &&
        this.position.y <= enemy.position.y + enemy.size
      ) {
        collided = true;
        if (wave <= maxWaves / 3) {
          enemy.health -= 101;
        } else if (wave <= (maxWaves / 3) * 2) {
          enemy.health -= 51;
        } else {
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
  }
}

class Game {
  private context = this.canvas.getContext('2d');
  private background_img = new Image();
  constructor(private canvas: HTMLCanvasElement) {
    // Subscribe to events
    document.addEventListener('game_won', () => {
      this.win_screen();
    });
    document.addEventListener('game_lost', () => {
      this.loose_screen();
    });
  }
  player!: Player;
  enemies: Enemy[] = [];

  private load_game() {
    this.create_background();
    this.create_player();
    this.create_enemies();
  }

  public start_game() {
    const waves = 6;
    let wave = 1;
    const spawn_rate = 60 * 15; // in framess
    let spawn_rate_counter = 0;

    this.load_game();
    // Game loup
    let loop = setInterval(() => {
      this.clear();

      // Spawns enemies
      if (spawn_rate_counter >= spawn_rate) {
        if (wave < waves) {
          this.create_enemies();
          wave++;
          spawn_rate_counter = 0;
        }
      }
      spawn_rate_counter++;

      this.draw_background();
      this.enemies.forEach((enemy) => {
        enemy.move();
      });
      this.player.draw();
      this.player.shots.forEach((shot) => {
        if (shot.collisionCheck(this.enemies, wave, waves)) {
          this.player.shots.splice(this.player.shots.indexOf(shot), 1);
        } else {
          shot.move();
        }
      });
    }, 1000 / 60);
  }

  private create_player() {
    let size = 25;
    this.player = new Player(
      this.canvas,
      {
        x: this.canvas.width / 2 - size / 2,
        y: this.canvas.height - size - size / 5,
      },
      size
    );
  }

  private create_enemies() {
    let row_amount = 10;
    let size = (this.canvas.width - this.canvas.width / 10) / 2;
    for (let i = 0; i < row_amount; i++) {
      this.enemies.push(
        new Enemy(this.canvas, size / row_amount, {
          x: (size / row_amount) * i + this.canvas.width / 20,
          y: 0,
        })
      );
    }
  }

  private create_background() {
    this.background_img.onload = () => {
      this.context?.drawImage(this.background_img, 0, 0, this.canvas.width, this.canvas.height);
    };
    this.background_img.src = 'assets/background.jpg';
  }

  private draw_background() {
    this.context?.drawImage(this.background_img, 0, 0, this.canvas.width, this.canvas.height);
  }

  private clear() {
    this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private loose_screen() {
    this.canvas.style.display = 'none';
    document.getElementById('loose')!.style.display = 'block';
  }

  private win_screen() {
    this.canvas.style.display = 'none';
    document.getElementById('win')!.style.display = 'block';
  }
}

// Appears Title Screen
window.addEventListener('load', () => {
  let title_header = document.getElementsByTagName('header')[0] as unknown as HTMLHeadingElement;
  const transition_time = 5;
  title_header.style.opacity = '1';
  title_header.style.transitionDuration = transition_time + 's';

  // Let's the player start the game witch a click
  (document.getElementsByTagName('header')[0] as HTMLCanvasElement).addEventListener(
    'click',
    load_game
  );
});

// Loads the game
function load_game() {
  // Removes the title screen
  let title_header = document.getElementsByTagName('header')[0] as unknown as HTMLHeadingElement;
  title_header.style.display = 'none';

  // Loads the game
  (document.getElementsByTagName('canvas')[0] as HTMLCanvasElement).style.display = 'block';
  let game = new Game(document.getElementsByTagName('canvas')[0] as HTMLCanvasElement);
  game.start_game();
}
