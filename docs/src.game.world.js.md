# src/game/world.js.md

## 目的
- Three.js シーンへアリーナマップを構築し、壁衝突判定を行う。

## 主処理
- `buildWorld`: 床と壁メッシュを生成。
- `isWallAt`: ワールド座標から壁判定。
- `collides`: 円形キャラの4点サンプル衝突判定。
