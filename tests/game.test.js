// @ts-check

import assert from "node:assert/strict";
import { classifyHitZone, damageForZone } from "../src/game/combat.js";
import { computeWishVelocity } from "../src/game/player.js";

function run() {
  assert.equal(classifyHitZone(0.9), "head");
  assert.equal(classifyHitZone(0.6), "body");
  assert.equal(classifyHitZone(0.2), "other");

  assert.equal(damageForZone("head"), 100);
  assert.equal(damageForZone("body"), 50);
  assert.equal(damageForZone("other"), 20);

  const bodyKillShots = Math.ceil(100 / damageForZone("body"));
  const otherKillShots = Math.ceil(100 / damageForZone("other"));

  assert.equal(bodyKillShots, 2);
  assert.equal(otherKillShots, 5);

  // yaw=0 では W が -Z 方向、S が +Z 方向へ動くことを確認する。
  const forwardAtZero = computeWishVelocity(0, 0, 1, 10);
  const backAtZero = computeWishVelocity(0, 0, -1, 10);
  assert.ok(forwardAtZero.z < 0);
  assert.ok(backAtZero.z > 0);

  // yaw=90度 では W が +X 方向へ動くことを確認する。
  const forwardAtRight = computeWishVelocity(Math.PI / 2, 0, 1, 10);
  assert.ok(forwardAtRight.x > 0);

  console.log("[TEST] combat/移動方向 ロジックは期待通りです。");
}

try {
  run();
} catch (error) {
  console.error("[TEST] 失敗", error);
  process.exitCode = 1;
}
