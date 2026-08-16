// Combat/Action/effects.ts

import { CombatState as State } from '../State'
import { type Position, type CombatUnit as Unit } from '../Unit'
import { type Aim, type FullPower, type ActionResult } from './types'
import { judgeAttack, judgeDefense, rollDmg, judgeFeint, judgeRecovery, judgeKnockedDown, judgeFatal } from './resolver'

// 行動実行 (状態変更) を司るクラス / Action.execute から呼び出される
export class ActionEffects {
  private state: State

  constructor(state: State) {
    this.state = state
  }

  //「攻撃」実行 (判定結果に基づき, HPへのダメージ反映と朦朧・転倒・気絶・死亡までを処理する)
  attack(aim: Aim, fullPower: FullPower, target: Unit): ActionResult[] {
    const results: ActionResult[] = []
    const actor = this.state.actor

    // 攻撃判定
    const attackJudge = judgeAttack(actor, aim, fullPower, target)
    results.push({ type: 'attack', judge: attackJudge })
    if (!attackJudge.success) return results // 攻撃失敗時はここで処理を止める

    // 防御判定 (攻撃判定がクリティカルであればスキップ)
    if (!attackJudge.critical) {
      const defenseJudge = judgeDefense(actor, aim, target)
      results.push({ type: 'defense', judge: defenseJudge })

      // 能動防御の試行回数を加算 (「受け」「止め」はターンにつき通常1回, 全力防御時は2回まで. Defense.canParry/canBlock が参照する)
      if (defenseJudge.defenseType === 'parry') target.defense.parryCount++
      else if (defenseJudge.defenseType === 'block') target.defense.blockCount++

      if (defenseJudge.success) return results // 防御成功時はここで処理を止める
    }

    // ダメージ判定
    const dmgJudge = rollDmg(actor, aim, fullPower, target)
    results.push({ type: 'dmg', judge: dmgJudge })
    if (!dmgJudge.success) return results // ダメージが通らなかった時はここで処理を止める

    // ダメージ効果
    target.health.injury += dmgJudge.roll

    // 朦朧状態・転倒判定
    if (dmgJudge.roll >= target.health.maxHp / 2) {
      const knockedDownJudge = judgeKnockedDown(target)
      results.push({ type: 'knockedDown', judge: knockedDownJudge })
      if (!knockedDownJudge.success) {
        target.posture = 'prone' // 姿勢変更
      }
    }

    // 気絶・死亡判定
    if (target.health.unconscious) {
      const fatalJudge = judgeFatal(target)
      results.push({ type: 'fatal', judge: fatalJudge })
      if (!fatalJudge.success) {
        target.health.dead = true // 死亡
      }
    }

    return results
  }

  //「牽制」実行
  feint(target: Unit): ActionResult[] {
    const actor = this.state.actor
    const feintJudge = judgeFeint(actor, target)
    if (feintJudge.success) {
      actor.attack.feint = { currentTurn: true, target, score: feintJudge.score }
    }
    return [{ type: 'feint', judge: feintJudge }]
  }

  //「移動」実行
  move(position: Position) {
    this.state.actor.position = position
  }

  //「待機」実行
  wait() {
    // 状態変更なし
  }

  // 朦朧状態からの「回復」実行 (stunned な状態のターン開始時に自動実行される)
  recovery(): ActionResult[] {
    const recoveryJudge = judgeRecovery(this.state.actor)
    if (recoveryJudge.success) {
      this.state.actor.health.stunned = false // 回復
    }
    return [{ type: 'recovery', judge: recoveryJudge }]
  }
}
