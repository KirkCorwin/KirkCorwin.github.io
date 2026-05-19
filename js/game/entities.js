import { TILE } from "./levels.js";

const ENEMY_STATS = {
  slime: { hp: 30, speed: 1.2, damage: 8, w: 28, h: 24, color: "#6bcb77" },
  bat: { hp: 20, speed: 2.5, damage: 6, w: 26, h: 20, color: "#9b59b6", flying: true },
  skeleton: { hp: 55, speed: 1.8, damage: 12, w: 30, h: 36, color: "#e8e8e8" },
};

export function createPlayer(x, y) {
  return {
    x,
    y,
    w: 28,
    h: 36,
    vx: 0,
    vy: 0,
    hp: 100,
    maxHp: 100,
    onGround: false,
    facing: 1,
    weapon: "bonk",
    attackTimer: 0,
    attackFrame: 0,
    hurtTimer: 0,
    anim: 0,
    speedBoost: 0,
    damageBoost: 0,
    boltCooldown: 0,
    invuln: 0,
  };
}

export function createEnemy(type, x, y, boss = false) {
  const s = ENEMY_STATS[type];
  return {
    type,
    x,
    y,
    w: s.w,
    h: s.h,
    vx: 0,
    vy: 0,
    hp: boss ? s.hp * 1.5 : s.hp,
    maxHp: boss ? s.hp * 1.5 : s.hp,
    speed: s.speed,
    damage: s.damage,
    color: s.color,
    flying: !!s.flying,
    patrolDir: Math.random() > 0.5 ? 1 : -1,
    patrolTimer: 0,
    hurtTimer: 0,
    dead: false,
    poof: 0,
    boss,
  };
}

export function createPickup(kind, x, y) {
  return { kind, x, y, w: 20, h: 20, taken: false };
}

export function createProjectile(x, y, dir, damage) {
  return { x, y, w: 14, h: 10, vx: dir * 9, vy: 0, damage, life: 60 };
}

export function createParticle(x, y, color) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    life: 20 + Math.random() * 15,
    color,
  };
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function resolveWallCollision(ent, walls) {
  ent.onGround = false;
  for (const w of walls) {
    if (!rectsOverlap(ent, w)) continue;
    const overlapX = Math.min(ent.x + ent.w - w.x, w.x + w.w - ent.x);
    const overlapY = Math.min(ent.y + ent.h - w.y, w.y + w.h - ent.y);
    if (overlapX < overlapY) {
      ent.x += ent.x + ent.w / 2 < w.x + w.w / 2 ? -overlapX : overlapX;
      ent.vx = 0;
    } else {
      ent.y += ent.y + ent.h / 2 < w.y + w.h / 2 ? -overlapY : overlapY;
      ent.vy = 0;
      if (ent.y + ent.h <= w.y + 4) ent.onGround = true;
    }
  }
}

export function updateEnemy(e, player, walls, dt) {
  if (e.dead) {
    e.poof -= dt;
    return;
  }
  e.patrolTimer += dt;
  e.hurtTimer = Math.max(0, e.hurtTimer - dt);

  const dx = player.x - e.x;
  const dy = player.y - e.y;
  const dist = Math.hypot(dx, dy);

  if (e.type === "bat") {
    e.vx = Math.sign(dx) * e.speed * 0.8;
    e.vy = Math.sin(e.patrolTimer * 0.05) * 1.5 + (dy > 0 ? 0.3 : -0.3);
  } else if (e.type === "skeleton" && dist < 280) {
    e.vx = Math.sign(dx) * e.speed;
    e.vy += 0.35;
  } else if (e.type === "slime") {
    if (e.patrolTimer > 90) {
      e.patrolDir *= -1;
      e.patrolTimer = 0;
    }
    e.vx = e.patrolDir * e.speed * 0.6;
    if (dist < 200) e.vx += Math.sign(dx) * 0.4;
    e.vy += 0.4;
  } else {
    e.vx = e.patrolDir * e.speed * 0.5;
    e.vy += 0.4;
  }

  e.x += e.vx;
  e.y += e.vy;
  if (!e.flying) resolveWallCollision(e, walls);
  else {
    e.x = Math.max(TILE, Math.min(25 * TILE - e.w, e.x));
    e.y = Math.max(TILE, Math.min(14 * TILE - e.h, e.y));
  }
}

export function updatePlayer(p, walls, input, dt) {
  p.anim += dt;
  p.hurtTimer = Math.max(0, p.hurtTimer - dt);
  p.invuln = Math.max(0, p.invuln - dt);
  p.speedBoost = Math.max(0, p.speedBoost - dt);
  p.damageBoost = Math.max(0, p.damageBoost - dt);
  p.boltCooldown = Math.max(0, p.boltCooldown - dt);
  p.attackTimer = Math.max(0, p.attackTimer - dt);
  if (p.attackTimer > 0) p.attackFrame = 1;
  else p.attackFrame = 0;

  const speed = 4 + (p.speedBoost > 0 ? 2 : 0);
  p.vx = 0;
  if (input.left) {
    p.vx = -speed;
    p.facing = -1;
  }
  if (input.right) {
    p.vx = speed;
    p.facing = 1;
  }

  if (input.jump && p.onGround) {
    p.vy = -11;
    p.onGround = false;
  }

  p.vy += 0.5;
  p.x += p.vx;
  p.y += p.vy;
  resolveWallCollision(p, walls);
  p.x = Math.max(0, Math.min(25 * TILE - p.w, p.x));
}
