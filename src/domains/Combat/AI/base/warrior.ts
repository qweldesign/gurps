// Combat/AI/base/warrior.ts
//
// 戦士の基本戦闘パターン

import { type BattleDifficultyTier } from '../../Difficulty'
import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { chance, isIncapacitated, pickLowestDefenseTarget, pickAttackOption, pickFullPowerOption, pickMoveToReachMeleeTarget, worstOwnDefenseTarget } from '../utils'

// 戦士系統の移動先優先順位
type MovePriority = Array<'left' | 'center' | 'right'> // 1. 後衛から前衛への移動優先順位

// 戦士系統の行動パラメータ
type WarriorParams = {
  attackMax: number    // 5. 自身の防御目標値がこの値以下なら全力攻撃
  defenseValues: number[]   // 5. 自身の防御目標値がこれらの値なら全力防御
  coinflipValues: number[]  // 5. 自身の防御目標値がこれらの値なら 50% の確率分岐で全力攻撃/全力防御
  quickAttack: number  // 攻撃選択時に指定確率で全力攻撃を実行
}

// 重戦士: 積極的に中央に移動して前衛で戦う
const heavyWarriorMove: MovePriority = ['center', 'left', 'right']

// 軽戦士: 積極的に左翼・右翼に移動して前衛で戦う
const lightWarriorMove: MovePriority = ['left', 'right', 'center']

// 慎重: 防御優先
const cautious: WarriorParams = {
  attackMax: 7,
  defenseValues: [9, 10],
  coinflipValues: [8],
  quickAttack: 0
}

// 堅実: バランス
const steady: WarriorParams = {
  attackMax: 8,
  defenseValues: [10],
  coinflipValues: [9],
  quickAttack: 0.125
}

// 大胆: 攻撃優先
const bold: WarriorParams = {
  attackMax: 9,
  defenseValues: [],
  coinflipValues: [10],
  quickAttack: 0.25
}

 // 無謀: 防御破棄
const reckless: WarriorParams = {
  attackMax: 10,
  defenseValues: [],
  coinflipValues: [],
  quickAttack: 0.5
}

// PC / 重戦士, 術戦士F

/**
 * 戦士系統の基本行動パターン
 *
 * 1. 移動
 * 後衛にいれば前衛に移動 (優先順位は params.movePriority)
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
 * 敵の牽制による修正 (複数なら最大の修正を適用) 込みの自身の防御目標値によって行動分岐 (閾値は params で指定)
 * 自身の防御目標値が params.attackMax 以下なら全力攻撃, params.defenseValues に含まれるなら全力防御,
 * params.coinflipValues に含まれるなら 50% の確率分岐で 全力攻撃 か 全力防御 へ
 * それ以外なら 6. へ
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
 * 射撃 (archerTactic) と同様, 近接対象の中から自身の牽制による修正込みの防御目標値が最も低い相手を選ぶ
 */
export function warriorTactic(actor: Unit, state: State, isHeavyWarrior: boolean, difficulty: BattleDifficultyTier): ActionRequest {
  const movePriority: MovePriority = isHeavyWarrior ? heavyWarriorMove : lightWarriorMove
  const params: WarriorParams = isHeavyWarrior ? 
    (difficulty === 'hard' ? cautious : difficulty === 'normal' ? steady : bold) :
    (difficulty === 'hard' ? steady : difficulty === 'normal' ? bold : reckless)

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

  // 2. 全力攻撃
  if (melee.every(isIncapacitated)) {
    const enemy = pickLowestDefenseTarget(actor, melee)!
    return { key: 'attack', options: { aim: 'body', fullPower: pickFullPowerOption(actor, enemy, state.shootPenalty[actor.side]) }, targets: [enemy] }
  }

  // 3. 行動分岐
  const primaryTarget = pickLowestDefenseTarget(actor, melee)!
  const enemyDefense = primaryTarget.defense.getTarget(actor, 'body')
  const toAggressiveBranch = enemyDefense <= 8 || (enemyDefense === 9 && chance())

  if (toAggressiveBranch) {
    // 4. 全力攻撃/攻撃
    if (melee.length === 1) {
      return { key: 'attack', options: { aim: 'body', fullPower: pickFullPowerOption(actor, primaryTarget, state.shootPenalty[actor.side]) }, targets: [primaryTarget] }
    }
    if (actor.attack.ready > 0) return { key: 'ready', options: {}, targets: [] } // 通常攻撃には武器の準備状態が要る
    return pickAttackOption(actor, state, primaryTarget, params.quickAttack)
  }

  // 5. 全力攻撃/全力防御/準備/攻撃/牽制
  const selfDefense = worstOwnDefenseTarget(actor, melee)
  if (selfDefense <= params.attackMax) {
    return { key: 'attack', options: { aim: 'body', fullPower: pickFullPowerOption(actor, primaryTarget, state.shootPenalty[actor.side]) }, targets: [primaryTarget] }
  }
  if (params.defenseValues.includes(selfDefense)) {
    return { key: 'defense', options: {}, targets: [] }
  }
  if (params.coinflipValues.includes(selfDefense)) {
    return chance()
      ? { key: 'attack', options: { aim: 'body', fullPower: pickFullPowerOption(actor, primaryTarget, state.shootPenalty[actor.side]) }, targets: [primaryTarget] }
      : { key: 'defense', options: {}, targets: [] }
  }

  // 6. 準備/攻撃/牽制
  if (actor.attack.ready > 0) return { key: 'ready', options: {}, targets: [] }
  const targetDefense = primaryTarget.defense.getTarget(actor, 'body')
  if (targetDefense <= 11) {
    return pickAttackOption(actor, state, primaryTarget, params.quickAttack)
  }
  if (actor.attack.model.ready === 0 && targetDefense === 12) {
    return pickAttackOption(actor, state, primaryTarget, params.quickAttack)
  }
  return { key: 'feint', options: {}, targets: [primaryTarget] }
}
