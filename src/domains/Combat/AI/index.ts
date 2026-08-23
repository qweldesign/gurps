// Combat/AI/index.ts

import { type BattleDifficultyTier } from '../Difficulty'
import { type CombatState as State } from '../State'
import { type CombatUnit as Unit } from '../Unit'
import { type ActionRequest } from '../Action/types'
import { type TacticKey } from './types'
import { type TacticHandler } from './handler'
import { heavyWarrior } from './handlers/heavyWarrior'
import { lightWarrior } from './handlers/lightWarrior'
import { archer } from './handlers/archer'
import { woodWaterSpell } from './handlers/woodWaterSpell'
import { fireSpell } from './handlers/fireSpell'
import { earthMetalSpell } from './handlers/earthMetalSpell'

export { TACTIC_KEYS, type TacticKey } from './types'
export { type TacticHandler } from './handler'

// TacticKey → 行動パターン (ハンドラー) の対応表
// 新しいタイプを追加する場合は AI/types.ts の TACTIC_KEYS にキーを追加し, ここにハンドラーを登録する
export const TACTIC_HANDLERS: Record<TacticKey, TacticHandler> = {
  heavyWarrior,
  lightWarrior,
  archer,
  fireSpell,
  woodWaterSpell,
  earthMetalSpell
}

// 敵 (NPC) の行動を決定する (State.nextTurn から呼び出される)
// actor.tactic に対応するハンドラーが無い場合は「待機」を返す (未指定の tactic や, 将来キーを増やし忘れた場合の保険)
export function decideEnemyAction(actor: Unit, state: State, difficulity: BattleDifficultyTier): ActionRequest {
  const handler = actor.tactic ? TACTIC_HANDLERS[actor.tactic] : null
  if (!handler) return { key: 'wait', options: {}, targets: [] }
  return handler(actor, state, difficulity)
}
