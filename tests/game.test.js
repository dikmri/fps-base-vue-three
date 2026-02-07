// @ts-check

import assert from "node:assert/strict";
import { classifyHitZone, damageForZone } from "../src/game/combat.js";

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

  console.log("[TEST] combat ロジックは期待通りです。");
}

try {
  run();
} catch (error) {
  console.error("[TEST] 失敗", error);
  process.exitCode = 1;
}
