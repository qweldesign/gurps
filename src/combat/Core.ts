// Core.ts

import { type CombatUnitModel as Model, CombatUnit as Unit } from './Unit'
import { CombatFormationStore as FormationStore } from './FormationStore'

export class CombatCore {
  public round: number // 経過時間
  public turnIndex: number // 行動順
  public units: Unit[]
  public formationStore: FormationStore

  constructor(models: Model[]) {
    this.round = 0
    this.turnIndex = 0
    this.units = models.map((model, i) => {
      return new Unit(model, i)
    })
    this.formationStore = new FormationStore(this.units[this.turnIndex], this.units)
  }

  nextTurn() {
    this.turnIndex++
    if (this.turnIndex === this.units.length) {
      this.round++
      this.turnIndex %= this.units.length
    }
  }

  debug() {
    const { round, turnIndex, units, formationStore } = this
    console.log({ round, turnIndex, units, formationStore })
  }
}
