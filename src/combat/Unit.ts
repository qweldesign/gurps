// Unit.ts

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
  combatId: number
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
  public combatId: number
  public id: number
  public name: string
  public maxHP: number
  private attacks: CombatAttackModel[]
  private defenses: CombatDefenseModel[]
  private ev: number
  private pre: number
  private mre: number
  public order: number
  public side: 'player' | 'enemy'
  public position: 'back' | 'left' | 'center' | 'right'

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
