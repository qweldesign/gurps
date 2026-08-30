// Combat/AI/base/fireSpell.ts
//
// 火行術の基本詠唱パターン

import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { chance, frontOrAll, pickByPriority, createSpellActions } from '../utils'

/**
 * 1. 集中
 * 集中時間が0ターンなら, 集中
 *
 * 2. 集中時間が1ターン
 * 火行術の技能値で分岐
 * 火行術の技能値が12未満なら,「ヒロイズム」
 * 火行術の技能値が13以上なら, 75% の確率分岐で集中を継続するか, 次と同じ
 * 火行術の技能値が12なら, 50% の確率分岐で「ヒロイズム」か「閃光」
 * 「ヒロイズム」の対象: 味方前衛優先 (いなければ全員). 素の命中値 (StatusBuff によるバフを除いた attack.model.level) が低い対象を優先する
 *
 * 3. 集中時間が2ターン
 * 火行術の技能値で分岐
 * 火行術の技能値が14未満なら,「火球」
 * 火行術の技能値が15以上なら, 75% の確率分岐で集中を継続するか,「炎の嵐」
 * 火行術の技能値が14なら,「炎の嵐」
 *
 * 4. 集中時間が3ターン
 * 火行術の技能値で分岐
 * 火行術の技能値が16以上なら, 50% の確率分岐で「火の鳥」か「焼殺」
 * 火行術の技能値が16未満なら,「火の鳥」
 */
export function fireSpellTactic(actor: Unit, state: State): ActionRequest {
  const skill = actor.spells.fire
  const turns = actor.spellCast.fire
  const { cast, self, enemy } = createSpellActions(actor, state, 'fire')

  // 1. 集中
  if (turns === 0) return cast()

  // 「ヒロイズム」の対象選定 (味方前衛優先. 素の命中値が低い対象を優先する)
  const heroismTarget = pickByPriority(frontOrAll(state.action!.target.allies), unit => unit.attack.model.level)
  const heroism = (): ActionRequest => heroismTarget
    ? { key: 'spell', options: { element: 'fire', spellId: 0 }, targets: [heroismTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 2. 集中時間が1ターン
  if (turns === 1) {
    if (skill < 12) return heroism() // ヒロイズム
    if (skill >= 13 && chance(0.75)) return cast() // 集中継続
    // 次と同じ (技能値12のケースと同じ判定)
    return chance() ? heroism() : self(1) // ヒロイズム / 閃光 (対象を持たない術のため暫定的に自身を対象とする)
  }

  // 3. 集中時間が2ターン
  if (turns === 2) {
    if (skill < 14) return enemy(2) // 火球
    if (skill >= 15 && chance(0.75)) return cast() // 集中継続
    return self(3) // 炎の嵐 (次と同じ = 技能値14のケース. 対象を持たない術のため暫定的に自身を対象とする)
  }

  // 4. 集中時間が3ターン
  if (skill >= 16 && chance()) return enemy(5) // 焼殺
  return self(4) // 火の鳥
}
