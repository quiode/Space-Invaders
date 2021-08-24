type position = {
  x: number;
  y: number;
};

class Player {
  constructor(private position: position = { x: 0, y: 0 }, private canvas: HTMLCanvasElement) {}
  img_url = 'assets/player.png';

  draw() {}
}

class Enemy {
  constructor(private position: position = { x: 0, y: 0 }, private canvas: HTMLCanvasElement) {}
  img_url = 'assets/player.png';

  move(x: number = 0, y: number = 0) {
    this.position.x += x;
    this.position.y += y;
  }

  draw() {}
}

class Shot {
  constructor(private position: position = { x: 0, y: 0 }, private canvas: HTMLCanvasElement) {}

  draw() {}
}

class Game {
  private context = this.canvas.getContext('2d');
  private background_img = new Image();
  constructor(private canvas: HTMLCanvasElement) {
    this.background_img.src = 'assets/background.png';
  }

  load_game() {
    this.create_background();
  }

  start_game() {}

  create_player() {}

  create_enemies() {}

  create_background() {
    this.context?.drawImage(this.background_img, 0, 0);
  }

  clear() {
    this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Appears Title Screen
window.addEventListener('load', () => {
  let title_header = document.getElementsByTagName('header')[0] as unknown as HTMLHeadingElement;
  const transition_time = 5;
  title_header.style.opacity = '1';
  title_header.style.transitionDuration = transition_time + 's';

  // Let's the player start the game after the title screen has loaded
  setTimeout(() => {
    (document.getElementsByTagName('canvas')[0] as HTMLCanvasElement).addEventListener(
      'click',
      load_game
    );
  }, transition_time * 1000);
});

/**
 * @description Starts the Game
 */
function load_game() {
  // Removes the title screen
  let title_header = document.getElementsByTagName('header')[0] as unknown as HTMLHeadingElement;
  title_header.style.display = 'none';

  // Loads the game
  let game = new Game(document.getElementsByTagName('canvas')[0] as HTMLCanvasElement);
  game.load_game();
}
