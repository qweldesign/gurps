// SummaryStore.ts

import { CombatState as State } from './State'
import { CombatUnit as Unit } from './Unit'
import { CombatLog as Log } from './Log'
import { UnitSummary as Summary } from './Unit/Summary'

// ユニット全員の概要表示を司るクラス / Summaryコンポーネントに対応
export class CombatSummaryStore {
  public actor: Unit // CSSマーク用
  public summaries: Summary[]

  constructor(actor: Unit, state: State) {
    this.actor = actor
    this.summaries = []
    state.units.forEach(unit => {
      this.summaries.push(unit.summary)
    })
  }

  // ターン毎に更新
  update(actor: Unit, state: State, log: Log) {
    this.actor = actor
    this.summaries = []
    state.units.forEach(unit => {
      this.summaries.push(unit.summary)
    })
    // 前行動者の行動履歴を更新
    const prevActor = state.units[(state.turnIndex + state.units.length - 1) % state.units.length]
    prevActor.history = log
  }
}
