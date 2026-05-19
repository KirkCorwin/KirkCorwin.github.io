export const TILE = 32;
export const COLS = 25;
export const ROWS = 15;

export const LEVELS = [
  {
    name: "Entry Hall",
    hint: "Clear all enemies. Attack with Z or J. Reach the door.",
    map: [
      "#########################",
      "#P......1......1........#",
      "#.......................#",
      "#....####....####.......#",
      "#.......................#",
      "#.........H.............#",
      "#.......................#",
      "#.......................#",
      "#.......................#",
      "#.......................#",
      "#.......................#",
      "#.......................#",
      "#......................D#",
      "#########################",
    ],
  },
  {
    name: "Bone Gallery",
    hint: "Bats fly overhead. Grab the bone bat if you find it.",
    map: [
      "#########################",
      "#P............2.........#",
      "#..####......####.......#",
      "#.......................#",
      "#....2.......3..........#",
      "#.......................#",
      "#..####......####.......#",
      "#.........W.............#",
      "#.......................#",
      "#....1.......1..........#",
      "#.......................#",
      "#.......................#",
      "#......................D#",
      "#########################",
    ],
  },
  {
    name: "Boss Niche",
    hint: "Defeat the skeleton guard to escape the dungeon.",
    map: [
      "#########################",
      "#P......................#",
      "#..####....####.........#",
      "#.......................#",
      "#.........3.............#",
      "#......B................#",
      "#..####....####.........#",
      "#.......................#",
      "#....1.......1..........#",
      "#.......................#",
      "#.........H.............#",
      "#.......................#",
      "#......................D#",
      "#########################",
    ],
  },
];

export function parseLevel(level) {
  const walls = [];
  const spawns = { player: { x: 64, y: 64 }, enemies: [], pickups: [] };
  let door = null;

  for (let row = 0; row < level.map.length; row++) {
    for (let col = 0; col < level.map[row].length; col++) {
      const ch = level.map[row][col];
      const x = col * TILE;
      const y = row * TILE;
      if (ch === "#") walls.push({ x, y, w: TILE, h: TILE });
      else if (ch === "P") spawns.player = { x: x + 8, y: y + 8 };
      else if (ch === "D") door = { x, y, w: TILE, h: TILE, locked: true };
      else if (ch === "1") spawns.enemies.push({ type: "slime", x: x + 4, y: y + 8 });
      else if (ch === "2") spawns.enemies.push({ type: "bat", x: x + 4, y: y + 4 });
      else if (ch === "3") spawns.enemies.push({ type: "skeleton", x: x + 4, y: y + 8 });
      else if (ch === "H") spawns.pickups.push({ kind: "health", x: x + 8, y: y + 8 });
      else if (ch === "W") spawns.pickups.push({ kind: "bat", x: x + 8, y: y + 8 });
      else if (ch === "B") spawns.pickups.push({ kind: "bolt", x: x + 8, y: y + 8 });
    }
  }
  return { walls, spawns, door };
}
