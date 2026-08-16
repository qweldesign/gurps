// Combat/Action/resolver.ts

import { type CombatUnit as Unit } from '../Unit'
import { judge, roll, score, type Judge } from '../Dice'
import { AIM_OPTIONS, type Aim, type FullPower, type AttackResult, type DefenseResult, type DmgResult, type FeintResult } from './types'

// 攻撃の判定結果を返す (武器の準備状態の更新は effects 側の責務とする. ここでは判定のみ行う)
export function judgeAttack(actor: Unit, aim: Aim, fullPower: FullPower, target: Unit): Omit<AttackResult, 'ready'> {
  const attackTarget = actor.attack.getTarget(aim, fullPower, target)
  return { aim, fullPower, ...judge(attackTarget) }
}

// 防御の判定結果を返す
// 「止め」「受け」「よけ」のうち, 最も成功率の高い防御を自動選択する
// actor が target に対して牽制を成功させている場合, 防御目標値から牽制の成功度分を減算する
// (武器の準備状態の更新は effects 側の責務とする. ここでは判定のみ行う)
export function judgeDefense(actor: Unit, aim: Aim, target: Unit): Omit<DefenseResult, 'ready'> {
  const defense = target.defense
  const feint = actor.attack.feint
  const feintScore = (feint && feint.target === target) ? feint.score : 0
  if (defense.getCanBlock(aim)) {
    return { defenseType: 'block', ...judge(defense.getBlockTarget(actor) - feintScore) }
  } else if (defense.canParry) {
    return { defenseType: 'parry', ...judge(defense.getParryTarget(actor) - feintScore) }
  } else {
    return { defenseType: 'dodge', ...judge(defense.getDodgeTarget() - feintScore) }
  }
}

// ダメージの判定結果を返す
export function rollDmg(actor: Unit, aim: Aim, fullPower: FullPower, target: Unit): DmgResult {
  const attack = actor.attack.model
  const dr = target.defense.getDR(AIM_OPTIONS[aim].group, attack.dmgType)
  let count = attack.dmgDice
  count -= fullPower === 'dmg' ? 1 : 0 // 全力攻撃オプション「ダメージ安定」
  let mod = attack.dmgMod - dr
  mod += fullPower === 'dmg' ? 6 : 0 // 全力攻撃オプション「ダメージ安定」
  const rate = attack.dmgType === 0 ? 1 : attack.dmgType === 1 ? 1.5 : 2
  const rolled = Math.floor(roll(count, mod).roll * rate)
  return { roll: rolled, success: rolled > 0, critical: rolled >= 10 }
}

// 牽制の判定結果を返す (成功度がそのまま target の次の防御目標値へのペナルティになる)
export function judgeFeint(actor: Unit, target: Unit): FeintResult {
  return { target, ...score(actor.attack.target) }
}

// 朦朧状態からの回復判定を返す (成功: 回復, 失敗: 朦朧状態の継続)
export function judgeRecovery(actor: Unit): Judge {
  return judge(actor.defense.pre)
}

// 朦朧状態からの回復判定を返す (成功: 朦朧のみ, 失敗: 転倒)
export function judgeKnockedDown(target: Unit): Judge {
  return judge(target.defense.pre)
}

// 気絶からの生存判定を返す (成功: 気絶のみ, 失敗: 死亡)
export function judgeFatal(target: Unit): Judge {
  return judge(target.defense.pre)
}
