// Combat/AI/handlers/heavyWarrior.ts

import { type TacticHandler } from '../handler'
import { chance, isIncapacitated, pickByPositionPriority, pickFullPowerOption, pickMoveToReachMeleeTarget, worstOwnDefenseTarget } from '../utils'

/**
 * 重戦士, 術戦士F: 積極的に中央に移動して前衛で戦う (術は使わない)
 * 防御優先で慎重に戦う
 *
 * 1. 移動
 * 後衛にいれば前衛に移動 (優先順位 1.中央, 2.左翼, 3.右翼)
 * 前衛にいて, かつ攻撃対象がいれば 2. へ
 *
 * 2. 全力攻撃
 * 自身を攻撃可能な敵全員が朦朧状態や幻惑や目/耳/四肢を故障しているなら全力攻撃
 * それ以外なら 3. へ
 * 
 * 3. 行動分岐
 * 自身の牽制による修正込みの敵の防御目標値によって分岐
 * 敵の防御目標値が8以下なら 4. へ, 10以上なら 5. へ, 
 * その間(9)なら 50% の確率分岐で 4. か 5. へ
 * 
 * 4. 全力攻撃/攻撃
 * 自身を攻撃可能な敵が1人なら全力攻撃, 2人以上なら攻撃
 * 
 * 5. 全力攻撃/全力防御/準備/攻撃/牽制
 * 敵の牽制による修正 (複数なら最大の修正を適用) 込みの自身の防御目標値によって行動分岐
 * 自身の防御目標値が7以下なら全力攻撃, 9か10なら全力防御,
 * その間(8)なら 50% の確率分岐で 全力攻撃 か 全力防御 へ
 * それ以外(11以上)なら 6. へ
 * 
 * 6. 準備/攻撃/牽制
 * 準備が必要な場合は準備
 * 自身の牽制による修正込みの敵の防御目標値と, 自身の武器が引き戻しが必要な武器かによって分岐
 * 敵の防御目標値が11以下なら攻撃
 * 自身の武器が引き戻し不要で, かつ敵の防御目標値が12なら攻撃
 * それ以外なら牽制
 * 
 * * 全力攻撃オプションについて (pickFullPowerOption に集約)
 * 準備が必要なら, 準備即攻撃
 * ダメージ期待値が0点なら, ダメージ安定
 * 攻撃目標値が10以下なら, 技能値+4
 * 敵の防御目標値が11以上なら, 牽制即攻撃
 * それ以外なら, 2回攻撃
 *
 * * ターゲットについて
 * 優先順位 1.中央, 2.左翼, 3.右翼
 */
export const heavyWarrior: TacticHandler = (actor, state) => {
  const { availability, target } = state.action!

  // 1. 移動
  if (actor.position === 'back') {
    const position = (['center', 'left', 'right'] as const).find(pos => availability.move[pos])
    if (position) return { key: 'move', options: { position }, targets: [] }
    return { key: 'wait', options: {}, targets: [] }
  }

  // 前衛にいるが現在位置からは攻撃対象が0体の場合, 移動すれば対象に届く位置があればそこへ移動する
  const movePosition = pickMoveToReachMeleeTarget(actor, state)
  if (movePosition) return { key: 'move', options: { position: movePosition }, targets: [] }

  const melee = target.melee
  if (melee.length === 0) return { key: 'wait', options: {}, targets: [] }

  // 2. 全力攻撃
  if (melee.every(isIncapacitated)) {
    const enemy = pickByPositionPriority(melee)!
    return { key: 'attack', options: { aim: 'body', fullPower: pickFullPowerOption(actor, enemy, state.foggy) }, targets: [enemy] }
  }

  // 3. 行動分岐
  const primaryTarget = pickByPositionPriority(melee)!
  const enemyDefense = primaryTarget.defense.getTarget(actor, 'body')
  const toAggressiveBranch = enemyDefense <= 8 || (enemyDefense === 9 && chance())

  if (toAggressiveBranch) {
    // 4. 全力攻撃/攻撃
    if (melee.length === 1) {
      return { key: 'attack', options: { aim: 'body', fullPower: pickFullPowerOption(actor, primaryTarget, state.foggy) }, targets: [primaryTarget] }
    }
    if (actor.attack.ready > 0) return { key: 'ready', options: {}, targets: [] } // 通常攻撃には武器の準備状態が要る
    return { key: 'attack', options: { aim: 'body', fullPower: 'none' }, targets: [primaryTarget] }
  }

  // 5. 全力攻撃/全力防御/準備/攻撃/牽制
  const selfDefense = worstOwnDefenseTarget(actor, melee)
  if (selfDefense <= 7) {
    return { key: 'attack', options: { aim: 'body', fullPower: pickFullPowerOption(actor, primaryTarget, state.foggy) }, targets: [primaryTarget] }
  }
  if (selfDefense === 9 || selfDefense === 10) {
    return { key: 'defense', options: {}, targets: [] }
  }
  if (selfDefense === 8) {
    return chance()
      ? { key: 'attack', options: { aim: 'body', fullPower: pickFullPowerOption(actor, primaryTarget, state.foggy) }, targets: [primaryTarget] }
      : { key: 'defense', options: {}, targets: [] }
  }

  // 6. 準備/攻撃/牽制
  if (actor.attack.ready > 0) return { key: 'ready', options: {}, targets: [] }
  const targetDefense = primaryTarget.defense.getTarget(actor, 'body')
  if (targetDefense <= 11) return { key: 'attack', options: { aim: 'body', fullPower: 'none' }, targets: [primaryTarget] }
  if (actor.attack.model.ready === 0 && targetDefense === 12) {
    return { key: 'attack', options: { aim: 'body', fullPower: 'none' }, targets: [primaryTarget] }
  }
  return { key: 'feint', options: {}, targets: [primaryTarget] }
}
