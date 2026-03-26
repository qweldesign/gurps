// Summary.ts

import { CombatLog as Log } from '../Log'
import { CombatUnit as Unit } from '../Unit'
import { UnitHealth as Health } from './Health'

export class UnitSummary {
  public self: Unit
  public name: string
  public maxHP: number
  public health: Health
  private logs: Log[]

  constructor(self: Unit) {
    this.self = self
    this.name = self.name
    this.maxHP = self.maxHP
    this.health = self.health
    this.logs = []
  }

  get HP() {
    return Math.max(this.maxHP - this.health.injury, 0)
  }

  get condition() {
    const ratio = this.HP / this.maxHP
    if (ratio === 0) return 'unconscious'
    else if (ratio < 1 / 3 || this.health.stunned) return 'stunned'
    else if (ratio < 2 / 3) return 'injured'
    else return 'normal'
  }

  get conditionLabel() {
    return this.health.label ?? ''
  }

  set history(log: Log) {
    this.logs.unshift(log)
  }

  get history() {
    return this.logs[0]
  }
}
