// @ts-check

import * as THREE from "three";
import { GAME_CONFIG } from "./config.js";
import { collides } from "./world.js";
import { logger } from "./logger.js";

export class PlayerController {
  constructor() {
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocityY = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.health = 100;
    this.onGround = true;
  }

  /** @param {THREE.Vector3} spawn */
  setSpawn(spawn) {
    this.position.copy(spawn);
    this.position.y = 0;
    this.velocityY = 0;
    this.onGround = true;
  }

  /**
   * @param {import('./input.js').InputController} input
   * @param {number} dt
   */
  update(input, dt) {
    const cfg = GAME_CONFIG.player;

    const look = input.consumeLookDelta();
    this.yaw -= look.dx * cfg.mouseSensitivity;
    this.pitch = clamp(this.pitch - look.dy * cfg.mouseSensitivity, -1.2, 1.2);

    const move = new THREE.Vector2(0, 0);
    if (input.isDown("KeyW")) move.y += 1;
    if (input.isDown("KeyS")) move.y -= 1;
    if (input.isDown("KeyA")) move.x -= 1;
    if (input.isDown("KeyD")) move.x += 1;

    if (move.lengthSq() > 0) {
      move.normalize();
      const forward = new THREE.Vector2(Math.sin(this.yaw), Math.cos(this.yaw));
      const right = new THREE.Vector2(forward.y, -forward.x);
      const wishX = (forward.x * move.y + right.x * move.x) * cfg.moveSpeed;
      const wishZ = (forward.y * move.y + right.y * move.x) * cfg.moveSpeed;
      this.applyWalk(wishX * dt, wishZ * dt);
    }

    if (input.consumePressed("Space") && this.onGround) {
      this.velocityY = cfg.jumpVelocity;
      this.onGround = false;
      logger.debug("ジャンプ開始");
    }

    if (!this.onGround) {
      this.velocityY -= cfg.gravity * dt;
      this.position.y += this.velocityY * dt;
      if (this.position.y <= 0) {
        this.position.y = 0;
        this.velocityY = 0;
        this.onGround = true;
        logger.debug("着地");
      }
    }

    logger.debug(`プレイヤー座標 x=${this.position.x.toFixed(2)} z=${this.position.z.toFixed(2)}`, {
      key: "player-pos",
      throttleMs: 800
    });
  }

  /**
   * @param {number} dx
   * @param {number} dz
   */
  applyWalk(dx, dz) {
    const radius = GAME_CONFIG.player.radius;
    const nx = this.position.x + dx;
    if (!collides(nx, this.position.z, radius)) {
      this.position.x = nx;
    }
    const nz = this.position.z + dz;
    if (!collides(this.position.x, nz, radius)) {
      this.position.z = nz;
    }
  }

  /** @param {THREE.PerspectiveCamera} camera */
  applyToCamera(camera) {
    camera.position.set(this.position.x, this.position.y + GAME_CONFIG.player.eyeHeight, this.position.z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = this.yaw;
    camera.rotation.x = this.pitch;
  }
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
