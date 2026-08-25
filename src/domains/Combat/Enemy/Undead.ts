// Combat/Enemy/Undead.ts

import { type EnemyParams, type EnemyEquips, type EnemyDef, type EnemyFormationDef } from './Base'

// 骸の戦士の汎用的パラメータ
const WARRIOR_PARAMS: EnemyParams = {
  maxHp: 20, // 最大Hp
  dmgMod: 1, // ダメージ修正
  level: 13, // 技能値
  ev: 10, // 回避値 (よけ)
  pre: 11, // 身体的な抵抗値
  mre: 13, // 精神的な抵抗値
  dmgBuff: 0, //「怪力」端数 (バフ初期値)
  evBuff: 0, //「運動」端数 (バフ初期値)
  creatureType: 'undead' // 生物種別
}

// 骸の剣士の汎用的パラメータ
const FENCER_PARAMS: EnemyParams = {
  maxHp: 16, // 最大Hp
  dmgMod: 0, // ダメージ修正
  level: 14, // 技能値
  ev: 10, // 回避値 (よけ)
  pre: 10, // 身体的な抵抗値
  mre: 13, // 精神的な抵抗値
  dmgBuff: 0, //「怪力」端数 (バフ初期値)
  evBuff: 0, //「運動」端数 (バフ初期値)
  creatureType: 'undead' // 生物種別
}

// 骸の弓使いの汎用的パラメータ
const ARCHER_PARAMS: EnemyParams = {
  maxHp: 12, // 最大Hp
  dmgMod: 0, // ダメージ修正
  level: 14, // 技能値
  ev: 10, // 回避値 (よけ)
  pre: 10, // 身体的な抵抗値
  mre: 13, // 精神的な抵抗値
  dmgBuff: 0, //「怪力」端数 (バフ初期値)
  evBuff: 0, //「運動」端数 (バフ初期値)
  creatureType: 'undead' // 生物種別
}

// 骸の術士の汎用的パラメータ
const MAGE_PARAMS: EnemyParams = {
  maxHp: 12, // 最大Hp
  dmgMod: 0, // ダメージ修正
  level: 14, // 技能値
  ev: 10, // 回避値 (よけ)
  pre: 10, // 身体的な抵抗値
  mre: 13, // 精神的な抵抗値
  dmgBuff: 0, //「怪力」端数 (バフ初期値)
  evBuff: 0, //「運動」端数 (バフ初期値)
  creatureType: 'undead' // 生物種別
}

// 骸の装備
const EQUIPS_SETS: Record<string, EnemyEquips> = {
  '戦斧': { mainKey: '戦斧', spareKey: null, shieldKey: '中盾', armorKey: 'プレイトメイル' },
  '戦鎚': { mainKey: '戦鎚', spareKey: null, shieldKey: '中盾', armorKey: 'プレイトメイル' },
  '鉾槍': { mainKey: '鉾槍', spareKey: null, shieldKey: null, armorKey: 'プレイトメイル' },
  '細剣': { mainKey: 'レイピア', spareKey: null, shieldKey: '小盾', armorKey: 'チェインメイル' },
  '長剣': { mainKey: 'ロングソード', spareKey: null, shieldKey: '小盾', armorKey: 'チェインメイル' },
  '曲刀': { mainKey: '三日月刀', spareKey: null, shieldKey: '小盾', armorKey: 'チェインメイル' },
  '長弓': { mainKey: '長弓', spareKey: 'レイピア', shieldKey: '小盾', armorKey: '革鎧' },
  '杖': { mainKey: '杖', spareKey: null, shieldKey: null, armorKey: '革鎧' }
}

// 骸の後衛
const BACK: EnemyDef[] = [
  { name: '骸の術士:青杖', params: MAGE_PARAMS, equips: { ...EQUIPS_SETS['杖'] }, tactic: 'woodWaterSpell' },
  { name: '骸の術士:赤杖', params: MAGE_PARAMS, equips: { ...EQUIPS_SETS['杖'] }, tactic: 'fireSpell' },
  { name: '骸の術士:黄杖', params: MAGE_PARAMS, equips: { ...EQUIPS_SETS['杖'] }, tactic: 'earthMetalSpell' },
  { name: '骸の射手:長弓', params: ARCHER_PARAMS, equips: { ...EQUIPS_SETS['長弓'] }, tactic: 'archer' }
]

// 骸の前衛1
const FRONT1: EnemyDef[] = [
  { name: '骸の戦士:戦斧', params: WARRIOR_PARAMS, equips: { ...EQUIPS_SETS['戦斧'] }, tactic: 'heavyWarrior' },
  { name: '骸の戦士:戦鎚', params: WARRIOR_PARAMS, equips: { ...EQUIPS_SETS['戦鎚'] }, tactic: 'heavyWarrior' },
  { name: '骸の戦士:鉾槍', params: WARRIOR_PARAMS, equips: { ...EQUIPS_SETS['鉾槍'] }, tactic: 'heavyWarrior' }
]

// 骸の前衛2
const FRONT2: EnemyDef[] = [
  { name: '骸の剣士:細剣', params: FENCER_PARAMS, equips: { ...EQUIPS_SETS['細剣'] }, tactic: 'lightWarrior' },
  { name: '骸の剣士:長剣', params: FENCER_PARAMS, equips: { ...EQUIPS_SETS['長剣'] }, tactic: 'lightWarrior' },
  { name: '骸の剣士:曲刀', params: FENCER_PARAMS, equips: { ...EQUIPS_SETS['曲刀'] }, tactic: 'lightWarrior' }
]

export function makeUndeadFormation(): EnemyFormationDef {
  const members: EnemyDef[] = []
  const rewardCp = 4, rewardGold = 400

  // 後衛から2体を選んで追加
  const b = Math.floor(Math.random() * (BACK.length * (BACK.length - 1) / 2))
  if (b === 0) {
    members.push(BACK[0], BACK[1])
  } else if (b === 1) {
    members.push(BACK[0], BACK[2])
  } else if (b === 2) {
    members.push(BACK[0], BACK[3])
  } else if (b === 3) {
    members.push(BACK[1], BACK[2])
  } else if (b === 4) {
    members.push(BACK[1], BACK[3])
  } else {
    members.push(BACK[2 ], BACK[3])
  }

  // 前衛1から1体を選んで追加
  const f1 = Math.floor(Math.random() * FRONT1.length)
  members.push(FRONT1[f1])

  // 前衛2から1体を選んで追加
  const f2 = Math.floor(Math.random() * FRONT2.length)
  members.push(FRONT2[f2])

  return {
    members, rewardCp, rewardGold
  }
}
