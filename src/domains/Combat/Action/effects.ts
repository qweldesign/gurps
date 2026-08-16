// Combat/Action/effects.ts

import { CombatState as State } from '../State'
import { type Position, type CombatUnit as Unit } from '../Unit'
import { AIM_OPTIONS, FULL_POWER_OPTIONS, type Aim, type FullPower } from './types'

// 行動実行 (状態変更) を司るクラス / Action.execute から呼び出される
export class ActionEffects {
  private state: State

  constructor(state: State) {
    this.state = state
  }

  //「攻撃」実行 (暫定: コンソール出力のみ)
  attack(aim: Aim, fullPower: FullPower, target: Unit) {
    console.log({ aim: AIM_OPTIONS[aim], fullPower: FULL_POWER_OPTIONS[fullPower], target })
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
