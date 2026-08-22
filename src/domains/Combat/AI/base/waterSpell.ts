// Combat/AI/base/waterSpell.ts
//
// 水行術の基本詠唱パターン

import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { chance, pickLowestDefenseTarget } from '../utils'

/**
 * 1. 集中
 * 集中時間が0ターンなら, 集中
 *
 * 2. 集中時間が1ターン
 * 水行術の技能値で分岐
 * 水行術の技能値が12なら,「ぼんやり」
 * 水行術の技能値が13以上なら, 50% の確率分岐で集中を継続するか,「ぼんやり」
 * 「生命の雫」は NPC は使わない
 *
 * 3. 集中時間が2ターン
 * 水行術の技能値で分岐
 * 水行術の技能値が16未満なら,「水舞」
 * 水行術の技能値が16以上なら, 50% の確率分岐で集中を継続するか,「水舞」
 * 「濃霧」は NPC は使わない
 *
 * 4. 集中時間が3ターン
 * 「吹雪」/ その前に「時間遡行」が発動する可能性有り
 */
export function waterSpellTactic(actor: Unit, state: State): ActionRequest {
  const skill = actor.spells.water
  const turns = actor.spellCast.water

  // 1. 集中
  if (turns === 0) return { key: 'cast', options: { element: 'water' }, targets: [] }

  const cast = (): ActionRequest => ({ key: 'cast', options: { element: 'water' }, targets: [] })
  const self = (spellId: number): ActionRequest => ({ key: 'spell', options: { element: 'water', spellId }, targets: [actor] })
  const enemyTarget = pickLowestDefenseTarget(actor, state.action!.target.enemies)
  const enemy = (spellId: number): ActionRequest => enemyTarget
    ? { key: 'spell', options: { element: 'water', spellId }, targets: [enemyTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 2. 集中時間が1ターン (「生命の雫」は NPC は使わない)
  if (turns === 1) {
    if (skill >= 13 && chance()) return cast() // 集中継続
    return enemy(1) // ぼんやり
  }

  // 3. 集中時間が2ターン (「濃霧」は NPC は使わない)
  if (turns === 2) {
    if (skill >= 16 && chance()) return cast() // 集中継続
    return self(2) // 水舞
  }

  // 4. 集中時間が3ターン (「吹雪」. その前に「時間遡行」が発動する可能性有り)
  return self(5)
}
