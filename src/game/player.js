// @ts-check

import * as THREE from "three";
import { GAME_CONFIG } from "./config.js";
import { collides } from "./world.js";
import { logger } from "./logger.js";

/**
 * カメラのヨー角から、地面平面上の前方ベクトルを求める。
 * Three.js カメラの前方(-Z)に合わせるため Z はマイナス向きになる。
 * @param {number} yaw
 */
export function computeForwardVector(yaw) {
  return new THREE.Vector2(Math.sin(yaw), -Math.cos(yaw));
}

/**
 * 前方ベクトルから右方向ベクトルを求める。
 * @param {THREE.Vector2} forward
 */
export function computeRightVector(forward) {
  return new THREE.Vector2(-forward.y, forward.x);
}

/**
 * 入力軸と向きから移動要求ベクトルを求める。
 * @param {number} yaw
 * @param {number} inputX
 * @param {number} inputY
 * @param {number} speed
 */
export function computeWishVelocity(yaw, inputX, inputY, speed) {
  const move = new THREE.Vector2(inputX, inputY);
  if (move.lengthSq() === 0) {
    return { x: 0, z: 0 };
  }
  move.normalize();
  const forward = computeForwardVector(yaw);
  const right = computeRightVector(forward);
  return {
    x: (forward.x * move.y + right.x * move.x) * speed,
    z: (forward.y * move.y + right.y * move.x) * speed
  };
}

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
      const velocity = computeWishVelocity(this.yaw, move.x, move.y, cfg.moveSpeed);
      const wishX = velocity.x;
      const wishZ = velocity.z;
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
    // 1フレーム移動を分割し、壁角での食い込みによる見た目ワープを減らす。
    const radius = GAME_CONFIG.player.radius;
    const totalDistance = Math.hypot(dx, dz);
    const maxStep = 0.08;
    const stepCount = Math.max(1, Math.ceil(totalDistance / maxStep));
    const stepX = dx / stepCount;
    const stepZ = dz / stepCount;

    for (let i = 0; i < stepCount; i += 1) {
      const nx = this.position.x + stepX;
      if (!collides(nx, this.position.z, radius)) {
        this.position.x = nx;
      } else {
        logger.debug("X軸移動を壁衝突で停止", { key: "player-collision-x", throttleMs: 150 });
      }

      const nz = this.position.z + stepZ;
      if (!collides(this.position.x, nz, radius)) {
        this.position.z = nz;
      } else {
        logger.debug("Z軸移動を壁衝突で停止", { key: "player-collision-z", throttleMs: 150 });
      }
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
