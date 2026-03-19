// FormationStore.ts

import { CombatUnit as Unit } from './Unit'

export const SIDE_VALUES = ['player', 'enemy'] as const
export const POSITION_VALUES = ['back', 'left', 'center', 'right'] as const

export type Side = typeof SIDE_VALUES[number]
export type Position = typeof POSITION_VALUES[number]

export const BACK_VALUES = { player: [0, 1, 2, 3], enemy: [4, 5, 6, 7] } as const
export const FRONT_VALUES: Position[] = ['left', 'center', 'right'] as const

type BackFormation = Record<number, Unit | null>
type FrontFormation = Record<Position, Unit | null>
type Formation = { back: BackFormation, front: FrontFormation }

export class CombatFormationStore {
  public actor: Unit
  private back: Map<number, Unit | null>
  private front: Map<string, Unit | null>

  constructor(actor: Unit, units: Unit[]) {
    this.actor = actor
    // Back 初期化
    this.back = new Map<number, Unit | null>()
    units.forEach((unit, i) => {
      this.back.set(i, unit)
    })
    // Front 初期化
    this.front = new Map<string, Unit | null>()
    SIDE_VALUES.forEach(side => {
      POSITION_VALUES.slice(1).forEach(position => {
        this.front.set(`${side}-${position}`, null)
      })
    })
    // 更新
    this.update(units)
  }

  update(units: Unit[]) {
    units.forEach((unit, i) => {
      if (unit.position === 'back') {
        this.back.set(i, unit)
      } else {
        this.back.set(i, null)
        this.front.set(`${unit.side}-${unit.position}`, unit)
      }
    })
  }

  getFormation(side: Side): { back: BackFormation, front: FrontFormation } {
    const back = BACK_VALUES[side].reduce<BackFormation>((acc, value) => {
      acc[value] = this.back.get(value) ?? null
      return acc
    }, {} as BackFormation)

    const front = FRONT_VALUES.reduce<FrontFormation>((acc, pos) => {
      acc[pos] = this.front.get(`${side}-${pos}`) ?? null
      return acc
    }, {} as FrontFormation)

    return {
      back, front
    }
  }

  get player(): Formation {
    return this.getFormation('player')
  }

  get enemy(): Formation {
    return this.getFormation('enemy')
  }
}
