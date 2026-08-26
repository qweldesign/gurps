// Combat/AI/base/waterSpell.ts
//
// 水行術の基本詠唱パターン

import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { chance, frontOrAll, pickByPriority, pickLowestDefenseTarget } from '../utils'

/**
 * 1. 集中
 * 集中時間が0ターンなら, 集中
 *
 * 2. 集中時間が1ターン
 * 水行術の技能値で分岐
 * 水行術の技能値が13以上なら, 75% の確率分岐で集中を継続するか,「ぼんやり」
 * 水行術の技能値が12なら,「ぼんやり」
 * 「生命の雫」は NPC は使わない
 * 「ぼんやり」の対象: 敵前衛優先 (いなければ全員). 抵抗値 (pre) が低い対象を優先し, 同じなら中央 (position: center) を優先する
 *
 * 3. 集中時間が2ターン
 * 水行術の技能値が14未満なら, 「水舞」
 * 水行術の技能値が16以上なら, 75% の確率分岐で集中を継続するか, 次と同じ
 * 水行術の技能値が14, 15なら, 50% の確率分岐で「水舞」か「水弾」
 * 「水舞」の対象: 味方前衛優先 (いなければ全員). 素の防護点 (sdr) が低い対象を優先する
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

  // 「ぼんやり」の対象選定 (敵前衛優先. 抵抗値 (pre) が低い対象を優先し, 同じなら中央を優先する)
  const dazedTarget = pickByPriority(
    frontOrAll(state.action!.target.enemies),
    unit => unit.defense.pre,
    unit => unit.position === 'center' ? 0 : 1
  )
  const dazed = (): ActionRequest => dazedTarget
    ? { key: 'spell', options: { element: 'water', spellId: 1 }, targets: [dazedTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 「水舞」の対象選定 (味方前衛優先. 素の防護点 (sdr) が低い対象を優先する)
  const protectTarget = pickByPriority(frontOrAll(state.action!.target.allies), unit => unit.defense.getModelByKey('body').sdr)
  const protect = (): ActionRequest => protectTarget
    ? { key: 'spell', options: { element: 'water', spellId: 2 }, targets: [protectTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 2. 集中時間が1ターン (「生命の雫」は NPC は使わない)
  if (turns === 1) {
    if (skill >= 13 && chance(0.75)) return cast() // 集中継続
    return dazed() // ぼんやり
  }

  // 3. 集中時間が2ターン
  if (turns === 2) {
    if (skill < 14) return protect() // 水舞
    if (skill >= 16 && chance(0.75)) return cast() // 集中継続
    return chance() ? protect() : enemy(3) // 水舞 / 水弾
  }

  // 4. 集中時間が3ターン (「吹雪」. その前に「時間遡行」が発動する可能性有り)
  return self(5)
}
