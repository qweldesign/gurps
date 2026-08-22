// Combat/AI/handlers/fireSpell.ts

import { type TacticHandler } from '../handler'
import { fireSpellTactic } from '../base/fireSpell'
import { lightWarrior } from './lightWarrior'
import { getFrontAllyCount } from '../utils'

/**
 * 術戦士B: 火行術をメインで戦う / 前衛の味方が1人になったら前衛に出て「軽戦士」として応戦する
 *
 * 0. 前衛への恒久コミット (actor.aiFrontCommitted)
 * 1. で前衛の味方が1人になったことを理由に前衛に出た場合, 以降は狂戦士状態の解除等に関わらず
 * ずっと「軽戦士」として振る舞う (恒久コミットは狂戦士解除後の後衛帰還よりも優先する)
 *
 * 0-a. 狂戦士状態
 * 前に出て近接戦闘を行うのが狂戦士状態でのセオリーのため, 「軽戦士」として振る舞う
 *
 * 0-b. 移動 (狂戦士状態の解除後)
 * 狂戦士状態が解除されても前衛に出たままなら, 後衛へ戻る (canMove('back') は狂戦士状態でなければ常に可能)
 * (0. の恒久コミットが成立している場合はこのステップに到達しない)
 *
 * 1. 移動
 * 2ターン目以降, 前衛の味方が1人になった場合は前衛に移動し, 「軽戦士」として戦う
 * (この時点で 0. の恒久コミットが成立する)
 *
 * 2. 基本の詠唱パターン (base/fireSpell.ts の fireSpellTactic を参照)
 */
export const fireSpell: TacticHandler = (actor, state) => {
  // 0. 前衛への恒久コミットが成立している場合は, 以降ずっと「軽戦士」として振る舞う
  if (actor.aiFrontCommitted) return lightWarrior(actor, state)

  // 0-a. 狂戦士状態 (術戦士Bの武器は近接戦闘に使えるため, 持ち替え不要でそのまま委譲できる)
  if (actor.statusEffects.berserk) return lightWarrior(actor, state)

  // 0-b. 狂戦士状態の解除後: 前衛に出たままなら後衛へ戻る
  if (actor.position !== 'back') {
    const { availability } = state.action!
    if (availability.move.back) return { key: 'move', options: { position: 'back' }, targets: [] }
    // 後衛へ戻れない間 (幻惑状態等) は, 引き続き「軽戦士」として応戦する
    return lightWarrior(actor, state)
  }

  // 1. 移動 (前衛の味方が1人になった場合, 前衛に出て恒久的にコミットする)
  if (state.round >= 2 && getFrontAllyCount(state, actor.side) === 1) {
    actor.aiFrontCommitted = true
    return lightWarrior(actor, state)
  }

  // 2. 基本の詠唱パターン
  return fireSpellTactic(actor, state)
}
