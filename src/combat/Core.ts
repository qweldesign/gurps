// Core.ts

import { type CombatUnitModel as Model, CombatUnit as Unit } from './Unit'
import { CombatFormationStore as FormationStore } from './FormationStore'
import { CombatActionStore as ActionStore } from './ActionStore'
import { CombatSummaryStore as SummaryStore } from './SummaryStore'

export class CombatCore {
  public round: number // 経過時間
  public turnIndex: number // 行動順
  public units: Unit[]
  public actor: Unit
  public formationStore: FormationStore
  public actionStore: ActionStore
  public summaryStore: SummaryStore

  constructor(models: Model[]) {
    this.round = 0
    this.turnIndex = 0
    this.units = models.map((model, i) => {
      return new Unit(model, i)
    })
    this.actor = this.units[this.turnIndex]
    this.formationStore = new FormationStore(this.actor, this.units)
    this.actionStore = new ActionStore(this.actor, this)
    this.summaryStore = new SummaryStore(this.actor, this)
  }

  nextTurn() {
    this.turnIndex++
    if (this.turnIndex === this.units.length) {
      this.round++
      this.turnIndex %= this.units.length
    }
    this.actor = this.units[this.turnIndex]
    this.formationStore = new FormationStore(this.units[this.turnIndex], this.units)
    this.actionStore = new ActionStore(this.units[this.turnIndex], this)
    this.summaryStore = new SummaryStore(this.units[this.turnIndex], this)
  }

  debug() {
    const { round, turnIndex, units, formationStore } = this
    console.log({ round, turnIndex, units, formationStore })
  }
}
