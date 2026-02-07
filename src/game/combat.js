// @ts-check

import { GAME_CONFIG } from "./config.js";

/** @typedef {"head" | "body" | "other"} HitZone */

/**
 * @param {number} normalizedHeight 0.0(足元) - 1.0(頭頂)
 * @returns {HitZone}
 */
export function classifyHitZone(normalizedHeight) {
  if (normalizedHeight >= 0.85) return "head";
  if (normalizedHeight >= 0.45) return "body";
  return "other";
}

/** @param {HitZone} zone */
export function damageForZone(zone) {
  return GAME_CONFIG.weapon.damage[zone];
}
