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

  //「準備」実行
  ready(): ActionResult[] {
    this.state.actor.attack.ready--
    return []
  }

  //「攻撃」実行 (全力攻撃オプションに応じて,「牽制即攻撃」「2回攻撃」へ処理を振り分ける)
  attack(aim: Aim, fullPower: FullPower, target: Unit): ActionResult[] {
    const actor = this.state.actor
    const results: ActionResult[] = []

    // 全力攻撃オプション選択時, 自身は次の自分のターンまで能動防御 (受け・止め・よけ) が行えなくなる
    // (Defense.canParry/canBlock/canDodge が参照する isFullAttack は, isFullAttackTurn から次ターンの Defense.nextTurn() で引き継がれる)
    if (fullPower !== 'none') actor.defense.isFullAttackTurn = true

    if (fullPower === 'feint') {
      // 全力攻撃オプション「牽制即攻撃」: 牽制を即座に適用した上で, そのまま攻撃する
      results.push(...this.feint(target, true))
      results.push(...this.attackRoutine(aim, fullPower, target))
    } else if (fullPower === 'double') {
      // 全力攻撃オプション「2回攻撃」: 対象が気絶しなければ, 続けてもう一度攻撃する
      results.push(...this.attackRoutine(aim, fullPower, target))
      if (!target.health.unconscious) {
        results.push(...this.attackRoutine(aim, fullPower, target))
      }
    } else {
      // 通常攻撃, および全力攻撃オプション「ダメージ安定」「技能値+4」(既に resolver/Attack 側で反映済み)
      results.push(...this.attackRoutine(aim, fullPower, target))
    }

    return results
  }

  // 攻撃1回分の判定・効果適用 (判定結果に基づき, HPへのダメージ反映と朦朧・転倒・気絶・死亡までを処理する)
  private attackRoutine(aim: Aim, fullPower: FullPower, target: Unit): ActionResult[] {
    const results: ActionResult[] = []
    const actor = this.state.actor

    // 攻撃判定
    const attackJudge = judgeAttack(actor, aim, fullPower, target)
    // 武器の準備状態を更新 (準備の要る武器の場合, 攻撃後は非準備状態になる)
    actor.attack.ready = actor.attack.model.ready
    results.push({ type: 'attack', judge: { ...attackJudge, ready: actor.attack.ready === 0 } })
    if (!attackJudge.success) return results // 攻撃失敗時はここで処理を止める

    // 防御判定 (攻撃判定がクリティカルか, 対象がいかなる防御も行えない (自身が全力攻撃選択中など) 場合はスキップ)
    const canDefend = target.defense.getCanBlock(aim) || target.defense.canParry || target.defense.canDodge
    if (!attackJudge.critical && canDefend) {
      const defenseJudge = judgeDefense(actor, aim, target)

      // 能動防御の試行回数を加算 (「受け」「止め」はターンにつき通常1回, 全力防御時は2回まで. Defense.canParry/canBlock が参照する)
      // 「受け」の場合のみ, 武器の準備状態も更新する (準備の要る武器の場合, 受けの後は非準備状態になる)
      let ready = true
      if (defenseJudge.defenseType === 'parry') {
        target.defense.parryCount++
        target.attack.ready = target.attack.model.ready
        ready = target.attack.ready === 0
      } else if (defenseJudge.defenseType === 'block') {
        target.defense.blockCount++
      }

      results.push({ type: 'defense', judge: { ...defenseJudge, ready } })
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

  //「牽制」実行 (成功時, 次の自分の攻撃 (対象が同じ場合) まで防御目標値の低下効果を持ち越す)
  // isImmediate: true の場合 (全力攻撃オプション「牽制即攻撃」から呼ばれる), 同じ行動内で直後に続く攻撃から即座に適用する
  feint(target: Unit, isImmediate: boolean = false): ActionResult[] {
    const actor = this.state.actor
    const feintJudge = judgeFeint(actor, target)
    if (feintJudge.success) {
      actor.attack.feint = { currentTurn: !isImmediate, target, score: feintJudge.score }
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
