// Combat/AI/base/woodSpell.ts
//
// 木行術の基本詠唱パターン

import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { chance, pickLowestDefenseTarget } from '../utils'

/**
 * 1. 集中
 * 集中時間が0ターンなら, 集中
 *
 * 2. 集中時間が1ターン
 * 木行術の技能値で分岐
 * 木行術の技能値が12未満なら,「ヘイスト」
 * 木行術の技能値が13以上なら, 50% の確率分岐で集中を継続するか, 次と同じ
 * 木行術の技能値が12なら, 50% の確率分岐で「ヘイスト」か「茨の呪縛」
 *
 * 3. 集中時間が2ターン
 * 木行術の技能値で分岐
 * 木行術の技能値が14未満なら,「風の刃」
 * 木行術の技能値が16以上なら, 50% の確率分岐で集中を継続するか, 次と同じ
 * 木行術の技能値が14か15なら, 50% の確率分岐で「風の刃」か「サイレンス」
 *
 * 4. 集中時間が3ターン
 * 「召雷」
 * 「リストレーション」は NPC は使わない
 */
export function woodSpellTactic(actor: Unit, state: State): ActionRequest {
  const skill = actor.spells.wood
  const turns = actor.spellCast.wood

  // 1. 集中
  if (turns === 0) return { key: 'cast', options: { element: 'wood' }, targets: [] }

  const cast = (): ActionRequest => ({ key: 'cast', options: { element: 'wood' }, targets: [] })
  const self = (spellId: number): ActionRequest => ({ key: 'spell', options: { element: 'wood', spellId }, targets: [actor] })
  const enemyTarget = pickLowestDefenseTarget(actor, state.action!.target.enemies)
  const enemy = (spellId: number): ActionRequest => enemyTarget
    ? { key: 'spell', options: { element: 'wood', spellId }, targets: [enemyTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 2. 集中時間が1ターン
  if (turns === 1) {
    if (skill < 12) return self(0) // ヘイスト
    if (skill >= 13 && chance()) return cast() // 集中継続
    // 次と同じ (技能値12のケースと同じ判定)
    return chance() ? self(0) : enemy(1) // ヘイスト / 茨の呪縛
  }

  // 3. 集中時間が2ターン
  if (turns === 2) {
    if (skill < 14) return enemy(2) // 風の刃
    if (skill >= 16 && chance()) return cast() // 集中継続
    // 次と同じ (技能値14か15のケースと同じ判定)
    return chance() ? enemy(2) : enemy(3) // 風の刃 / サイレンス
  }

  // 4. 集中時間が3ターン (「召雷」.「リストレーション」は NPC は使わない)
  return enemy(5)
}
