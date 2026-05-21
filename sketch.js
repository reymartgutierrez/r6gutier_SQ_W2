// ============================================================
// Week 2 Example 1: Movement, Gravity, and Collision
// ============================================================

let player = {
  x: 200,
  y: 100,
  vx: 0,
  vy: 0,
  r: 24,
  facing: 1,
  speed: 0.5,
  maxSpeed: 4,
  jumpForce: -12,
  friction: 0.8,
  onGround: false,
};

const GRAVITY = 0.6;
let blobT = 0;
let floorY;
let bg;
let playerImg; 

// Platforms: edit positions here. Each platform has x, y (top), width, height, and type ('normal' or 'bounce').
let platforms = [
  { x: 150, y: 300, w: 140, h: 16, type: 'normal' },
  { x: 450, y: 250, w: 160, h: 16, type: 'normal' },
  { x: 320, y: 180, w: 120, h: 16, type: 'bounce' } // bounce platform
];

// ============================================================
// preload()
// NEW: Runs before setup(). Loads the background image so
// it's ready before the sketch starts.
// ============================================================
function preload() {
  bg = loadImage("assets/images/sushibackground.png");
  // Try to load a player sprite from assets/images/player.png.
  // If it doesn't exist, playerImg will be left null and the blob fallback will draw.
  loadImage(
    "assets/images/sushicharacter.png",
    (img) => {
      playerImg = img;
    },
    () => {
      playerImg = null;
    }
  );
}

function setup() {
  createCanvas(800, 450);
  floorY = height - 40;
  player.y = floorY - player.r;
}

function draw() {
  image(bg, 0, 0, width, height); // CHANGED: was background(10)

  drawFloor();
  drawPlatforms();
  handleInput();
  applyPhysics();
  drawPlayer();
  drawHUD();

  blobT += 0.015;
}

function handleInput() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    player.vx -= player.speed;
    player.facing = 1;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    player.vx += player.speed;
    player.facing = -1;
  }

  player.vx = constrain(player.vx, -player.maxSpeed, player.maxSpeed);

  if (
    !keyIsDown(LEFT_ARROW) &&
    !keyIsDown(65) &&
    !keyIsDown(RIGHT_ARROW) &&
    !keyIsDown(68)
  ) {
    player.vx *= player.friction;
  }

  if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && player.onGround) {
    player.vy = player.jumpForce;
    player.onGround = false;
  }
}

function applyPhysics() {
  player.vy += GRAVITY;
  player.x += player.vx;
  let prevY = player.y;
  player.y += player.vy;

  // Check collisions with platforms
  checkPlatformCollisions(prevY);

  // Floor collision (keeps player above ground)
  if (player.y + player.r >= floorY) {
    player.y = floorY - player.r;
    player.vy = 0;
    player.onGround = true;
  } else {
    // only set to false if no platform placed us on ground
    // checkPlatformCollisions will set player.onGround = true when appropriate
    if (!player.onGround) player.onGround = false;
  }

  player.x = constrain(player.x, player.r, width - player.r);
}

function drawPlayer() {
  if (playerImg) {
    push();
    imageMode(CENTER);
    // Translate to player position, then scale by facing (-1 to flip horizontally)
    translate(player.x, player.y);
    scale(player.facing, 1);
    // Draw at 0,0 because we've translated to the player's center
    image(playerImg, 0, 0, player.r * 3, player.r * 3);
    pop();
  } else {
    push();
    fill(0, 200, 180);
    noStroke();

    beginShape();
    let numPoints = 48;
    for (let i = 0; i < numPoints; i++) {
      let angle = (TWO_PI / numPoints) * i;
      let noiseVal = noise(cos(angle) * 0.8 + blobT, sin(angle) * 0.8 + blobT);
      let r = player.r + map(noiseVal, 0, 1, -8, 8);
      let vertX = player.x + cos(angle) * r;
      let vertY = player.y + sin(angle) * r;
      vertex(vertX, vertY);
    }
    endShape(CLOSE);

    fill(10);
    ellipse(player.x - 8, player.y - 6, 8, 8);
    ellipse(player.x + 8, player.y - 6, 8, 8);

    pop();
  }
}

function drawFloor() {
  // Red floor
  fill(200, 30, 30);
  noStroke();
  rect(0, floorY, width, height - floorY);
}

// Draw platforms defined in the `platforms` array
function drawPlatforms() {
  for (let p of platforms) {
    if (p.type === 'bounce') {
      fill(255, 150, 0);
    } else {
      fill(200, 30, 30);
    }
    noStroke();
    rect(p.x, p.y, p.w, p.h);
  }
}

// Check collisions with platforms; prevY is the player's y before applying vertical movement
function checkPlatformCollisions(prevY) {
  for (let p of platforms) {
    // Only consider collisions when player is moving downward (vy >= 0)
    if (
      player.vy >= 0 &&
      prevY + player.r <= p.y &&
      player.y + player.r >= p.y &&
      player.x > p.x - player.r &&
      player.x < p.x + p.w + player.r
    ) {
      // Land on the platform
      player.y = p.y - player.r;
      player.onGround = true;

      if (p.type === 'bounce') {
        // Bounce effect: give a stronger upward velocity
        player.vy = player.jumpForce * 1.5;
        player.onGround = false; // still moving after bounce
      } else {
        player.vy = 0;
      }
    }
  }
}

function drawHUD() {
  fill(180);
  noStroke();
  textSize(13);
  textAlign(LEFT);
  text("Move: Arrow Keys or WASD   Jump: W or Up Arrow", 16, 24);
}
