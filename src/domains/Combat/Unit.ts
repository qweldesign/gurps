// Combat/Unit.ts

import { type WeaponSlotKey, type ArmorSlotKey } from '../Equipments'
import { CombatUnitAttack as Attack } from './Unit/Attack'
import { CombatUnitDefense as Defense } from './Unit/Defense'
import { CombatUnitHealth as Health } from './Unit/Health'
import { CombatUnitStatusBuff as StatusBuff } from './Unit/StatusBuff'
import { CombatUnitStatusEffects as StatusEffects } from './Unit/StatusEffects'
import { SPELL_ELEMENTS, type Spells } from './Spells'
import { type CombatLog as Log } from './Log'

const combatIds: number[] = [1, 2, 3, 4, 5, 6, 7, 8] as const

export const SIDE_KEYS = ['player', 'enemy'] as const

export const POSITION_KEYS = ['back', 'left', 'center', 'right'] as const

export const POSTURE_KEYS: string[] = ['standing', 'crouching', 'kneeling', 'prone'] as const

export const POSTURE_MODS: Record<Posture, { attackMod: number, defenseMod: number, missileMod: number, label: string }> = {
  'standing': { attackMod: 0, defenseMod: 0, missileMod: 0, label: '直立' },
  'crouching': { attackMod: -2, defenseMod: 0, missileMod: -2, label: '屈み' },
  'kneeling': { attackMod: -2, defenseMod: -2, missileMod: -4, label: '膝着き' },
  'prone': { attackMod: -4, defenseMod: -4, missileMod: -8, label: '這い' }
} as const

// 戦闘ユニットID
export type CombatId = typeof combatIds[number]

// 戦闘ユニットの所属
export type Side = typeof SIDE_KEYS[number]

// 戦闘ユニットの配置
export type Position = typeof POSITION_KEYS[number]

// 戦闘ユニットの姿勢
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
export type CombatAttackModels = Record<WeaponSlotKey, CombatAttackModel>

// 防御部位の定義
export type CombatDefenseModel = {
  name: string
  dr: string
  sdr: number
  tdr: number
  wt: number
}

// 総防御部位の定義
export type CombatDefenseModels = Record<ArmorSlotKey, CombatDefenseModel>

// 戦闘ユニットのモデル
export type CombatUnitModel = {
  id: number
  name: string
  maxHp: number
  attacks: CombatAttackModels
  defenses: CombatDefenseModels
  ev: number
  pre: number
  mre: number
  dmgBuff: number //「怪力」端数 (バフ初期値)
  evBuff: number //「運動」端数 (バフ初期値)
  spells: Spells
}

// 戦闘ユニットを司るクラス
export class CombatUnit {
  public combatId: CombatId
  public id: number
  public name: string
  public side: Side
  public position: Position
  public posture: Posture
  public attack: Attack
  public defense: Defense
  public health: Health
  public statusBuff: StatusBuff
  public statusEffects: StatusEffects
  public spells: Spells
  public spellCast: Spells
  public healUses: Partial<Record<string, number>> // 回復呪文の使用回数管理 (術名をキーとする. 「1戦闘につき」の上限を持つ回復呪文用)
  public history: Log | null // 直近の自ターンの行動ログ (Summary表示用)

  constructor(model: CombatUnitModel, combatId: CombatId) {
    const { id, name, maxHp, attacks, defenses, ev, pre, mre, dmgBuff, evBuff, spells } = model
    this.combatId = combatId
    this.id = id
    this.name = name
    this.side = combatId <= 4 ? 'player' : 'enemy'
    this.position = 'back'
    this.posture = 'standing'
    this.defense = new Defense(this, attacks, defenses, ev, pre, mre)
    this.attack = new Attack(this, attacks, this.defense.changeWeaponSlotKey.bind(this.defense))
    this.health = new Health(this, maxHp)
    this.statusBuff = new StatusBuff(dmgBuff, evBuff)
    this.statusEffects = new StatusEffects()
    this.spells = spells
    this.spellCast = SPELL_ELEMENTS.reduce((acc, element) => {
      acc[element] = 0
      return acc
    }, {} as Spells)
    this.healUses = {}
    this.history = null
  }

  // Summary 表示用ラベル取得 (状態 → 状態異常 → バフの優先順で, 該当する最初のものを返す)
  get label(): string {
    return this.health.label || this.statusEffects.label || this.statusBuff.label
  }
}
