// Combat/AI/handlers/woodWaterSpell.ts

import { type TacticHandler } from '../handler'
import { woodSpellTactic } from '../base/woodSpell'
import { waterSpellTactic } from '../base/waterSpell'
import { lightWarrior } from './lightWarrior'
import { chance } from '../utils'

/**
 * 術剣士: 木行術と水行術をメインで戦う
 *
 * 0-a. 狂戦士状態
 * 前に出て近接戦闘を行うのが狂戦士状態でのセオリーのため, 「軽戦士」として振る舞う
 *
 * 0-b. 移動 (狂戦士状態の解除後)
 * 狂戦士状態が解除されても前衛に出たままなら, 後衛へ戻る (canMove('back') は狂戦士状態でなければ常に可能)
 *
 * 1. 集中中の系統への委譲
 * 集中時間が0ターンなら, 50% の確率分岐でどちらかの術に集中を開始する
 * (水行術の技能値が12未満なら, 常に木行術に集中する)
 *
 * A. 木行術パターン (base/woodSpell.ts の woodSpellTactic を参照)
 * B. 水行術パターン (base/waterSpell.ts の waterSpellTactic を参照)
 */
export const woodWaterSpell: TacticHandler = (actor, state, difficulity) => {
  // 0-a. 狂戦士状態 (術剣士の武器は近接戦闘に使えるため, 持ち替え不要でそのまま委譲できる)
  if (actor.statusEffects.berserk) return lightWarrior(actor, state, difficulity)

  // 0-b. 狂戦士状態の解除後: 前衛に出たままなら後衛へ戻る
  if (actor.position !== 'back') {
    const { availability } = state.action!
    if (availability.move.back) return { key: 'move', options: { position: 'back' }, targets: [] }
    // 後衛へ戻れない間 (幻惑状態等) は, 引き続き「軽戦士」として応戦する
    return lightWarrior(actor, state, difficulity)
  }

  // 1. 集中中の系統があればそちらへ委譲する (いずれも集中していなければ, 新たにどちらへ集中するか決める)
  if (actor.spellCast.wood > 0) return woodSpellTactic(actor, state)
  if (actor.spellCast.water > 0) return waterSpellTactic(actor, state)

  const skill = actor.spells.water
  const element = skill >= 12 && chance() ? 'water' : 'wood'
  return element === 'wood' ? woodSpellTactic(actor, state) : waterSpellTactic(actor, state)
}
