import { TILE } from "./levels.js";

let shake = 0;

export function addShake(amount) {
  shake = Math.max(shake, amount);
}

export function drawGame(ctx, game) {
  const { walls, player, enemies, pickups, projectiles, particles, door, levelIndex, levelName, state, message } =
    game;

  shake *= 0.85;
  const ox = (Math.random() - 0.5) * shake;
  const oy = (Math.random() - 0.5) * shake;
  ctx.save();
  ctx.translate(ox, oy);

  ctx.fillStyle = "#1a1a24";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = "#2a2a38";
  for (const w of walls) {
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = "#3d3d4d";
    ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
  }

  if (door) {
    ctx.fillStyle = door.locked ? "#5a3d2b" : "#7fff7f";
    ctx.fillRect(door.x, door.y, door.w, door.h);
    ctx.fillStyle = "#fff";
    ctx.font = "12px sans-serif";
    ctx.fillText(door.locked ? "LOCK" : "EXIT", door.x + 4, door.y + 20);
  }

  pickups.forEach((p) => {
    if (p.taken) return;
    const colors = { health: "#ff6b6b", bat: "#c9a227", bolt: "#6bcbff", speed: "#ffe66d", damage: "#ff9f43" };
    ctx.fillStyle = colors[p.kind] || "#aaa";
    ctx.beginPath();
    ctx.arc(p.x + 10, p.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  enemies.forEach((e) => drawEnemy(ctx, e));
  projectiles.forEach((p) => {
    ctx.fillStyle = "#a8e6ff";
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });
  drawPlayer(ctx, player);
  particles.forEach((p) => {
    ctx.globalAlpha = p.life / 35;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 4, 4);
    ctx.globalAlpha = 1;
  });

  ctx.restore();

  drawHUD(ctx, player, levelIndex, levelName, state, message);
}

function drawPlayer(ctx, p) {
  if (p.hurtTimer > 0 && Math.floor(p.hurtTimer / 3) % 2 === 0) ctx.globalAlpha = 0.5;
  const bob = Math.sin(p.anim * 0.01) * 2;
  const squash = p.onGround ? 1 : 1.08;
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h);
  ctx.scale(p.facing * squash, 1 / squash);
  ctx.translate(-p.w / 2, -p.h + bob);

  ctx.fillStyle = p.hurtTimer > 0 ? "#ff8888" : "#9b6ed0";
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2;
  roundRect(ctx, 4, 12, 20, 22, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f4f4f4";
  ctx.beginPath();
  ctx.ellipse(14, 10, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(9, 9, 3, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(19, 9, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (p.attackFrame) {
    ctx.fillStyle = "#ddd";
    ctx.fillRect(p.facing === 1 ? 22 : -8, 14, 14, 6);
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawEnemy(ctx, e) {
  if (e.dead) {
    ctx.globalAlpha = Math.max(0, e.poof / 30);
    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    ctx.fillText("poof", e.x, e.y);
    ctx.globalAlpha = 1;
    return;
  }
  if (e.hurtTimer > 0 && Math.floor(e.hurtTimer / 2) % 2) ctx.globalAlpha = 0.6;
  ctx.fillStyle = e.color;
  if (e.type === "slime") {
    ctx.beginPath();
    ctx.ellipse(e.x + e.w / 2, e.y + e.h - 4, e.w / 2, e.h / 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (e.type === "bat") {
    ctx.beginPath();
    ctx.moveTo(e.x, e.y + e.h / 2);
    ctx.lineTo(e.x + e.w / 2, e.y);
    ctx.lineTo(e.x + e.w, e.y + e.h / 2);
    ctx.lineTo(e.x + e.w / 2, e.y + e.h);
    ctx.fill();
  } else {
    roundRect(ctx, e.x, e.y, e.w, e.h, 4);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.fillRect(e.x + 6, e.y + 6, 6, 6);
    ctx.fillRect(e.x + 18, e.y + 6, 6, 6);
  }
  const barW = e.w;
  ctx.fillStyle = "#333";
  ctx.fillRect(e.x, e.y - 6, barW, 4);
  ctx.fillStyle = "#6bcb77";
  ctx.fillRect(e.x, e.y - 6, barW * (e.hp / e.maxHp), 4);
  ctx.globalAlpha = 1;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHUD(ctx, player, levelIndex, levelName, state, message) {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, ctx.canvas.width, 36);
  ctx.fillStyle = "#fff";
  ctx.font = "14px system-ui,sans-serif";
  ctx.fillText(`${levelName}  (${levelIndex + 1}/3)`, 12, 22);

  const weapons = { bonk: "Bonk", bat: "Bone Bat", bolt: "Spirit Bolt" };
  ctx.fillText(`Weapon: ${weapons[player.weapon]}`, 200, 22);

  ctx.fillStyle = "#333";
  ctx.fillRect(12, 44, 120, 10);
  ctx.fillStyle = player.hp > 30 ? "#6bcb77" : "#ff6b6b";
  ctx.fillRect(12, 44, 120 * (player.hp / player.maxHp), 10);
  ctx.fillStyle = "#ccc";
  ctx.font = "11px sans-serif";
  ctx.fillText("HP", 12, 42);

  if (player.speedBoost > 0) ctx.fillText("SPEED", 140, 52);
  if (player.damageBoost > 0) ctx.fillText("PWR", 190, 52);

  if (state === "title" || state === "gameOver" || state === "win") {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(message.title, ctx.canvas.width / 2, ctx.canvas.height / 2 - 20);
    ctx.font = "16px system-ui";
    ctx.fillText(message.sub, ctx.canvas.width / 2, ctx.canvas.height / 2 + 16);
    ctx.textAlign = "left";
  }
}
