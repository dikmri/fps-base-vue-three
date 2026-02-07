// @ts-check

import { logger } from "./logger.js";

export class InputController {
  /** @param {HTMLElement} target */
  constructor(target) {
    this.target = target;
    /** @type {Set<string>} */
    this.keysDown = new Set();
    /** @type {Set<string>} */
    this.keysPressed = new Set();
    this.mouseDown = false;
    this.pointerLocked = false;
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onPointerLock = this.onPointerLock.bind(this);
  }

  attach() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("pointerlockchange", this.onPointerLock);
    logger.info("入力コントローラを初期化しました");
  }

  detach() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("pointerlockchange", this.onPointerLock);
    this.keysDown.clear();
    this.keysPressed.clear();
    logger.info("入力コントローラを破棄しました");
  }

  requestPointerLock() {
    if (document.pointerLockElement === this.target) return;
    this.target.requestPointerLock();
  }

  onKeyDown(event) {
    if (!this.keysDown.has(event.code)) {
      this.keysPressed.add(event.code);
      logger.debug(`キー押下: ${event.code}`);
    }
    this.keysDown.add(event.code);
  }

  onKeyUp(event) {
    this.keysDown.delete(event.code);
    logger.debug(`キー離上: ${event.code}`);
  }

  onMouseDown(event) {
    if (event.button === 0) {
      this.mouseDown = true;
      logger.debug("マウス左押下");
    }
  }

  onMouseUp(event) {
    if (event.button === 0) {
      this.mouseDown = false;
      logger.debug("マウス左解放");
    }
  }

  onMouseMove(event) {
    if (!this.pointerLocked) return;
    this.lookDeltaX += event.movementX;
    this.lookDeltaY += event.movementY;
  }

  onPointerLock() {
    this.pointerLocked = document.pointerLockElement === this.target;
    logger.info(`ポインタロック: ${this.pointerLocked ? "ON" : "OFF"}`);
  }

  /** @param {string} code */
  isDown(code) {
    return this.keysDown.has(code);
  }

  /** @param {string} code */
  consumePressed(code) {
    const exists = this.keysPressed.has(code);
    if (exists) {
      this.keysPressed.delete(code);
    }
    return exists;
  }

  consumeLookDelta() {
    const dx = this.lookDeltaX;
    const dy = this.lookDeltaY;
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    return { dx, dy };
  }
}
