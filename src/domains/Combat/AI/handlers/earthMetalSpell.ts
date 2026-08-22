// Combat/AI/handlers/earthMetalSpell.ts

import { type TacticHandler } from '../handler'
import { earthSpellTactic } from '../base/earthSpell'
import { metalSpellTactic } from '../base/metalSpell'
import { lightWarrior } from './lightWarrior'
import { chance } from '../utils'

/**
 * 術士: 土行術と金行術をメインで戦う
 *
 * 0-a. 狂戦士状態
 * 前に出て近接戦闘を行うのが狂戦士状態でのセオリーのため, 「軽戦士」として振る舞う
 *
 * 0-b. 移動 (狂戦士状態の解除後)
 * 狂戦士状態が解除されても前衛に出たままなら, 後衛へ戻る (canMove('back') は狂戦士状態でなければ常に可能)
 *
 * 1. 集中中の系統への委譲
 * 集中時間が0ターンなら, 50% の確率分岐でどちらかの術に集中を開始する
 *
 * A. 土行術パターン (base/earthSpell.ts の earthSpellTactic を参照)
 * B. 金行術パターン (base/metalSpell.ts の metalSpellTactic を参照)
 */
export const earthMetalSpell: TacticHandler = (actor, state) => {
  // 0-a. 狂戦士状態 (術士の武器 (杖) は近接戦闘に使えるため, 持ち替え不要でそのまま委譲できる)
  if (actor.statusEffects.berserk) return lightWarrior(actor, state)

  // 0-b. 狂戦士状態の解除後: 前衛に出たままなら後衛へ戻る
  if (actor.position !== 'back') {
    const { availability } = state.action!
    if (availability.move.back) return { key: 'move', options: { position: 'back' }, targets: [] }
    // 後衛へ戻れない間 (幻惑状態等) は, 引き続き「軽戦士」として応戦する
    return lightWarrior(actor, state)
  }

  // 1. 集中中の系統があればそちらへ委譲する (いずれも集中していなければ, 50% の確率分岐でどちらかに集中する)
  if (actor.spellCast.earth > 0) return earthSpellTactic(actor, state)
  if (actor.spellCast.metal > 0) return metalSpellTactic(actor, state)

  const element = chance() ? 'earth' : 'metal'
  return element === 'earth' ? earthSpellTactic(actor, state) : metalSpellTactic(actor, state)
}
