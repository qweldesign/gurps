// Combat/AI/base/earthSpell.ts
//
// 土行術の基本詠唱パターン

import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { chance, frontOrAll, pickByPriority, pickLowestDefenseTarget } from '../utils'

/**
 * 1. 集中
 * 集中時間が0ターンなら, 集中
 *
 * 2. 集中時間が1ターン
 * 土行術の技能値で分岐
 * 土行術の技能値が12未満なら,「ベルセルク」
 * 土行術の技能値が13以上なら, 50% の確率分岐で集中を継続するか, 次と同じ
 * 土行術の技能値が12なら, 50% の確率分岐で「ベルセルク」か「アースハンド」
 * 「ベルセルク」の対象: 味方前衛優先 (いなければ全員). 既に攻撃UPバフが掛かっている対象がいれば最優先,
 * それ以外は tactic: heavyWarrior (重戦士) の対象を優先する
 *
 * 3. 集中時間が2ターン
 * 土行術の技能値が16以上なら, 50% の確率分岐で集中を継続するか,「恐慌」
 * 土行術の技能値が16未満なら,「恐慌」
 * 「痛覚鈍麻」は NPC は使わない
 * 「恐慌」の対象: 敵前衛優先 (いなければ全員). 抵抗値 (pre) が低い対象を優先し, 同じなら中央 (position: center) を優先する
 *
 * 4. 集中時間が3ターン
 * 「瓦礫の雨」
 * 「傀儡」は NPC は使わない
 */
export function earthSpellTactic(actor: Unit, state: State): ActionRequest {
  const skill = actor.spells.earth
  const turns = actor.spellCast.earth

  // 1. 集中
  if (turns === 0) return { key: 'cast', options: { element: 'earth' }, targets: [] }

  const cast = (): ActionRequest => ({ key: 'cast', options: { element: 'earth' }, targets: [] })
  const self = (spellId: number): ActionRequest => ({ key: 'spell', options: { element: 'earth', spellId }, targets: [actor] })
  const enemyTarget = pickLowestDefenseTarget(actor, state.action!.target.enemies)
  const enemy = (spellId: number): ActionRequest => enemyTarget
    ? { key: 'spell', options: { element: 'earth', spellId }, targets: [enemyTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 「ベルセルク」の対象選定 (味方前衛優先. 既に攻撃UPバフが掛かっている対象がいれば最優先, それ以外は tactic: heavyWarrior を優先する)
  const berserkTarget = pickByPriority(
    frontOrAll(state.action!.target.allies),
    unit => unit.statusBuff.dmg === 1 ? 0 : 1,
    unit => unit.tactic === 'heavyWarrior' ? 0 : 1
  )
  const berserk = (): ActionRequest => berserkTarget
    ? { key: 'spell', options: { element: 'earth', spellId: 0 }, targets: [berserkTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 「恐慌」の対象選定 (敵前衛優先. 抵抗値 (pre) が低い対象を優先し, 同じなら中央を優先する)
  const panicTarget = pickByPriority(
    frontOrAll(state.action!.target.enemies),
    unit => unit.defense.pre,
    unit => unit.position === 'center' ? 0 : 1
  )
  const panic = (): ActionRequest => panicTarget
    ? { key: 'spell', options: { element: 'earth', spellId: 2 }, targets: [panicTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 2. 集中時間が1ターン
  if (turns === 1) {
    if (skill < 12) return berserk() // ベルセルク
    if (skill >= 13 && chance()) return cast() // 集中継続
    // 次と同じ (技能値12以上のケースと同じ判定)
    return chance() ? berserk() : enemy(1) // ベルセルク / アースハンド
  }

  // 3. 集中時間が2ターン (「痛覚鈍麻」は NPC は使わない)
  if (turns === 2) {
    if (skill >= 16 && chance()) return cast() // 集中継続
    return panic() // 恐慌
  }

  // 4. 集中時間が3ターン (「瓦礫の雨」.「傀儡」は NPC は使わない)
  return self(5)
}
