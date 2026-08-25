// Combat/AI/base/metalSpell.ts
//
// 金行術の基本詠唱パターン

import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { chance, pickLowestDefenseTarget } from '../utils'

/**
 * 1. 集中
 * 集中時間が0ターンなら, 集中
 *
 * 2. 集中時間が1ターン
 * 金行術の技能値で分岐
 * 金行術の技能値が13未満なら,「金縛り」
 * 金行術の技能値が13以上なら, 50% の確率分岐で集中を継続するか,「金縛り」
 * 「杯」は NPC は使わない
 *
 * 3. 集中時間が2ターン
 * 金行術の技能値で分岐
 * 金行術の技能値が15未満なら,「金貨」
 * 金行術の技能値が15以上なら, 50% の確率分岐で集中を継続するか,「金貨」
 * その前に「盾」が発動する可能性有り
 *
 * 4. 集中時間が3ターン
 * 金行術の技能値で分岐
 * 金行術の技能値が16未満なら,「サイレン」
 * 金行術の技能値が16以上なら, 50% の確率分岐で「サイレン」か「塔」
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

  // 2. 集中時間が1ターン (「杯」は NPC は使わない)
  if (turns === 1) {
    if (skill >= 13 && chance()) return cast() // 集中継続
    return enemy(0) // 金縛り
  }

  // 3. 集中時間が2ターン (その前に「盾」が発動する可能性有り. 発動判定自体は Action/effects.ts 側で自動的に行われる)
  if (turns === 2) {
    if (skill >= 15 && chance()) return cast() // 集中継続
    return enemy(2) // 金貨
  }

  // 4. 集中時間が3ターン
  if (skill < 16) return enemy(4) // サイレン
  return chance() ? enemy(4) : enemy(5) // サイレン / 塔
}
