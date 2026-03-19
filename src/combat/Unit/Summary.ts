// Summary.ts

import { type ActionLog } from '../ActionStore'
import { CombatUnit as Unit } from '../Unit'
import { UnitHealth as Health } from './Health'

export class UnitSummary {
  public unit: Unit
  public name: string
  public maxHP: number
  public health: Health
  public condition: 'good' | 'bad' | 'worse' | 'worst'

  constructor(unit: Unit) {
    this.unit = unit
    this.name = unit.name
    this.maxHP = unit.maxHP
    this.health = unit.health
    this.condition = 'good'
  }

  get HP() {
    return this.maxHP - this.health.injury
  }
}
