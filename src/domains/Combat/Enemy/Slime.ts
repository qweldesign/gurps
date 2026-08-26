// Combat/Enemy/Slime.ts

import { type CombatUnitModel } from '../Unit'
import { type EnemyParams, type EnemyEquips, type EnemyDef } from './Base'

// スライムの汎用的パラメータ
const SLIME_PARAMS: EnemyParams = {
  maxHp: 4, // 最大Hp 大きさ・ランクが増えるごとに+2
  dmgMod: 0, // ダメージ修正 この値は直接使用しないが, (大)は+1
  level: 12, // 技能値 ランクが増えるごとに+1 (中),(大)は-1
  ev: 10, // 回避値 (よけ) 大きさが増えるごとに-1
  pre: 8, // 身体的な抵抗値 大きさが増えるごとに+1
  mre: 10, // 精神的な抵抗値 一律
  dmgBuff: 0, //「怪力」端数 (バフ初期値) (中)は+1
  evBuff: 0, //「運動」端数 (バフ初期値) (中)は+1
  creatureType: 'slime' // 生物種別
}

// スライムの攻撃
const SLIME_ATTACK = {
  name: '溶解液', dmgName: '刺', dmgDice: 1, dmgMod: 0, dmgType: 2, level: 12, ev: 0, ready: 0,
  isChain: false, isTwoHanded: false, isPole: false, isMissile: false, isShield: false
}

// スライムの防御
const SLIME_DEFENSE = {
  name: 'ゼリー', sdr: 0, tdr: 0, dr: '0', wt: 0
}

// スライムの大きさ
export const SLIME_SIZES = [2, 1, 0] as const

// 大きさ (size) とランク (rank) を指定してスライムを生成
export function makeSlime(size: typeof SLIME_SIZES[number], rank: number): Omit<CombatUnitModel, 'id'> {
  // 攻撃パラメータの演算 (大きい個体は技能値が下がり, ダメージが上がる)
  const level = SLIME_PARAMS.level + (size === 0 ? 0 : -1) + rank
  const attack = { ...SLIME_ATTACK, dmgMod: size === 2 ? 0 : - 1, level }
  
  // ランダムで決定する pre / ev の振り幅
  const mod = Math.floor(Math.random() * 2) // 0 | 1
  
  return {
    name: size === 2  ? 'スライム(大)' : size === 1 ? 'スライム(中)' : 'スライム(小)',
    maxHp: SLIME_PARAMS.maxHp + (size + rank) * 2,
    attacks: {
      main: attack, sub: attack, spare: attack, shield: attack
    },
    defenses: {
      body: SLIME_DEFENSE, head: SLIME_DEFENSE, arm: SLIME_DEFENSE, leg: SLIME_DEFENSE
    },
    ev: SLIME_PARAMS.ev - (size + mod),
    pre: SLIME_PARAMS.pre + (size + mod),
    mre: SLIME_PARAMS.mre,
    dmgBuff: SLIME_PARAMS.dmgBuff + size % 2,
    evBuff: SLIME_PARAMS.evBuff + size % 2,
    spells: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 },
    tactic: 'slime',
    creatureType: SLIME_PARAMS.creatureType
  }
}

// 錬金術師の汎用的パラメータ
const ALCHEMIST_PARAMS: EnemyParams = {
  maxHp: 12,
  dmgMod: -2,
  level: 13,
  ev: 10,
  pre: 8,
  mre: 12,
  dmgBuff: 0,
  evBuff: 0,
  creatureType: 'normal' // 生物種別
}

// 錬金術師の装備
const ALCHEMIST_EQUIPS: EnemyEquips = {
  mainKey: '杖', spareKey: null, shieldKey: null, armorKey: '革服'
}

const ALCHEMIST_TACTIC = 'earthMetalSpell'

export const ALCHEMIST_UNIT_DEF: EnemyDef = {
  name: '錬金術師',
  params: ALCHEMIST_PARAMS,
  equips: ALCHEMIST_EQUIPS,
  tactic: ALCHEMIST_TACTIC
}
