// Setup/BattleDifficulty.tsx

import { useNavigate } from 'react-router-dom'
import { BATTLE_DIFFICULTY_KEYS, BATTLE_DIFFICULTY_LABELS, LOCKED_BATTLE_DIFFICULTIES, type BattleDifficultyTier } from '../../domains/Combat/Difficulty'

// 「冒険を始める」→ 戦闘開始 (/battle/) の間に挟む, バトル難度選択画面
// Hard は現状ロック (CPが一定を超えたら解除する予定だが, 閾値は未定のため常にロック)
//
// 難度は戦闘のたびに選び直す想定のため, SaveData には永続化せず, navigate の state で
// Combat.tsx へ一度だけ渡す (ページ遷移1回限りの受け渡し. リロードすれば消える)
function BattleDifficulty() {
  const navigate = useNavigate()

  // 難度を選択 → 選択値を state に載せて戦闘画面へ (ロック中の難度は選択不可)
  const selectDifficulty = (difficulty: BattleDifficultyTier) => {
    if (LOCKED_BATTLE_DIFFICULTIES.includes(difficulty)) return
    navigate('/battle/', { state: { difficulty } })
  }

  return (
    <div className="px-6">
      <h3 className="mt-12 mb-6 text-center font-serif text-lg">バトル難度を選択してください</h3>
      <div className="text-center">
        {BATTLE_DIFFICULTY_KEYS.map(difficulty => {
          const locked = LOCKED_BATTLE_DIFFICULTIES.includes(difficulty)
          return (
            <button
              key={difficulty}
              className="w-48 h-12"
              onClick={() => selectDifficulty(difficulty)}
              disabled={locked}
            >
              {BATTLE_DIFFICULTY_LABELS[difficulty]}
              {locked && ' (未解放)'}
            </button>
          )
        })}
      </div>
      <p className="mb-6 text-center text-sm text-gray-400">Hard は, CPが一定を超えると解放される予定です</p>
      <div className="text-center">
        <button className="w-48 h-12" onClick={() => navigate('/setup/')}>戻る</button>
      </div>
    </div>
  )
}

export default BattleDifficulty
