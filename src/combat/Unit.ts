// Unit.ts

import { type AttackKey, type DefanseKey } from '../domains/Equipments'
import { CombatLog as Log } from './Log'
import { type Side, type Position } from './FormationStore'
import { UnitHealth as Health } from './Unit/Health'
import { UnitSummary as Summary } from './Unit/Summary'

const combatIds = [0, 1, 2, 3, 4, 5, 6, 7]

export type CombatId = typeof combatIds[number]

// 攻撃手段の定義
export type CombatAttackModel = {
  name: string
  dmgName: string
  dmgDice: number
  dmgMod: number
  dmgType: number
  level: number
  ev: number
  ready: number
  isChain: boolean
  isPole: boolean
  isMissile: boolean
  isShield: boolean
}

// 総攻撃手段の定義
export type CombatAttackModels = Record<AttackKey, CombatAttackModel>

// 防御部位の定義
export type CombatDefenseModel = {
  name: string
  sdr: number
  tdr: number
  wt: number
}

// 総防御部位の定義
export type CombatDefenseModels = Record<DefanseKey, CombatDefenseModel>

// 戦闘ユニットのモデル
// Characterクラスのメソッド toCombatUnitModel() でデータ変換
export type CombatUnitModel = {
  combatId: CombatId
  id: number
  name: string
  maxHP: number
  attacks: CombatAttackModels
  defenses: CombatDefenseModels
  ev: number
  pre: number
  mre: number
}

// 戦闘ユニットを司るクラス
export class CombatUnit {
  public combatId: CombatId
  public id: number
  public name: string
  public maxHP: number
  public attacks: CombatAttackModels
  public defenses: CombatDefenseModels
  public ev: number
  public pre: number
  public mre: number
  public order: number
  public side: Side
  public position: Position
  public health: Health
  public summary: Summary

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
    this.health = new Health() // 後の Summary が Health を見るので順序厳守
    this.summary = new Summary(this)
  }

  set history(log: Log) {
    this.summary.history = log
  }

  get history() {
    return this.summary.history
  }
}
