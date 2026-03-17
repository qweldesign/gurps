// Unit.ts

import { type Side, type Position } from './FormationStore'

const combatIds = [0, 1, 2, 3, 4, 5, 6, 7]

export type CombatId = typeof combatIds[number]

export type CombatAttackModel = {
  name: string
  dmgName: string
  dmgDice: number
  dmgMod: number
  dmgType: number
  lv: number
  ev: number
  ready: number
  isMissile: boolean
}

export type CombatDefenseModel = {
  name: string
  sdr: number
  tdr: number
  wt: number
}

export type CombatUnitModel = {
  combatId: CombatId
  id: number
  name: string
  maxHP: number
  attacks: CombatAttackModel[]
  defenses: CombatDefenseModel[]
  ev: number
  pre: number
  mre: number
}

export class CombatUnit {
  public combatId: CombatId
  public id: number
  public name: string
  public maxHP: number
  private attacks: CombatAttackModel[]
  private defenses: CombatDefenseModel[]
  private ev: number
  private pre: number
  private mre: number
  public order: number
  public side: Side
  public position: Position

  constructor(model: CombatUnitModel, order: number) {
    const { combatId, id, name, maxHP, attacks, defenses, ev, pre, mre } = model
    this.combatId = combatId
    this.id = id
    this.name = name
    this.maxHP = maxHP
    this.attacks = attacks
    this.defenses = defenses
    this.ev = ev
    this.pre = pre
    this.mre = mre
    this.order = order
    this.side = combatId < 4 ? 'player' : 'enemy'
    this.position = 'back'
  }
}
