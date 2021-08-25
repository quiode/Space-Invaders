type position = {
  x: number;
  y: number;
};

class Player {
  constructor(
    private canvas: HTMLCanvasElement,
    private position: position = { x: 0, y: 0 },
    private size = 50
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.img = new Image();
    this.img.src = this.img_url;
  }
  private img_url = 'assets/player.png';
  private ctx: CanvasRenderingContext2D;
  private img: HTMLImageElement;
  private shots: Shot[] = [];

  draw() {
    // Draws the player
    this.ctx.drawImage(this.img, this.position.x, this.position.y, this.size, this.size);

    // Makes a shot
    this.shoot();
  }

  private shoot() {
    // Makes a shot
    this.shots.push(new Shot(this.canvas, this.position));
  }
}

class Enemy {
  constructor(
    private canvas: HTMLCanvasElement,
    private size: number,
    private position: position = { x: 0, y: 0 }
  ) {
    this.ctx = this.canvas.getContext('2d')!;
    this.img = new Image();
    this.img.src = this.img_url;
  }
  private img_url = 'assets/enemy.png';
  private img: HTMLImageElement;
  private go_left = false;
  private ctx: CanvasRenderingContext2D;

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
    this.draw();
  }

  private draw() {
    // Draws the enemy
    this.ctx.drawImage(this.img, this.position.x, this.position.y, this.size, this.size);
  }
}

class Shot {
  ctx: CanvasRenderingContext2D;
  constructor(private canvas: HTMLCanvasElement, private position: position = { x: 0, y: 0 }) {
    this.ctx = this.canvas.getContext('2d')!;
  }

  private draw() {
    // Draws the shot
    this.ctx.moveTo(this.position.x, this.position.y);
    this.ctx.lineWidth = 5;
    // stroke style red in hex
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineTo(this.position.x, this.position.y + 10);
  }

  move() {
    this.position.y += 1;
    this.draw();
  }
}

class Game {
  private context = this.canvas.getContext('2d');
  private background_img = new Image();
  constructor(private canvas: HTMLCanvasElement) {}
  player!: Player;
  enemies: Enemy[] = [];

  private load_game() {
    this.create_background();
    this.create_player();
    this.create_enemies();
  }

  public start_game() {
    this.load_game();
    // Game loup
    let loop = setInterval(() => {
      this.clear();

      this.draw_background();
      this.enemies.forEach((enemy) => {
        enemy.move();
      });
      this.player.draw();
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
  let game = new Game(document.getElementsByTagName('canvas')[0] as HTMLCanvasElement);
  game.start_game();
}
