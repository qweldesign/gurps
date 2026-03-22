// Summary.ts

import { CombatLog as Log } from '../Log'
import { CombatUnit as Unit } from '../Unit'
import { UnitHealth as Health } from './Health'

export class UnitSummary {
  public unit: Unit
  public name: string
  public maxHP: number
  public health: Health
  public condition: 'good' | 'bad' | 'worse' | 'worst'
  private logs: Log[]

  constructor(unit: Unit) {
    this.unit = unit
    this.name = unit.name
    this.maxHP = unit.maxHP
    this.health = unit.health
    this.condition = 'good'
    this.logs = []
  }

  get HP() {
    return this.maxHP - this.health.injury
  }

  set history(log: Log) {
    this.logs.unshift(log)
  }

  get history() {
    return this.logs[0]
  }
}
