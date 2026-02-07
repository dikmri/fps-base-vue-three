// @ts-check

import * as THREE from "three";
import { GAME_CONFIG } from "./config.js";

const WALL_HEIGHT = 3.2;

/**
 * @param {THREE.Scene} scene
 */
export function buildWorld(scene) {
  const tile = GAME_CONFIG.map.tileSize;
  const map = GAME_CONFIG.map.data;
  const width = map[0].length;
  const height = map.length;

  const group = new THREE.Group();
  group.name = "world";

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(width * tile, height * tile),
    new THREE.MeshStandardMaterial({ color: 0x38444f })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.userData.kind = "ground";
  group.add(floor);

  const wallGeometry = new THREE.BoxGeometry(tile, WALL_HEIGHT, tile);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.92 });
  /** @type {THREE.Mesh[]} */
  const wallMeshes = [];

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      if (map[row][col] !== 1) continue;
      const mesh = new THREE.Mesh(wallGeometry, wallMaterial);
      mesh.position.set(toWorldX(col), WALL_HEIGHT / 2, toWorldZ(row));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.kind = "wall";
      group.add(mesh);
      wallMeshes.push(mesh);
    }
  }

  scene.add(group);

  return {
    tile,
    map,
    wallMeshes,
    worldHalfWidth: (width * tile) / 2,
    worldHalfHeight: (height * tile) / 2
  };
}

/** @param {number} col */
function toWorldX(col) {
  const tile = GAME_CONFIG.map.tileSize;
  const width = GAME_CONFIG.map.data[0].length;
  return col * tile - (width * tile) / 2 + tile / 2;
}

/** @param {number} row */
function toWorldZ(row) {
  const tile = GAME_CONFIG.map.tileSize;
  const height = GAME_CONFIG.map.data.length;
  return row * tile - (height * tile) / 2 + tile / 2;
}

/**
 * @param {number} worldX
 * @param {number} worldZ
 */
export function toGrid(worldX, worldZ) {
  const tile = GAME_CONFIG.map.tileSize;
  const width = GAME_CONFIG.map.data[0].length;
  const height = GAME_CONFIG.map.data.length;

  const col = Math.floor((worldX + (width * tile) / 2) / tile);
  const row = Math.floor((worldZ + (height * tile) / 2) / tile);
  return { row, col };
}

/**
 * @param {number} worldX
 * @param {number} worldZ
 */
export function isWallAt(worldX, worldZ) {
  const { row, col } = toGrid(worldX, worldZ);
  const map = GAME_CONFIG.map.data;
  if (row < 0 || col < 0 || row >= map.length || col >= map[0].length) {
    return true;
  }
  return map[row][col] === 1;
}

/**
 * 円形キャラの壁衝突判定。
 * @param {number} x
 * @param {number} z
 * @param {number} radius
 */
export function collides(x, z, radius) {
  const sample = [
    { x: -radius, z: -radius },
    { x: radius, z: -radius },
    { x: -radius, z: radius },
    { x: radius, z: radius },
    { x: -radius, z: 0 },
    { x: radius, z: 0 },
    { x: 0, z: -radius },
    { x: 0, z: radius }
  ];
  return sample.some((offset) => isWallAt(x + offset.x, z + offset.z));
}
