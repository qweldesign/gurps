// SummaryStore.ts

import { CombatState as State } from './State'
import { CombatUnit as Unit } from './Unit'
import { CombatLog as Log } from './Log'
import { UnitSummary as Summary } from './Unit/Summary'

export class CombatSummaryStore {
  public actor: Unit
  public summaries: Summary[]

  constructor(actor: Unit, state: State, log: Log | null = null) {
    this.actor = actor
    this.summaries = []
    state.units.forEach(unit => {
      this.summaries.push(unit.summary)
    })
    // 開幕時のみ log = null
    if (log) {
      // 前行動者の行動履歴を更新
      const prevActor = state.units[(state.turnIndex + state.units.length - 1) % state.units.length]
      prevActor.history = log
    }
  }
}
