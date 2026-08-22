// Combat/AI/base/fireSpell.ts
//
// 火行術の基本詠唱パターン

import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { chance, pickLowestDefenseTarget } from '../utils'

/**
 * 1. 集中
 * 集中時間が0ターンなら, 集中
 *
 * 2. 集中時間が1ターン
 * 火行術の技能値で分岐
 * 火行術の技能値が12未満なら,「ヒロイズム」
 * 火行術の技能値が13以上なら, 50% の確率分岐で集中を継続するか, 次と同じ
 * 火行術の技能値が12なら, 50% の確率分岐で「ヒロイズム」か「閃光」
 *
 * 3. 集中時間が2ターン
 * 火行術の技能値で分岐
 * 火行術の技能値が14未満なら,「火球」
 * 火行術の技能値が15以上なら, 50% の確率分岐で集中を継続するか, 次と同じ
 * 火行術の技能値が14なら,「炎の嵐」
 *
 * 4. 集中時間が3ターン
 * 火行術の技能値で分岐
 * 火行術の技能値が16未満なら,「火の鳥」
 * 火行術の技能値が16以上なら, 50% の確率分岐で「火の鳥」か「焼殺」
 */
export function fireSpellTactic(actor: Unit, state: State): ActionRequest {
  const skill = actor.spells.fire
  const turns = actor.spellCast.fire

  // 1. 集中
  if (turns === 0) return { key: 'cast', options: { element: 'fire' }, targets: [] }

  const cast = (): ActionRequest => ({ key: 'cast', options: { element: 'fire' }, targets: [] })
  const self = (spellId: number): ActionRequest => ({ key: 'spell', options: { element: 'fire', spellId }, targets: [actor] })
  const enemyTarget = pickLowestDefenseTarget(actor, state.action!.target.enemies)
  const enemy = (spellId: number): ActionRequest => enemyTarget
    ? { key: 'spell', options: { element: 'fire', spellId }, targets: [enemyTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 2. 集中時間が1ターン
  if (turns === 1) {
    if (skill < 12) return self(0) // ヒロイズム
    if (skill >= 13 && chance()) return cast() // 集中継続
    // 次と同じ (技能値12のケースと同じ判定)
    return chance() ? self(0) : self(1) // ヒロイズム / 閃光 (対象を持たない術のため暫定的に自身を対象とする)
  }

  // 3. 集中時間が2ターン
  if (turns === 2) {
    if (skill < 14) return enemy(2) // 火球
    if (skill >= 15 && chance()) return cast() // 集中継続
    return self(3) // 炎の嵐 (次と同じ = 技能値14のケース. 対象を持たない術のため暫定的に自身を対象とする)
  }

  // 4. 集中時間が3ターン
  if (skill < 16) return self(4) // 火の鳥
  return chance() ? self(4) : enemy(5) // 火の鳥 / 焼殺
}
