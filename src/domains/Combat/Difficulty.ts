// Combat/Difficulty.ts
//
// バトル難度 (3段階) の定義
//
// Easy   : Enemy.ts の getEnemyFormation と連動してゴブリンが出現する
// Normal : サンプルユニット (人間) との戦闘. 敵の生成CPはプレイヤーの実際のCPの1.0〜1.25倍を
//          戦闘開始のたびにランダムに抽選する (Combat.tsx 側を参照). プレイヤー保有CPが
//          NORMAL_UNLOCK_CP に達するまではロックされる
// Hard   : 敵データ未実装 (今後対応). 現状は常にロック (閾値未定)
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

// 常時ロックされている難度
// (Hard は「CPが一定を超えたら解除する」仕様を予定しているが, 閾値は未定のため, 現時点では常にロックしておく)
export const LOCKED_BATTLE_DIFFICULTIES: BattleDifficultyTier[] = ['hard']

// Normal の解放に必要なプレイヤー保有CP (これに達するまでロック)
export const NORMAL_UNLOCK_CP = 12

// 難度がロックされているかどうかを, プレイヤー保有CPを踏まえて判定する
// (Hard は常にロック. Normal は cp が NORMAL_UNLOCK_CP 未満の間ロック. Easy は常に解放)
export function isDifficultyLocked(difficulty: BattleDifficultyTier, cp: number): boolean {
  if (LOCKED_BATTLE_DIFFICULTIES.includes(difficulty)) return true
  if (difficulty === 'normal') return cp < NORMAL_UNLOCK_CP
  return false
}
