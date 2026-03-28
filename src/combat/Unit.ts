// Unit.ts

import { type AttackKey, type DefanseKey } from '../domains/Equipments'
import { CombatLog as Log } from './Log'
import { type Side, type Position } from './FormationStore'
import { UnitHealth as Health } from './Unit/Health'
import { UnitAttack as Attack } from './Unit/Attack'
import { UnitDefense as Defense } from './Unit/Defense'
import { UnitSummary as Summary } from './Unit/Summary'
import { SPELL_ELEMENTS, type Spells } from './Spells'

const combatIds: number[] = [0, 1, 2, 3, 4, 5, 6, 7] as const

export const POSTURE_KEYS: string[] = ['standing', 'crouching', 'kneeling', 'prone'] as const

export const POSTURE_MODS: Record<Posture, { attackMod: number, defenseMod: number, missileMod: number, label: string }> = {
  'standing': { attackMod: 0, defenseMod: 0, missileMod: 0, label: '直立' },
  'crouching': { attackMod: -2, defenseMod: 0, missileMod: -2, label: '屈み' },
  'kneeling': { attackMod: -2, defenseMod: -2, missileMod: -4, label: '膝着き' },
  'prone': { attackMod: -4, defenseMod: -4, missileMod: -8, label: '這い' }
 } as const

// 戦闘ユニットID
export type CombatId = typeof combatIds[number]

// 姿勢の定義
export type Posture = typeof POSTURE_KEYS[number]

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
  dr: string
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
  dmgBuff: number //「怪力」端数 (バフ)
  evBuff: number //「運動」端数 (バフ)
  spells: Spells
}

// 戦闘ユニットを司るクラス
export class CombatUnit {
  public combatId: CombatId
  public id: number
  public name: string
  public maxHP: number
  public order: number
  public side: Side
  public position: Position
  public posture: Posture
  public attack: Attack
  public defense: Defense
  public health: Health
  public summary: Summary
  public spells: Spells
  public spellCast: Spells

  constructor(model: CombatUnitModel, order: number) {
    const { combatId, id, name, maxHP, attacks, defenses, ev, pre, mre, dmgBuff, evBuff, spells } = model
    this.combatId = combatId
    this.id = id
    this.name = name
    this.maxHP = maxHP
    this.order = order
    this.side = combatId < 4 ? 'player' : 'enemy'
    this.position = 'back'
    this.posture = 'standing'
    this.defense = new Defense(this, attacks, defenses, ev, pre, mre)
    this.attack = new Attack(this, attacks, this.defense.changeAttackKey)
    this.health = new Health(this, dmgBuff, evBuff)
    this.summary = new Summary(this)
    this.spells = spells
    this.spellCast = SPELL_ELEMENTS.reduce((acc, element) => {
      acc[element] = 0
      return acc
    }, {} as Spells)
  }

  set history(log: Log) {
    this.summary.history = log
  }

  get history() {
    return this.summary.history
  }
}
