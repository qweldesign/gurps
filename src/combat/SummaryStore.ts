// SummaryStore.ts

import { CombatCore as Core } from './Core'
import { CombatUnit as Unit } from './Unit'
import { UnitSummary as Summary } from './Unit/Summary'

export class CombatSummaryStore {
  public actor: Unit
  public summaries: Summary[]

  constructor(actor: Unit, core: Core) {
    this.actor = actor
    this.summaries = []
    core.units.forEach(unit => {
      this.summaries.push(unit.summary)
    })
  }
}
