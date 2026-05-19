import { createParticle, createProjectile, rectsOverlap } from "./entities.js";

export function getAttackHitbox(player) {
  if (player.attackTimer <= 0) return null;
  const reach = player.weapon === "bat" ? 48 : 32;
  return {
    x: player.facing === 1 ? player.x + player.w : player.x - reach,
    y: player.y + 8,
    w: reach,
    h: 24,
    damage: (player.weapon === "bat" ? 18 : 12) + (player.damageBoost > 0 ? 8 : 0),
  };
}

export function tryAttack(player, projectiles) {
  if (player.attackTimer > 0) return;
  if (player.weapon === "bolt" && player.boltCooldown <= 0) {
    projectiles.push(
      createProjectile(player.x + player.w / 2, player.y + 12, player.facing, 14 + (player.damageBoost > 0 ? 6 : 0))
    );
    player.boltCooldown = 35;
    player.attackTimer = 12;
    return;
  }
  if (player.weapon !== "bolt") {
    player.attackTimer = player.weapon === "bat" ? 18 : 14;
  }
}

export function applyDamageToEnemy(e, dmg, particles, knockDir) {
  e.hp -= dmg;
  e.hurtTimer = 12;
  for (let i = 0; i < 5; i++) particles.push(createParticle(e.x + e.w / 2, e.y + e.h / 2, e.color));
  if (knockDir) e.x += knockDir * 8;
  if (e.hp <= 0) {
    e.dead = true;
    e.poof = 30;
  }
}

export function processCombat(player, enemies, projectiles, particles) {
  const hitbox = getAttackHitbox(player);
  if (hitbox) {
    enemies.forEach((e) => {
      if (e.dead || !rectsOverlap(hitbox, e)) return;
      applyDamageToEnemy(e, hitbox.damage, particles, player.facing);
    });
  }

  projectiles.forEach((proj) => {
    enemies.forEach((e) => {
      if (e.dead || !rectsOverlap(proj, e)) return;
      applyDamageToEnemy(e, proj.damage, particles, Math.sign(proj.vx));
      proj.life = 0;
    });
  });

  if (player.invuln <= 0) {
    enemies.forEach((e) => {
      if (e.dead || e.poof > 0) return;
      if (rectsOverlap(player, e)) {
        player.hp -= e.damage;
        player.hurtTimer = 20;
        player.invuln = 45;
        player.vx = (player.x < e.x ? -4 : 4);
      }
    });
  }
}

export function collectPickups(player, pickups) {
  pickups.forEach((p) => {
    if (p.taken || !rectsOverlap(player, p)) return;
    p.taken = true;
    if (p.kind === "health") player.hp = Math.min(player.maxHp, player.hp + 25);
    if (p.kind === "bat") player.weapon = "bat";
    if (p.kind === "bolt") player.weapon = "bolt";
    if (p.kind === "speed") player.speedBoost = 300;
    if (p.kind === "damage") player.damageBoost = 400;
  });
}

export function maybeDropPickup(enemy, pickups) {
  if (!enemy.dead || enemy.poof !== 28) return;
  const r = Math.random();
  if (enemy.type === "slime" && r < 0.35)
    pickups.push({ kind: "health", x: enemy.x, y: enemy.y, w: 20, h: 20, taken: false });
  if (enemy.type === "bat" && r < 0.25)
    pickups.push({ kind: "speed", x: enemy.x, y: enemy.y, w: 20, h: 20, taken: false });
  if (enemy.type === "skeleton" && r < 0.4)
    pickups.push({ kind: "damage", x: enemy.x, y: enemy.y, w: 20, h: 20, taken: false });
}

export function roomCleared(enemies) {
  return enemies.every((e) => e.dead);
}
