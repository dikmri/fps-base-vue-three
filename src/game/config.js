// @ts-check

export const GAME_CONFIG = {
  map: {
    tileSize: 4,
    data: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  player: {
    radius: 0.35,
    moveSpeed: 7.5,
    jumpVelocity: 7.0,
    gravity: 18.0,
    eyeHeight: 1.65,
    mouseSensitivity: 0.0019
  },
  enemy: {
    moveSpeed: 2.1,
    radius: 0.45,
    bodyHeight: 1.1,
    totalHeight: 1.8
  },
  weapon: {
    cooldownSec: 0.35,
    damage: {
      head: 100,
      body: 50,
      other: 20
    }
  }
};
