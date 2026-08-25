// Setup/BattleDifficulty.tsx

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BATTLE_DIFFICULTY_KEYS, BATTLE_DIFFICULTY_LABELS, NORMAL_UNLOCK_CP, HARD_UNLOCK_CP, isDifficultyLocked, type BattleDifficultyTier } from '../../domains/Combat/Difficulty'
import { SaveData } from '../../domains/SaveData'

// ロック中の難度に表示する補足 (未定義の場合は「(未解放)」を表示する)
const UNLOCK_HINTS: Partial<Record<BattleDifficultyTier, string>> = {
  //normal: `(CP${NORMAL_UNLOCK_CP}で解放)`
  normal: `(未解放)`,
  hard: `(未解放)`
}

// 「冒険を始める」→ 戦闘開始 (/battle/) の間に挟む, バトル難度選択画面
// Hard は現状ロック (CPが一定を超えたら解除する予定だが, 閾値は未定のため常にロック)
// Normal はプレイヤー保有CPが NORMAL_UNLOCK_CP に達するまでロック
//
// 難度は戦闘のたびに選び直す想定のため, SaveData には永続化せず, navigate の state で
// Combat.tsx へ一度だけ渡す (ページ遷移1回限りの受け渡し. リロードすれば消える)
function BattleDifficulty() {
  const navigate = useNavigate()

  // ロック判定に使うプレイヤー保有CP (SaveDataから読み込むのみ. 更新はしない)
  const saveData = useMemo(() => new SaveData(), [])
  const cp = saveData.loadPoints()

  // 難度を選択 → 選択値を state に載せて戦闘画面へ (ロック中の難度は選択不可)
  const selectDifficulty = (difficulty: BattleDifficultyTier) => {
    if (isDifficultyLocked(difficulty, cp)) return
    navigate('/battle/', { state: { difficulty } })
  }

  return (
    <div className="px-6">
      <h3 className="mt-12 mb-6 text-center font-serif text-lg">バトル難度を選択してください</h3>
      <div className="text-center">
        {BATTLE_DIFFICULTY_KEYS.map(difficulty => {
          const locked = isDifficultyLocked(difficulty, cp)
          return (
            <button
              key={difficulty}
              className="w-64 h-12"
              onClick={() => selectDifficulty(difficulty)}
              disabled={locked}
            >
              {BATTLE_DIFFICULTY_LABELS[difficulty]}
              {locked && ` ${UNLOCK_HINTS[difficulty] ?? '(未解放)'}`}
            </button>
          )
        })}
      </div>
      <p className="mb-6 text-center text-sm text-gray-400">Normal は CP{NORMAL_UNLOCK_CP}, Hard は, CP{HARD_UNLOCK_CP}を超えると解放されます</p>
      <div className="text-center">
        <button className="w-48 h-12" onClick={() => navigate('/setup/')}>戻る</button>
      </div>
    </div>
  )
}

export default BattleDifficulty
