// Combat/Difficulty.ts
//
// バトル難度 (5段階) の定義
// VeryEasy/Easy は Enemy.ts の getEnemyFormation (BattleDifficulty型) と連動してゴブリンが出現する.
// Normal はサンプルユニット (人間) との従来通りの戦闘, Hard/VeryHard は敵データ未実装 (今後対応)
//
// 難度は戦闘のたびに選び直す想定のため, SaveData (localStorage) には永続化しない.
// Setup/BattleDifficulty.tsx から navigate('/battle/', { state: { difficulty } }) の形で
// React Router のナビゲーション state として Combat.tsx に一度だけ受け渡す

export const BATTLE_DIFFICULTY_KEYS = ['veryEasy', 'easy', 'normal', 'hard', 'veryHard'] as const

export type BattleDifficultyTier = typeof BATTLE_DIFFICULTY_KEYS[number]

export const BATTLE_DIFFICULTY_LABELS: Record<BattleDifficultyTier, string> = {
  veryEasy: 'Very Easy',
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
  veryHard: 'Very Hard'
}

// 現段階でロックされている難度
// (「CPが一定を超えたら解除する」仕様を予定しているが, 閾値は未定のため, 現時点では常にロックしておく)
export const LOCKED_BATTLE_DIFFICULTIES: BattleDifficultyTier[] = ['hard', 'veryHard']
