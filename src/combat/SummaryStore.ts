// SummaryStore.ts

import { CombatCore as Core } from './Core'
import { CombatUnit as Unit } from './Unit'
import { CombatLog as Log } from './Log'
import { UnitSummary as Summary } from './Unit/Summary'

export class CombatSummaryStore {
  public actor: Unit
  public summaries: Summary[]

  constructor(actor: Unit, core: Core, log: Log | null = null) {
    this.actor = actor
    this.summaries = []
    core.units.forEach(unit => {
      this.summaries.push(unit.summary)
    })
    // 開幕時のみ log = null
    if (log) {
      // 前行動者の行動履歴を更新
      const prevActor = core.units[(core.turnIndex + core.units.length - 1) % core.units.length]
      prevActor.history = log
    }
  }
}
