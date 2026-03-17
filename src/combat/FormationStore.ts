// FormationStore.ts

import { CombatUnit as Unit } from './Unit'

const SIDE_VALUES = ['player', 'enemy'] as const
const POSITION_VALUES = ['back', 'left', 'center', 'right'] as const

export type Side = typeof SIDE_VALUES[number]
export type Position = typeof POSITION_VALUES[number]

export class CombatFormationStore {
  public actor: Unit
  public back: Map<number, string>
  public front: Map<string, string>

  constructor(actor: Unit, units: Unit[]) {
    this.actor = actor
    // Back 初期化
    this.back = new Map<number, string>()
    units.forEach((unit, i) => {
      this.back.set(i, unit.name)
    })
    // Front 初期化
    this.front = new Map<string, string>()
    SIDE_VALUES.forEach(side => {
      POSITION_VALUES.slice(1).forEach(position => {
        this.front.set(`${side}-${position}`, '')
      })
    })
    // 更新
    this.update(units)
  }

  update(units: Unit[]) {
    units.forEach((unit, i) => {
      if (unit.position === 'back') {
        this.back.set(i, unit.name)
      } else {
        this.back.set(i, '')
        this.front.set(`${unit.side}-${unit.position}`, unit.name)
      }
    })
  }
}
