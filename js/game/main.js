import { LEVELS, parseLevel, TILE } from "./levels.js";
import { createPlayer, createEnemy, createPickup, updatePlayer, updateEnemy } from "./entities.js";
import {
  tryAttack,
  processCombat,
  collectPickups,
  maybeDropPickup,
  roomCleared,
} from "./combat.js";
import { createInput } from "./input.js";
import { drawGame, addShake } from "./render.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const hintEl = document.getElementById("game-hint");

const input = createInput(canvas);

const game = {
  state: "title",
  levelIndex: 0,
  walls: [],
  player: null,
  enemies: [],
  pickups: [],
  projectiles: [],
  particles: [],
  door: null,
  levelName: "",
  message: { title: "Skullboy Dungeon", sub: "Press Enter or tap Start" },
};

function loadLevel(index) {
  const level = LEVELS[index];
  const parsed = parseLevel(level);
  game.walls = parsed.walls;
  game.door = parsed.door;
  game.levelName = level.name;
  game.levelIndex = index;
  game.player = createPlayer(parsed.spawns.player.x, parsed.spawns.player.y);
  game.enemies = parsed.spawns.enemies.map((s) =>
    createEnemy(s.type, s.x, s.y, index === 2 && s.type === "skeleton")
  );
  game.pickups = parsed.spawns.pickups.map((p) => createPickup(p.kind, p.x, p.y));
  game.projectiles = [];
  game.particles = [];
  if (hintEl) hintEl.textContent = level.hint;
}

function startGame() {
  game.state = "playing";
  loadLevel(0);
}

function nextLevel() {
  if (game.levelIndex >= LEVELS.length - 1) {
    game.state = "win";
    game.message = { title: "Dungeon cleared!", sub: "Refresh to play again" };
    return;
  }
  loadLevel(game.levelIndex + 1);
  game.state = "playing";
}

let last = performance.now();
let running = true;

function update(dt) {
  game.particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
  });
  game.particles = game.particles.filter((p) => p.life > 0);

  game.projectiles.forEach((p) => {
    p.x += p.vx;
    p.life -= 1;
  });
  game.projectiles = game.projectiles.filter((p) => p.life > 0);

  if (game.state !== "playing") return;

  const inp = input.poll();
  if (inp.attackPressed) tryAttack(game.player, game.projectiles);
  updatePlayer(game.player, game.walls, inp, dt);
  game.enemies.forEach((e) => updateEnemy(e, game.player, game.walls, dt));
  processCombat(game.player, game.enemies, game.projectiles, game.particles);
  collectPickups(game.player, game.pickups);
  game.enemies.forEach((e) => maybeDropPickup(e, game.pickups));

  if (game.player.hp <= 0) {
    game.state = "gameOver";
    game.message = { title: "Game Over", sub: "Press Enter to retry" };
    addShake(8);
    return;
  }

  if (roomCleared(game.enemies) && game.door) game.door.locked = false;

  if (game.door && !game.door.locked) {
    const d = game.door;
    const p = game.player;
    if (p.x + p.w > d.x && p.x < d.x + d.w && p.y + p.h > d.y && p.y < d.y + d.h) {
      nextLevel();
    }
  }
}

function loop(now) {
  if (!running) return;
  const dt = Math.min(32, now - last);
  last = now;
  update(dt);
  drawGame(ctx, game);
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (game.state === "title") startGame();
    else if (game.state === "gameOver") startGame();
    else if (game.state === "win") startGame();
  }
});

document.getElementById("game-start")?.addEventListener("click", startGame);

document.addEventListener("visibilitychange", () => {
  running = !document.hidden;
  if (running) requestAnimationFrame(loop);
});

requestAnimationFrame(loop);
