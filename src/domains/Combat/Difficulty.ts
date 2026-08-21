// Combat/Difficulty.ts
//
// バトル難度 (3段階) の定義
//
// Easy   : Enemy.ts の getEnemyFormation と連動してゴブリンが出現する
// Normal : サンプルユニット (人間) との戦闘. 敵の生成CPはプレイヤーの実際のCPの1.0〜1.25倍を
//          戦闘開始のたびにランダムに抽選する (Combat.tsx 側を参照)
// Hard   : 敵データ未実装 (今後対応). 現状は常にロック
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

// 現段階でロックされている難度
// (「CPが一定を超えたら解除する」仕様を予定しているが, 閾値は未定のため, 現時点では常にロックしておく)
export const LOCKED_BATTLE_DIFFICULTIES: BattleDifficultyTier[] = ['hard']
