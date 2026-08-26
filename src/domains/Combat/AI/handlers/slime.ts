// Combat/AI/handlers/slime.ts

import { type TacticHandler } from '../handler'
import { pickLowestDefenseTarget, pickAttackOption, pickMoveToReachMeleeTarget } from '../utils'

/**
 * スライムの基本行動パターン
 *
 * 1. 移動
 * 後衛にいれば前衛に移動 (優先順位は params.movePriority)
 * 前衛にいて, かつ攻撃対象がいれば 2. へ
 *
 * 2. 攻撃/全力攻撃
 * (現在Hpの割合に応じて, 全力攻撃の確率が上がる)
 */
export const slime: TacticHandler = (actor, state) => {
  const movePriority: Array<'left' | 'center' | 'right'> = ['center', 'left', 'right']
  
  const { availability, target } = state.action!

  // 1. 移動
  if (actor.position === 'back') {
    const position = movePriority.find(pos => availability.move[pos])
    if (position) return { key: 'move', options: { position }, targets: [] }
    return { key: 'wait', options: {}, targets: [] }
  }

  // 前衛にいるが現在位置からは攻撃対象が0体の場合, 移動すれば対象に届く位置があればそこへ移動する
  const movePosition = pickMoveToReachMeleeTarget(actor, state)
  if (movePosition) return { key: 'move', options: { position: movePosition }, targets: [] }

  const melee = target.melee
  if (melee.length === 0) return { key: 'wait', options: {}, targets: [] }

  const primaryTarget = pickLowestDefenseTarget(actor, melee)!
  
  // 現在Hpの割合に応じて, 全力攻撃の確率が上がる
  const quickAttack = actor.health.injury / actor.health.maxHp

  // 2. 攻撃/全力攻撃
  return pickAttackOption(actor, state, primaryTarget, quickAttack)
}
