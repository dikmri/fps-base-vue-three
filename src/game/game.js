// @ts-check

import * as THREE from "three";
import { GAME_CONFIG } from "./config.js";
import { logger } from "./logger.js";
import { InputController } from "./input.js";
import { PlayerController } from "./player.js";
import { EnemySystem } from "./enemy.js";
import { buildWorld } from "./world.js";

/**
 * @typedef {object} GameState
 * @property {number} playerHealth
 * @property {number} aliveEnemies
 */

/**
 * @typedef {object} GameOptions
 * @property {HTMLElement} container
 * @property {(state: GameState) => void} onState
 */

export class FpsGame {
  /** @param {GameOptions} options */
  constructor(options) {
    this.container = options.container;
    this.onState = options.onState;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x6d879c);

    this.camera = new THREE.PerspectiveCamera(74, 1, 0.1, 300);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;

    this.input = new InputController(this.container);
    this.player = new PlayerController();
    this.enemies = new EnemySystem(this.scene);

    this.world = buildWorld(this.scene);

    this.lastTime = 0;
    this.shootCooldown = 0;
    this.animationFrameId = 0;

    this.boundLoop = this.loop.bind(this);
    this.boundResize = this.onResize.bind(this);
  }

  start() {
    this.setupScene();

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    this.input.attach();
    window.addEventListener("resize", this.boundResize);
    this.onResize();

    this.player.setSpawn(new THREE.Vector3(0, 0, 0));
    this.enemies.spawnDefaults();

    this.publishState();
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.boundLoop);
    logger.info("ゲームループを開始しました");
  }

  requestPointerLock() {
    this.input.requestPointerLock();
  }

  setupScene() {
    const ambient = new THREE.HemisphereLight(0xc4d4ff, 0x4a4a4a, 0.6);
    this.scene.add(ambient);

    const sunlight = new THREE.DirectionalLight(0xffffff, 1.05);
    sunlight.position.set(20, 30, 12);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.width = 1024;
    sunlight.shadow.mapSize.height = 1024;
    this.scene.add(sunlight);
  }

  /** @param {number} now */
  loop(now) {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.update(dt);
    this.renderer.render(this.scene, this.camera);

    this.animationFrameId = requestAnimationFrame(this.boundLoop);
  }

  /** @param {number} dt */
  update(dt) {
    this.player.update(this.input, dt);
    this.player.applyToCamera(this.camera);

    this.enemies.update(this.player.position, dt);

    this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    if (this.input.mouseDown && this.shootCooldown <= 0) {
      this.shootCooldown = GAME_CONFIG.weapon.cooldownSec;
      this.enemies.shoot(this.camera, this.world.wallMeshes);
    }

    this.publishState();
  }

  publishState() {
    this.onState({
      playerHealth: this.player.health,
      aliveEnemies: this.enemies.getAliveCount()
    });
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    logger.info(`リサイズ: ${width}x${height}`);
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener("resize", this.boundResize);
    this.input.detach();
    this.enemies.dispose();
    this.renderer.dispose();
    this.container.innerHTML = "";
    logger.info("ゲームを破棄しました");
  }
}
