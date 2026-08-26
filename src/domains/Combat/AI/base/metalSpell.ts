// Combat/AI/base/metalSpell.ts
//
// 金行術の基本詠唱パターン

import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { chance, frontOrAll, pickByPriority, pickLowestDefenseTarget } from '../utils'

/**
 * 1. 集中
 * 集中時間が0ターンなら, 集中
 *
 * 2. 集中時間が1ターン
 * 金行術の技能値で分岐
 * 金行術の技能値が13以上なら, 75% の確率分岐で集中を継続するか,「金縛り」
 * 金行術の技能値が13未満なら,「金縛り」
 * 「杯」は NPC は使わない
 * 「金縛り」の対象: 敵前衛優先 (いなければ全員). 抵抗値 (pre) が低い対象を優先し, 同じなら中央 (position: center) を優先する
 *
 * 3. 集中時間が2ターン
 * 金行術の技能値で分岐
 * 金行術の技能値が15以上なら, 75% の確率分岐で集中を継続するか,「金貨」
 * 金行術の技能値が15未満なら,「金貨」
 * その前に「盾」が発動する可能性有り
 * 「金貨」の対象: 敵前衛優先 (いなければ全員). 抵抗値 (pre) が低い対象を優先し, 同じなら中央 (position: center) を優先する
 *
 * 4. 集中時間が3ターン
 * 金行術の技能値で分岐
 * 金行術の技能値が16以上なら, 50% の確率分岐で「サイレン」か「塔」
 * 金行術の技能値が16未満なら,「サイレン」
 */
export function metalSpellTactic(actor: Unit, state: State): ActionRequest {
  const skill = actor.spells.metal
  const turns = actor.spellCast.metal

  // 1. 集中
  if (turns === 0) return { key: 'cast', options: { element: 'metal' }, targets: [] }

  const cast = (): ActionRequest => ({ key: 'cast', options: { element: 'metal' }, targets: [] })
  const enemyTarget = pickLowestDefenseTarget(actor, state.action!.target.enemies)
  const enemy = (spellId: number): ActionRequest => enemyTarget
    ? { key: 'spell', options: { element: 'metal', spellId }, targets: [enemyTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 「金縛り」「金貨」共通の対象選定 (敵前衛優先. 抵抗値 (pre) が低い対象を優先し, 同じなら中央を優先する)
  const resistTarget = pickByPriority(
    frontOrAll(state.action!.target.enemies),
    unit => unit.defense.pre,
    unit => unit.position === 'center' ? 0 : 1
  )
  const resist = (spellId: number): ActionRequest => resistTarget
    ? { key: 'spell', options: { element: 'metal', spellId }, targets: [resistTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 2. 集中時間が1ターン (「杯」は NPC は使わない)
  if (turns === 1) {
    if (skill >= 13 && chance(0.75)) return cast() // 集中継続
    return resist(0) // 金縛り
  }

  // 3. 集中時間が2ターン (その前に「盾」が発動する可能性有り. 発動判定自体は Action/effects.ts 側で自動的に行われる)
  if (turns === 2) {
    if (skill >= 15 && chance(0.75)) return cast() // 集中継続
    return resist(2) // 金貨
  }

  // 4. 集中時間が3ターン
  if (skill >= 16 && chance()) return enemy(5) // 塔
  return enemy(4) // サイレン
}
