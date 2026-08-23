// Combat/AI/handlers/archer.ts

import { type TacticHandler } from '../handler'
import { archerTactic } from '../base/archer'
import { lightWarrior } from './lightWarrior'

/**
 * 弓使い: 後衛から射撃
 *
 * 0-a. 狂戦士状態
 * 弓は近接戦闘に使えないため, 予備武器 (近接武器) に持ち替えた上で,
 * 前に出て近接戦闘を行うのが狂戦士状態でのセオリーのため, 「軽戦士」として振る舞う
 *
 * 0-b. 移動 (狂戦士状態の解除後)
 * 狂戦士状態が解除されても前衛に出たままなら, 後衛へ戻る (canMove('back') は狂戦士状態でなければ常に可能)
 * 後衛へ戻ったら, 弓 (main) に持ち替え直す (前衛にいる間は近接武器 (spare) のまま「軽戦士」として応戦する)
 *
 * 1. 基本の射撃パターン (base/archer.ts の archerTactic を参照)
 */
export const archer: TacticHandler = (actor, state, difficulity) => {
  const { availability } = state.action!

  // 0-a. 狂戦士状態 (弓 (main) は近接戦闘に使えないため, 予備武器 (spare: レイピア/ダガー) に持ち替えてから委譲する.
  // 持ち替え済み (または持ち替え不能) なら, そのまま「軽戦士」の行動パターンに委譲する)
  if (actor.statusEffects.berserk) {
    if (actor.attack.key !== 'spare' && availability.changeWeapon) {
      return { key: 'changeWeapon', options: { weaponSlotKey: 'spare' }, targets: [] }
    }
    return lightWarrior(actor, state, difficulity)
  }

  // 0-b. 狂戦士状態の解除後: 前衛に出たままなら後衛へ戻る. 後衛に戻れたら弓 (main) に持ち替え直す
  if (actor.position !== 'back') {
    if (availability.move.back) return { key: 'move', options: { position: 'back' }, targets: [] }
    // 後衛へ戻れない間 (幻惑状態等) は, 引き続き「軽戦士」として応戦する
    return lightWarrior(actor, state, difficulity)
  }
  if (actor.attack.key !== 'main' && availability.changeWeapon) {
    return { key: 'changeWeapon', options: { weaponSlotKey: 'main' }, targets: [] }
  }

  // 1. 基本の射撃パターン
  return archerTactic(actor, state)
}
