<template>
  <main class="game-root">
    <div ref="viewport" class="viewport" @click="lockPointer"></div>
    <div class="crosshair"></div>
    <section class="hud">
      <h1>FPS Base</h1>
      <p>HP: {{ hp }}</p>
      <p>敵残数: {{ aliveEnemies }}</p>
      <p>武器: マグナム（頭=1発 / 胴体=2発 / その他=5発）</p>
      <p>操作: WASD / Space / マウス / 左クリック</p>
    </section>
    <div class="notice">画面クリックでポインタロック開始</div>
  </main>
</template>

<script>
// @ts-check
import { FpsGame } from "./game/game.js";

export default {
  name: "App",
  data() {
    return {
      hp: 100,
      aliveEnemies: 0,
      /** @type {FpsGame | null} */
      game: null
    };
  },
  mounted() {
    const viewport = /** @type {HTMLDivElement} */ (this.$refs.viewport);
    this.game = new FpsGame({
      container: viewport,
      onState: (state) => {
        this.hp = state.playerHealth;
        this.aliveEnemies = state.aliveEnemies;
      }
    });
    this.game.start();
  },
  beforeUnmount() {
    if (this.game) {
      this.game.dispose();
      this.game = null;
    }
  },
  methods: {
    lockPointer() {
      if (this.game) {
        this.game.requestPointerLock();
      }
    }
  }
};
</script>
