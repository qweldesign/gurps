// Combat/Unit.ts

import { type WeaponSlotKey, type ArmorSlotKey } from '../Equipments'
import { CombatUnitAttack as Attack, type CombatUnitAttackSnapshot as AttackSnapshot } from './Unit/Attack'
import { CombatUnitDefense as Defense, type CombatUnitDefenseSnapshot as DefenseSnapshot } from './Unit/Defense'
import { CombatUnitHealth as Health, type CombatUnitHealthSnapshot as HealthSnapshot } from './Unit/Health'
import { CombatUnitStatusBuff as StatusBuff, type CombatUnitStatusBuffSnapshot as StatusBuffSnapshot } from './Unit/StatusBuff'
import { CombatUnitStatusEffects as StatusEffects, type CombatUnitStatusEffectsSnapshot as StatusEffectsSnapshot } from './Unit/StatusEffects'
import { SPELL_ELEMENTS, type Spells } from './Spells'
import { type CombatLog as Log } from './Log'
import { type TacticKey } from './AI/types'

const combatIds: number[] = [1, 2, 3, 4, 5, 6, 7, 8] as const

export const SIDE_KEYS = ['player', 'enemy'] as const

export const POSITION_KEYS = ['back', 'left', 'center', 'right'] as const

export const POSTURE_KEYS: string[] = ['standing', 'crouching', 'kneeling', 'prone'] as const

export const CREATURE_TYPE_KEYS = ['normal', 'undead', 'slime'] as const

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

// 防御モデルの生物種別 (通常/アンデッド/スライム. ダメージ判定・状態異常耐性に影響する. Unit/Defense.ts, Action/types.ts の getDmgRate 参照)
export type CreatureType = typeof CREATURE_TYPE_KEYS[number]

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
  isTwoHanded: boolean
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
  tactic?: TacticKey // 自動行動タイプ (敵 (NPC) のみ. 未指定の場合は自動行動せず, プレイヤーが操作する通常のユニットとして扱う)
  creatureType?: CreatureType // 生物種別 (未指定は 'normal'. アンデッド/スライムの特殊なダメージ判定・状態異常耐性は Unit/Defense.ts で保持する)
}

// 「時間遡行」用のユニット全体のスナップショット
export type CombatUnitSnapshot = {
  position: Position
  posture: Posture
  spellCast: Spells
  healUses: Partial<Record<string, number>>
  aiFrontCommitted: boolean
  attack: AttackSnapshot
  defense: DefenseSnapshot
  health: HealthSnapshot
  statusBuff: StatusBuffSnapshot
  statusEffects: StatusEffectsSnapshot
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
  public tactic: TacticKey | null // 自動行動タイプ (敵 (NPC) のみ. null の場合は自動行動しない (プレイヤーが操作する))
  public aiFrontCommitted: boolean // AI行動用: 前衛への恒久コミット (術戦士B が前衛の味方1人時に前に出た場合等, 一度成立すると以降解除されない)

  constructor(model: CombatUnitModel, combatId: CombatId) {
    const { id, name, maxHp, attacks, defenses, ev, pre, mre, dmgBuff, evBuff, spells, tactic, creatureType } = model
    this.combatId = combatId
    this.id = id
    this.name = name
    this.side = combatId <= 4 ? 'player' : 'enemy'
    this.tactic = tactic ?? null
    this.position = 'back'
    this.posture = 'standing'
    this.defense = new Defense(this, attacks, defenses, ev, pre, mre, creatureType ?? 'normal')
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
    this.aiFrontCommitted = false
  }

  // Summary 表示用ラベル取得 (状態 → 状態異常 → バフの優先順で, 該当する最初のものを返す)
  get label(): string {
    return this.health.label || this.statusEffects.label || this.statusBuff.label
  }

  // 「時間遡行」用: 現在の可変状態のスナップショットを取得する (history は対象外. ターン開始前には更新されないため)
  getSnapshot(): CombatUnitSnapshot {
    return {
      position: this.position,
      posture: this.posture,
      spellCast: { ...this.spellCast },
      healUses: { ...this.healUses },
      aiFrontCommitted: this.aiFrontCommitted,
      attack: this.attack.getSnapshot(),
      defense: this.defense.getSnapshot(),
      health: this.health.getSnapshot(),
      statusBuff: this.statusBuff.getSnapshot(),
      statusEffects: this.statusEffects.getSnapshot()
    }
  }

  // 「時間遡行」用: スナップショットの状態へ復元する
  restoreSnapshot(snapshot: CombatUnitSnapshot) {
    this.position = snapshot.position
    this.posture = snapshot.posture
    this.spellCast = { ...snapshot.spellCast }
    this.healUses = { ...snapshot.healUses }
    this.aiFrontCommitted = snapshot.aiFrontCommitted
    this.attack.restoreSnapshot(snapshot.attack)
    this.defense.restoreSnapshot(snapshot.defense)
    this.health.restoreSnapshot(snapshot.health)
    this.statusBuff.restoreSnapshot(snapshot.statusBuff)
    this.statusEffects.restoreSnapshot(snapshot.statusEffects)
  }
}
