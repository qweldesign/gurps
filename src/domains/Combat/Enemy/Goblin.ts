// Combat/Enemy/Goblin.ts

import { type EnemyParams, type EnemyEquips, type EnemyDef, type EnemyFormationDef } from './Base'

// ゴブリンの汎用的パラメータ
const GOBLIN_PARAMS: EnemyParams = {
  maxHp: 10, // 最大Hp
  dmgMod: -2, // ダメージ修正
  level: 12, // 技能値
  ev: 10, // 回避値 (よけ)
  pre: 8, // 身体的な抵抗値
  mre: 8, // 精神的な抵抗値
  dmgBuff: 0, //「怪力」端数 (バフ初期値)
  evBuff: 0, //「運動」端数 (バフ初期値)
  creatureType: 'normal' // 生物種別
}

// ホブリンの汎用的パラメータ
const HOBLIN_PARAMS: EnemyParams = {
  maxHp: 14, // 最大Hp +2
  dmgMod: -1, // ダメージ修正 +1
  level: 11, // 技能値 -1
  ev: 10,
  pre: 10,
  mre: 8,
  dmgBuff: 0,
  evBuff: 0,
  creatureType: 'normal'
}

// ゴブリンの装備 (武器種のみ指定)
const GOBLIN_EQUIPS_SETS: Record<string, Omit<EnemyEquips, 'armorKey'>> = {
  '棍棒': { mainKey: '棍棒', spareKey: null, shieldKey: null },
  '短剣': { mainKey: 'ダガー', spareKey: null, shieldKey: null },
  '小剣': { mainKey: 'ショートソード', spareKey: null, shieldKey: null },
  '長剣': { mainKey: 'ロングソード', spareKey: null, shieldKey: '中盾' },
  '短弓': { mainKey: '短弓', spareKey: 'ダガー', shieldKey: null },
  '杖': { mainKey: '杖', spareKey: null, shieldKey: null }
}

// ゴブリン後衛
const GOBLIN_BACK_UNITS: EnemyDef[] = [
  { name: 'ゴブリン:短弓', params: GOBLIN_PARAMS, equips: { ...GOBLIN_EQUIPS_SETS['短弓'], armorKey: '服'}, tactic: 'archer' },
  { name: 'ゴブリン:杖', params: GOBLIN_PARAMS, equips: { ...GOBLIN_EQUIPS_SETS['杖'], armorKey: '服'}, tactic: 'earthMetalSpell' }
]

// ゴブリン前衛
const GOBLIN_FRONT_UNITS: EnemyDef[] = [
  { name: 'ゴブリン:棍棒', params: GOBLIN_PARAMS, equips: { ...GOBLIN_EQUIPS_SETS['棍棒'], armorKey: '服'}, tactic: 'lightWarrior' },
  { name: 'ゴブリン:短剣', params: GOBLIN_PARAMS, equips: { ...GOBLIN_EQUIPS_SETS['短剣'], armorKey: '服'}, tactic: 'lightWarrior' },
  { name: 'ゴブリン:小剣', params: GOBLIN_PARAMS, equips: { ...GOBLIN_EQUIPS_SETS['小剣'], armorKey: '服'}, tactic: 'lightWarrior' }
]

// ホブリン後衛
const HOBLIN_BACK_UNITS: EnemyDef[] = [
  { name: 'ホブリン:長剣', params: HOBLIN_PARAMS, equips: { ...GOBLIN_EQUIPS_SETS['長剣'], armorKey: '革鎧'}, tactic: 'fireSpell' }
]

// ホブリン前衛
const HOBLIN_FRONT_UNITS: EnemyDef[] = [
  { name: 'ホブリン:棍棒', params: HOBLIN_PARAMS, equips: { ...GOBLIN_EQUIPS_SETS['棍棒'], armorKey: '革服'}, tactic: 'heavyWarrior' },
  { name: 'ホブリン:短剣', params: HOBLIN_PARAMS, equips: { ...GOBLIN_EQUIPS_SETS['短剣'], armorKey: '革服'}, tactic: 'heavyWarrior' },
  { name: 'ホブリン:小剣', params: HOBLIN_PARAMS, equips: { ...GOBLIN_EQUIPS_SETS['小剣'], armorKey: '革服'}, tactic: 'heavyWarrior' },
]

export function makeGoblinFormation(): EnemyFormationDef {
  const members: EnemyDef[] = []
  let rewardCp = 0, rewardGold = 0

  // ホブリンを1体選ぶ
  const h = Math.floor(Math.random() * (HOBLIN_BACK_UNITS.length + HOBLIN_FRONT_UNITS.length))

  // ホブリンが後衛
  // 最も難度が高い報酬を設定
  if (h === 0) {
    // ホブリン:長剣 を追加
    members.push(HOBLIN_BACK_UNITS[0])

    // ゴブリン後衛を1体選ぶ
    const g1 = Math.floor(Math.random() * GOBLIN_BACK_UNITS.length)
    // ゴブリン後衛を1体追加
    members.push(GOBLIN_BACK_UNITS[g1])

    // ゴブリン前衛を2体選ぶ
    const g2 = Math.floor(Math.random() * GOBLIN_FRONT_UNITS.length)
    // ゴブリン前衛を2体追加
    GOBLIN_FRONT_UNITS.forEach((unit, i) => {
      if (i !== g2) members.push(unit)
    })

    // 報酬を設定
    rewardCp = 1
    rewardGold = 100
  }

  // ホブリンが前衛
  if (h > 0) {
    // 前衛2/後衛2 or 前衛3/後衛1
    const r = Math.floor(Math.random() * 2)

    // 前衛2/後衛2
    // 報酬は中難度相当
    if (r === 0) {
      // ゴブリン後衛を2体追加
      members.push(GOBLIN_BACK_UNITS[0])
      members.push(GOBLIN_BACK_UNITS[1])
      // ホブリン前衛を1体追加
      members.push(HOBLIN_FRONT_UNITS[h - 1])
      // ゴブリン前衛を1体選ぶ
      const g = Math.floor(Math.random() * GOBLIN_FRONT_UNITS.length)
      // ゴブリン前衛を1体追加
      members.push(GOBLIN_FRONT_UNITS[g])

      // 報酬を設定
      rewardCp = 1
      rewardGold = 75
    }

    // 前衛3/後衛1
    // 報酬は低難度相当
    if (r === 1) {
      // ゴブリン後衛を1体選ぶ
      const g1 = Math.floor(Math.random() * GOBLIN_BACK_UNITS.length)
      // ゴブリン後衛を1体追加
      members.push(GOBLIN_BACK_UNITS[g1])
      // ホブリン前衛を1体追加
      members.push(HOBLIN_FRONT_UNITS[h - 1])
      // ゴブリン前衛を2体選ぶ
      const g2 = Math.floor(Math.random() * GOBLIN_FRONT_UNITS.length)
      // ゴブリン前衛を2体追加
      GOBLIN_FRONT_UNITS.forEach((unit, i) => {
        if (i !== g2) members.push(unit)
      })

      // 報酬を設定
      rewardCp = 1
      rewardGold = 50
    }
  }

  return {
    members, rewardCp, rewardGold
  }
}
