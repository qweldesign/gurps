// Combat/AI/base/woodSpell.ts
//
// 木行術の基本詠唱パターン

import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { chance, frontOrAll, pickByPriority, pickLowestDefenseTarget } from '../utils'

/**
 * 1. 集中
 * 集中時間が0ターンなら, 集中
 *
 * 2. 集中時間が1ターン
 * 木行術の技能値で分岐
 * 木行術の技能値が12未満なら,「ヘイスト」
 * 木行術の技能値が13以上なら, 50% の確率分岐で集中を継続するか, 次と同じ
 * 木行術の技能値が12なら, 50% の確率分岐で「ヘイスト」か「茨の呪縛」
 * 「ヘイスト」の対象: 味方前衛優先 (いなければ全員). 既に回避UPバフが掛かっている対象がいれば最優先,
 * それ以外は素の回避値 (StatusBuff によるバフを除いた defense.ev) が低い対象を優先する
 *
 * 3. 集中時間が2ターン
 * 木行術の技能値で分岐
 * 木行術の技能値が16以上なら, 50% の確率分岐で集中を継続するか,「風の刃」
 * 木行術の技能値が16未満なら,「風の刃」
 * 「守りの風」は NPC は使わない
 *
 * 4. 集中時間が3ターン
 * 「召雷」
 * 「癒しの風」は NPC は使わない
 */
export function woodSpellTactic(actor: Unit, state: State): ActionRequest {
  const skill = actor.spells.wood
  const turns = actor.spellCast.wood

  // 1. 集中
  if (turns === 0) return { key: 'cast', options: { element: 'wood' }, targets: [] }

  const cast = (): ActionRequest => ({ key: 'cast', options: { element: 'wood' }, targets: [] })
  const enemyTarget = pickLowestDefenseTarget(actor, state.action!.target.enemies)
  const enemy = (spellId: number): ActionRequest => enemyTarget
    ? { key: 'spell', options: { element: 'wood', spellId }, targets: [enemyTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 「ヘイスト」の対象選定 (味方前衛優先. 既に回避UPバフが掛かっている対象がいれば最優先, それ以外は素の回避値が低い対象を優先する)
  const hasteTarget = pickByPriority(
    frontOrAll(state.action!.target.allies),
    unit => unit.statusBuff.ev === 1 ? 0 : 1,
    unit => unit.defense.ev
  )
  const haste = (): ActionRequest => hasteTarget
    ? { key: 'spell', options: { element: 'wood', spellId: 0 }, targets: [hasteTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 2. 集中時間が1ターン
  if (turns === 1) {
    if (skill < 12) return haste() // ヘイスト
    if (skill >= 13 && chance()) return cast() // 集中継続
    // 次と同じ (技能値12のケースと同じ判定)
    return chance() ? haste() : enemy(1) // ヘイスト / 茨の呪縛
  }

  // 3. 集中時間が2ターン (「守りの風」は NPC は使わない)
  if (turns === 2) {
    if (skill >= 16 && chance()) return cast() // 集中継続
    return enemy(2) // 風の刃
  }

  // 4. 集中時間が3ターン (「召雷」.「癒しの風」は NPC は使わない)
  return enemy(5)
}
