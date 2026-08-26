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

// 幻惑・パニック状態時の強制行動を決定する (tactic の種類を問わず全ての自動行動タイプに共通)
// 幻惑状態: 「全力防御」以外ほぼ全ての行動 (移動・攻撃・射撃・集中・法術等) が封じられるため, 全力防御を選択する
//   (幻惑・狂戦士いずれの状態でも全力防御自体は選択可能. 狂戦士状態は isBerserkStuck 側で別途処理されるためここでは考慮しない)
// パニック状態 (幻惑ではない場合): 前衛にいれば後列へ「移動」を, 後列にいれば「待機」を選択する
//   (幻惑状態を優先するのは, 幻惑中は「移動」自体が選択不可のため. パニックの定義自体は Action.ts の開幕時自動実行と同一)
// 通常, パニックは開幕時の自動実行 (Action.ts) で既にそのターンが消費されるためここへ到達しないが,
// 朦朧からの「回復」成功等でターンが継続した場合に備え, 念のためここでも判定する
// (幻惑状態には Action.ts 側に自動実行の仕組みが無いため, こちらは通常通り毎ターン判定される)
// いずれにも該当しない場合は null を返し, 通常の tactic ハンドラーに判断を委ねる
function decideForImpairedState(actor: Unit): ActionRequest | null {
  if (actor.statusEffects.dazed > 0) {
    return { key: 'defense', options: {}, targets: [] }
  }
  if (actor.statusEffects.panic > 0) {
    return actor.position !== 'back'
      ? { key: 'move', options: { position: 'back' }, targets: [] }
      : { key: 'wait', options: {}, targets: [] }
  }
  return null
}

// 敵 (NPC) の行動を決定する (State.nextTurn から呼び出される)
// 幻惑・パニック状態の場合はそちらを優先し, actor.tactic に対応するハンドラーが無い場合は「待機」を返す
// (未指定の tactic や, 将来キーを増やし忘れた場合の保険)
export function decideEnemyAction(actor: Unit, state: State, difficulity: BattleDifficultyTier): ActionRequest {
  const impaired = decideForImpairedState(actor)
  if (impaired) return impaired
  const handler = actor.tactic ? TACTIC_HANDLERS[actor.tactic] : null
  if (!handler) return { key: 'wait', options: {}, targets: [] }
  return handler(actor, state, difficulity)
}
