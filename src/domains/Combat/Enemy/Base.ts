// Combat/Enemy/Base.ts

import { WEAPONS, ARMORS, getDmg, getDmgName, type WeaponKey, type BodyArmorKey, type Weapon, type Armor } from '../../Equipments'
import { type CombatAttackModel, type CombatAttackModels, type CombatDefenseModel, type CombatDefenseModels, type CombatUnitModel, type CreatureType } from '../Unit'
import { type TacticKey } from '../AI/types'

// 敵生成時の基本パラメータ
export type EnemyParams = {
  maxHp: number // 最大Hp
  dmgMod: number // ダメージ修正
  level: number // 技能値
  ev: number // 回避値 (よけ)
  pre: number // 身体的な抵抗値
  mre: number // 精神的な抵抗値
  dmgBuff: number //「怪力」端数 (バフ初期値)
  evBuff: number //「運動」端数 (バフ初期値)
  creatureType: CreatureType // 生物種別
}

// 敵生成時の装備
export type EnemyEquips = {
  mainKey: WeaponKey // 主武器
  spareKey: WeaponKey | null // 予備武器 (弓使いの狂戦士状態時に使用)
  shieldKey: WeaponKey | null // 盾
  armorKey: BodyArmorKey // 防具
}

export type EnemyDef = {
  name: string
  params: EnemyParams
  equips: EnemyEquips
  tactic: TacticKey
}

export type EnemyFormationDef = {
  members: EnemyDef[]
  rewardCp: number
  rewardGold: number
}

// ID, 名前, 基本パラメータ, 装備, 法術技能, 自動行動タイプを引数に取って, 敵を生成
export function makeCombatEnemyModel(id: number, name: string, params: EnemyParams, equips: EnemyEquips, tactic: TacticKey): CombatUnitModel {
  return {
    id,
    name,
    maxHp: params.maxHp,
    attacks: makeAttacks(equips.mainKey, params.dmgMod, params.level, equips.shieldKey, equips.spareKey),
    defenses: makeDefenses(equips.armorKey),
    ev: params.ev,
    pre: params.pre,
    mre: params.mre,
    dmgBuff: params.dmgBuff,
    evBuff: params.evBuff,
    spells: {
      wood: params.level, fire: params.level, earth: params.level, metal: params.level, water: params.level
    }, // 五行全てに技能値を適用するが, 自動行動タイプで使用・不使用を制御
    tactic,
    creatureType: params.creatureType
  }
}

// ランク (0～3) に応じたパラメータバフ
// パラメータは乱数で少しの程度幅を持たせる
export function makeParamsByRank(params: EnemyParams, rank: number): EnemyParams {
  const r1 = Math.floor(Math.random() * 2) // Hp, pre
  const r2 = Math.floor(Math.random() * 2) // dmgMod, dmgBuff
  const r3 = Math.floor(Math.random() * 2) // level, ev, evBUff

  return {
    maxHp: params.maxHp + (rank + r1) * 2,
    dmgMod: params.dmgMod + Math.floor((rank + r2) / 2),
    level: params.level + (rank + r3),
    ev: params.ev + Math.floor((rank + r3) / 2),
    pre: params.pre + Math.floor((rank + r1) / 2),
    mre: params.mre + Math.floor(rank / 2),
    dmgBuff: params.dmgBuff + (rank + r2) % 2,
    evBuff: params.evBuff + (rank + r3) % 2,
    creatureType: params.creatureType
  }
}

// CombatAttackModels を取得
function makeAttacks(mainKey: WeaponKey, dmgMod: number, level: number, shieldKey: WeaponKey | null, spareKey: WeaponKey | null): CombatAttackModels {
  const mainWeapon: Weapon = WEAPONS[mainKey]
  const spareWeapon: Weapon | null = spareKey ? WEAPONS[spareKey] : null
  const shield: Weapon | null = shieldKey ? WEAPONS[shieldKey] : null

  const emptyAttack: CombatAttackModel = {
    name: '装備無し', dmgName: '', dmgDice: 1, dmgMod: -4, dmgType: 0, level: 0, ev: 0, ready: 0,
    isChain: false, isTwoHanded: false, isPole: false, isMissile: false, isShield: false
  }
  const mainAttack: CombatAttackModel = makeAttack(mainWeapon, dmgMod, level)
  const spareAttack: CombatAttackModel = spareWeapon ? makeAttack(spareWeapon, dmgMod, level) : emptyAttack
  const shieldAttack: CombatAttackModel = shield ? makeAttack(shield, dmgMod, level) : emptyAttack
  
  return {
    main: mainAttack,
    sub: emptyAttack,
    spare: spareAttack,
    shield: shieldAttack
  }
}

// CombatAttackModel を取得
function makeAttack(weapon: Weapon, dmgMod: number, level: number): CombatAttackModel {
  return {
    name: weapon.name,
    dmgName: getDmgName(weapon, true, dmgMod),
    dmgDice: getDmg(weapon, true, dmgMod).dice,
    dmgMod: getDmg(weapon, true, dmgMod).mod,
    dmgType: getDmg(weapon, true, dmgMod).type,
    level,
    ev: weapon.ev,
    ready: weapon.ready,
    isChain: weapon.weaponType === 2 ? true : false,
    isPole: weapon.weaponType === 4 ? true : false,
    isTwoHanded: (weapon.weaponType === 3 || weapon.weaponType === 4 || weapon.weaponType === 5) ? true : false,
    isMissile: weapon.weaponType === 5 ? true : false,
    isShield: weapon.weaponType === 6 ? true : false
  }
}

// CombatDefenseModels を取得
function makeDefenses(key: BodyArmorKey): CombatDefenseModels {
  const armor = ARMORS[key]

  const {
    name: [bodyArmor, headArmor, armArmor, legArmor],
    dr, sdr, tdr, wt, replace
  } = armor

  const replaceArmor = replace ?? '装備無し'
  const replaceData = ARMORS[replaceArmor]

  return {
    body: makeDefense(bodyArmor, 0, dr, sdr, tdr, wt, replaceData),
    head: makeDefense(headArmor, 1, dr, sdr, tdr, wt, replaceData),
    arm: makeDefense(armArmor, 2, dr, sdr, tdr, wt, replaceData),
    leg: makeDefense(legArmor, 3, dr, sdr, tdr, wt, replaceData)
  }
}

// CombatDefenseModel を取得
function makeDefense(armorName: string | null, slot: number, dr: string, sdr: number, tdr: number, wt: number, replaceData: Armor): CombatDefenseModel {
  const name = armorName ?? replaceData.name[slot]! // '装備無し'は null を取らない
  dr = armorName ? dr : replaceData.dr
  sdr = armorName ? sdr : replaceData.sdr
  tdr = armorName ? tdr : replaceData.tdr
  wt = armorName ? wt : replaceData.wt
  return {
    name, dr, sdr, tdr, wt
  }
}
