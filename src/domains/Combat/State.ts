// Combat/State.ts

import { type CombatUnitModel as Model, CombatUnit as Unit } from './Unit'
import { CombatFormationStore as FormationStore } from './Stores/FormationStore'

// 全ての情報を集約・管理するクラス
export class CombatState {
  public round: number // 経過時間
  public turnIndex: number // 行動順
  public units: Unit[]
  public formationStore: FormationStore | null

  constructor(models: Model[]) {
    this.round = 1 // 1からカウント
    this.turnIndex = -1 // 開幕前は -1, 開幕と同時に 0 になる
    this.units = models.map((model, i) => {
      return new Unit(model, i + 1) // combatIdは1からカウント
    })
    this.formationStore = null
  }

  get actor() {
    return this.units[this.turnIndex]
  }

  // 次のターンへ進む
  async nextTurn() {
    this.turnIndex++
    if (this.turnIndex === this.units.length) {
      this.round++
      this.turnIndex %= this.units.length
    }
    this.formationStore = new FormationStore(this.actor, this.units)
  }

  debug() {
    const { round, turnIndex, units } = this
    console.log({ round, turnIndex, units })
  }
}
