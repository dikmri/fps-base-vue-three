// @ts-check

export class Logger {
  /** @param {boolean} enabled */
  constructor(enabled = true) {
    this.enabled = enabled;
    /** @type {Map<string, number>} */
    this.lastTimes = new Map();
  }

  /** @param {string} message */
  info(message) {
    console.log(`[INFO] ${message}`);
  }

  /** @param {string} message */
  warn(message) {
    console.warn(`[WARN] ${message}`);
  }

  /** @param {string} message */
  error(message) {
    console.error(`[ERROR] ${message}`);
  }

  /**
   * @param {string} message
   * @param {object} [options]
   * @param {string} [options.key]
   * @param {number} [options.throttleMs]
   */
  debug(message, options = {}) {
    if (!this.enabled) return;
    const key = options.key ?? "";
    const throttleMs = options.throttleMs ?? 0;
    if (key && throttleMs > 0) {
      const now = performance.now();
      const last = this.lastTimes.get(key) ?? 0;
      if (now - last < throttleMs) return;
      this.lastTimes.set(key, now);
    }
    console.log(`[DEBUG] ${message}`);
  }
}

export const logger = new Logger(true);
