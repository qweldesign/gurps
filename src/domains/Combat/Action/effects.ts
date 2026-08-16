// Combat/Action/effects.ts

import { CombatState as State } from '../State'
import { type Position, type CombatUnit as Unit } from '../Unit'
import { type Aim, type FullPower, type ActionResult } from './types'
import { judgeAttack, judgeDefense, rollDmg } from './resolver'

// 行動実行 (状態変更) を司るクラス / Action.execute から呼び出される
export class ActionEffects {
  private state: State

  constructor(state: State) {
    this.state = state
  }

  //「攻撃」実行 (暫定: 判定結果を返すのみ. ダメージ効果 (HP減少) の実装は未着手)
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
      if (defenseJudge.success) return results // 防御成功時はここで処理を止める
    }

    // ダメージ判定
    const dmgJudge = rollDmg(actor, aim, fullPower, target)
    results.push({ type: 'dmg', judge: dmgJudge })

    //
    // ダメージ効果の実装 (未着手)
    //

    return results
  }

  //「移動」実行
  move(position: Position) {
    this.state.actor.position = position
  }

  //「待機」実行
  wait() {
    // 状態変更なし
  }
}
