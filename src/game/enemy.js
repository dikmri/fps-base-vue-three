// @ts-check

import * as THREE from "three";
import { GAME_CONFIG } from "./config.js";
import { collides } from "./world.js";
import { classifyHitZone, damageForZone } from "./combat.js";
import { logger } from "./logger.js";

/**
 * @typedef {object} EnemyState
 * @property {number} id
 * @property {THREE.Group} root
 * @property {THREE.Mesh} body
 * @property {THREE.Mesh} head
 * @property {THREE.Mesh} legs
 * @property {number} health
 * @property {number} thinkCooldown
 * @property {THREE.Vector2} wanderDir
 */

export class EnemySystem {
  /** @param {THREE.Scene} scene */
  constructor(scene) {
    this.scene = scene;
    /** @type {EnemyState[]} */
    this.enemies = [];
    this.nextId = 1;

    /** @type {Map<THREE.Object3D, EnemyState>} */
    this.meshToEnemy = new Map();
  }

  spawnDefaults() {
    this.spawnAt(-10, -10);
    this.spawnAt(10, -10);
    this.spawnAt(-8, 10);
    this.spawnAt(12, 12);
  }

  /**
   * @param {number} x
   * @param {number} z
   */
  spawnAt(x, z) {
    const cfg = GAME_CONFIG.enemy;
    const root = new THREE.Group();
    root.position.set(x, 0, z);

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(cfg.radius, cfg.bodyHeight, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xbd4c4c })
    );
    body.position.y = cfg.bodyHeight / 2 + 0.55;
    body.castShadow = true;
    body.userData.hitZone = "body";
    root.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xd9b198 })
    );
    head.position.y = cfg.totalHeight - 0.25;
    head.castShadow = true;
    head.userData.hitZone = "head";
    root.add(head);

    const legs = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.7, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x2f3542 })
    );
    legs.position.y = 0.35;
    legs.castShadow = true;
    legs.userData.hitZone = "other";
    root.add(legs);

    this.scene.add(root);

    /** @type {EnemyState} */
    const enemy = {
      id: this.nextId,
      root,
      body,
      head,
      legs,
      health: 100,
      thinkCooldown: 0,
      wanderDir: new THREE.Vector2(1, 0)
    };

    this.nextId += 1;
    this.enemies.push(enemy);
    this.meshToEnemy.set(body, enemy);
    this.meshToEnemy.set(head, enemy);
    this.meshToEnemy.set(legs, enemy);

    logger.info(`敵${enemy.id} を生成 x=${x.toFixed(1)} z=${z.toFixed(1)}`);
  }

  /**
   * @param {THREE.Vector3} playerPos
   * @param {number} dt
   */
  update(playerPos, dt) {
    const speed = GAME_CONFIG.enemy.moveSpeed;

    for (const enemy of this.enemies) {
      if (enemy.health <= 0) continue;

      const dx = playerPos.x - enemy.root.position.x;
      const dz = playerPos.z - enemy.root.position.z;
      const distance = Math.hypot(dx, dz);
      enemy.thinkCooldown -= dt;

      let moveX = 0;
      let moveZ = 0;

      if (distance < 18) {
        moveX = dx / Math.max(distance, 0.0001);
        moveZ = dz / Math.max(distance, 0.0001);
      } else {
        if (enemy.thinkCooldown <= 0) {
          enemy.thinkCooldown = 1.1 + Math.random() * 1.8;
          const angle = Math.random() * Math.PI * 2;
          enemy.wanderDir.set(Math.cos(angle), Math.sin(angle));
          logger.debug(`敵${enemy.id} の徘徊方向を更新`);
        }
        moveX = enemy.wanderDir.x;
        moveZ = enemy.wanderDir.y;
      }

      const turnYaw = Math.atan2(moveX, moveZ);
      enemy.root.rotation.y = turnYaw;

      this.tryMoveEnemy(enemy, moveX * speed * dt, moveZ * speed * dt);
    }
  }

  /**
   * @param {EnemyState} enemy
   * @param {number} dx
   * @param {number} dz
   */
  tryMoveEnemy(enemy, dx, dz) {
    const radius = GAME_CONFIG.enemy.radius;
    const nx = enemy.root.position.x + dx;
    if (!collides(nx, enemy.root.position.z, radius)) {
      enemy.root.position.x = nx;
    }
    const nz = enemy.root.position.z + dz;
    if (!collides(enemy.root.position.x, nz, radius)) {
      enemy.root.position.z = nz;
    }
  }

  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {THREE.Mesh[]} wallMeshes
   */
  shoot(camera, wallMeshes) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const aliveMeshes = this.enemies
      .filter((enemy) => enemy.health > 0)
      .flatMap((enemy) => [enemy.body, enemy.head, enemy.legs]);

    const wallHits = raycaster.intersectObjects(wallMeshes, false);
    const enemyHits = raycaster.intersectObjects(aliveMeshes, false);

    const wallDistance = wallHits.length > 0 ? wallHits[0].distance : Number.POSITIVE_INFINITY;

    for (const hit of enemyHits) {
      if (hit.distance > wallDistance) continue;
      const enemy = this.meshToEnemy.get(hit.object);
      if (!enemy || enemy.health <= 0) continue;

      const zoneByMesh = /** @type {"head" | "body" | "other" | undefined} */ (hit.object.userData.hitZone);
      const normalizedHeight = Math.min(1, Math.max(0, hit.point.y / GAME_CONFIG.enemy.totalHeight));
      const zone = zoneByMesh ?? classifyHitZone(normalizedHeight);
      const damage = damageForZone(zone);

      enemy.health = Math.max(0, enemy.health - damage);
      logger.info(`命中: 敵${enemy.id} 部位=${zone} ダメージ=${damage} 残HP=${enemy.health}`);

      if (enemy.health <= 0) {
        logger.info(`敵${enemy.id} を撃破`);
        enemy.root.visible = false;
      }

      return { hit: true, zone, damage, enemyId: enemy.id };
    }

    logger.debug("射撃: 命中なし", { key: "miss", throttleMs: 200 });
    return { hit: false };
  }

  getAliveCount() {
    return this.enemies.filter((enemy) => enemy.health > 0).length;
  }

  dispose() {
    for (const enemy of this.enemies) {
      this.scene.remove(enemy.root);
    }
    this.enemies = [];
    this.meshToEnemy.clear();
  }
}
