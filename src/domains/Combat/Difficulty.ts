// Combat/Difficulty.ts
//
// バトル難度 (3段階) の定義
//
// Easy: Enemy.ts の getEnemyBattleSetup (内部で getEnemyFormation) と連動してゴブリンまたはスライムが出現する
// Normal: サンプルユニット (人間) との戦闘. 敵の生成CPはプレイヤーの実際のCPの1.0〜1.25倍相当
// Hard: Enemy.ts の getEnemyBattleSetup (内部で getEnemyFormation) と連動してアンデッドが出現する
//
// 難度は戦闘のたびに選び直す想定のため, SaveData (localStorage) には永続化しない.
// Setup/BattleDifficulty.tsx から navigate('/battle/', { state: { difficulty } }) の形で
// React Router のナビゲーション state として Combat.tsx に一度だけ受け渡す

export const BATTLE_DIFFICULTY_KEYS = ['easy', 'normal', 'hard'] as const

export type BattleDifficultyTier = typeof BATTLE_DIFFICULTY_KEYS[number]

export const BATTLE_DIFFICULTY_LABELS: Record<BattleDifficultyTier, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard'
}

// Normal の解放に必要なプレイヤー保有CP (これに達するまでロック)
export const NORMAL_UNLOCK_CP = 12
export const HARD_UNLOCK_CP = 16

// 難度がロックされているかどうかを, プレイヤー保有CPを踏まえて判定する
export function isDifficultyLocked(difficulty: BattleDifficultyTier, cp: number): boolean {
  if (difficulty === 'normal') return cp < NORMAL_UNLOCK_CP
  if (difficulty === 'hard') return cp < HARD_UNLOCK_CP
  return false
}
