// Combat/Unit.ts

const combatIds: number[] = [1, 2, 3, 4, 5, 6, 7, 8] as const

export const SIDE_KEYS = ['player', 'enemy'] as const

export const POSITION_KEYS = ['back', 'left', 'center', 'right'] as const

// 戦闘ユニットID
export type CombatId = typeof combatIds[number]

// 戦闘ユニットの所属
export type Side = typeof SIDE_KEYS[number]

// 戦闘ユニットの配置
export type Position = typeof POSITION_KEYS[number]

// 戦闘ユニットのモデル
export type CombatUnitModel = {
  id: number
  name: string
  maxHp: number
  ev: number
  pre: number
  mre: number
}

// 戦闘ユニットを司るクラス
export class CombatUnit {
  public combatId: CombatId
  public id: number
  public name: string
  public side: Side
  public position: Position

  constructor(model: CombatUnitModel, combatId: CombatId) {
    const { id, name } = model
    this.combatId = combatId
    this.id = id
    this.name = name
    this.side = combatId <= 4 ? 'player' : 'enemy'
    this.position = 'back'
  }
}
