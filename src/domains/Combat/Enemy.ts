// Combat/Enemy.ts
//
// 敵編成データ (このファイルだけを編集すれば, 戦闘の敵メンバーを差し替えられる)

import { type CombatAttackModel, type CombatDefenseModels,  type CombatUnitModel } from './Unit'

// SLOT_SIZE (4) 体分の CombatUnitModel を書けば, その内容がそのまま戦闘の敵メンバーになる
// 4体揃っていない (デフォルトは空配列) 場合は, 従来通りランダム生成した敵が使われる (Combat.tsx 側の initEnemyModels を参照)
//
// tactic (省略可) に自動行動タイプを指定すると, そのユニットは対応する行動パターン (Combat/AI/handlers 配下) で
// 自動行動する (未指定の場合は自動行動せず, プレイヤーが手動操作するユニットとして扱われる)
// 指定できる値は Combat/AI/types.ts の TACTIC_KEYS を参照 (現在は以下の9種):
//   heavyWarrior(重戦士) / lightWarrior(軽戦士) / spellWarriorF(術戦士F) / swordsman(剣士) / thief(盗賊) /
//   archer(弓使い) / spellWarriorB(術戦士B) / spellSwordsman(術剣士) / sorcerer(術士)
//
// 例:
// export const enemy: CombatUnitModel[] = [
//   { id: 101, name: 'ゴブリン', maxHp: 12, attacks: {...}, defenses: {...}, ev: 8, pre: 11, mre: 10,
//     dmgBuff: 0, evBuff: 0, spells: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }, tactic: 'lightWarrior' },
//   ...
// ]
//
// バトル難度は3段階 (Easy/Normal/Hard). Easy はこのファイルの getEnemyFormation でゴブリン編成を生成し,
// Normal はサンプルユニット (人間) を Combat.tsx 側で直接生成する (生成CPはプレイヤーの実際のCPの
// 1.0〜1.25倍を戦闘毎にランダム抽選). 難度選択UI・Combat.tsx側との結線は実装済み
//
// 【将来の拡張ポイント・未実装分】
//   - バトル難度 Hard: 未実装 (ゴブリン以外の新規テンプレートが必要). Combat.tsx 側では暫定的に
//     Normal (サンプルユニット) と同じ生成にフォールバックしている
//   - 勝利時の報酬付与 (SaveData.savePoints/saveGold と連携) は未実装.
//     getEnemyFormation の戻り値に rewardCp/rewardGold を含めてあるので, 戦闘終了時にそれを
//     SaveData.savePoints/saveGold へ加算する形で実装できる
//   - Combat.tsx 側で敵生成時に呼び出す想定 (Easy): getEnemyFormation(getRankFromCp(saveData.loadPoints()))

// 空き武器スロット (main 以外は現状どの AI ハンドラーからも参照されないため, ダミーで問題ない)
const EMPTY_ATTACK: CombatAttackModel = {
  name: '装備無し', dmgName: '', dmgDice: 1, dmgMod: -4, dmgType: 0, level: 0, ev: 0, ready: 0,
  isChain: false, isTwoHanded: false, isPole: false, isMissile: false, isShield: false
}

// 防具セット (body/head/arm/leg の4部位すべてに同一の DR を適用する. 名称のみ部位ごとに変える.
// Character.ts の combatDefenseModels と同じ考え方: 1セットの防具は全部位を同じ DR で守り, 名前だけ部位ごとに違う)
type DefenseSetKey = '服' | '革服' | '革鎧'

const DEFENSE_SETS: Record<DefenseSetKey, { names: [string, string, string, string], sdr: number, tdr: number, dr: string, wt: number }> = {
  '服': { names: ['服', '装備無し', '装備無し', '装備無し'], sdr: 1, tdr: 0, dr: '1 (0)', wt: 0 },
  '革服': { names: ['革服', '革の帽子', 'グローブ', 'ブーツ'], sdr: 1, tdr: 1, dr: '1', wt: 0 },
  '革鎧': { names: ['革鎧', 'ヘッドギア', 'レザーグローブ', 'レザーブーツ'], sdr: 2, tdr: 2, dr: '2', wt: 1 }
}

function makeDefenses(setKey: DefenseSetKey): CombatDefenseModels {
  const { names: [body, head, arm, leg], ...base } = DEFENSE_SETS[setKey]
  return {
    body: { name: body, ...base },
    head: { name: head, ...base },
    arm: { name: arm, ...base },
    leg: { name: leg, ...base }
  }
}

const NO_SPELLS = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }

/**
 * 敵データ
 * 変数 Rank: 0～3 周回(プレイヤー保有CP)によって変化 (getRankFromCp を参照)
 * 記載されていない dmgBuff, evBuff, spells は全て 0 を取る
 */

/** 1. ゴブリン (棍棒) 攻撃は当たるが, ダメージが低い
 * maxHp: Rank * 2 + 10
 * attack: 棍棒 Dmg: 2d-2(叩), ev:1, 準備に1ターン, 技能値: Rank + 12
 * defense: 服 DR: 1(0)
 * ev: Rank + 10, pre: 8, mre: 8
 * tactic: 'lightWarrior'
 */
function goblinA(rank: number): Omit<CombatUnitModel, 'id' | 'name'> {
  return {
    maxHp: rank * 2 + 10,
    attacks: {
      main: { name: '棍棒', dmgName: '叩', dmgDice: 2, dmgMod: -2, dmgType: 0, level: rank + 12, ev: 1, ready: 1,
               isChain: false, isTwoHanded: false, isPole: false, isMissile: false, isShield: false },
      sub: EMPTY_ATTACK, spare: EMPTY_ATTACK, shield: EMPTY_ATTACK
    },
    defenses: makeDefenses('服'),
    ev: rank + 10, pre: 8, mre: 8, dmgBuff: 0, evBuff: 0,
    spells: NO_SPELLS, tactic: 'lightWarrior'
  }
}

/** 2. ゴブリン (短剣) 攻撃は当たるが, ダメージが低い
 * maxHp: Rank * 2 + 10
 * attack: ダガー Dmg: 1d-2(刺), ev:1, 技能値: Rank + 12
 * defense: 服 DR: 1(0)
 * ev: Rank + 10, pre: 8, mre: 8
 * tactic: 'lightWarrior'
 */
function goblinB(rank: number): Omit<CombatUnitModel, 'id' | 'name'> {
  return {
    maxHp: rank * 2 + 10,
    attacks: {
      main: { name: 'ダガー', dmgName: '刺', dmgDice: 1, dmgMod: -2, dmgType: 2, level: rank + 12, ev: 1, ready: 0,
               isChain: false, isTwoHanded: false, isPole: false, isMissile: false, isShield: false },
      sub: EMPTY_ATTACK, spare: EMPTY_ATTACK, shield: EMPTY_ATTACK
    },
    defenses: makeDefenses('服'),
    ev: rank + 10, pre: 8, mre: 8, dmgBuff: 0, evBuff: 0,
    spells: NO_SPELLS, tactic: 'lightWarrior'
  }
}

/** 3. ホブリン (棍棒)  ダメージはまずまずだが, 滅多に当たらない
 * maxHp: Rank * 2 + 14
 * attack: 棍棒 Dmg: 2d-1(叩), ev:1, 技能値: Rank + 11
 * defense: 革服 DR: 1
 * ev: Rank + 10, pre: 10, mre: 8
 * tactic: 'heavyWarrior'
 */
function hoblinA(rank: number): Omit<CombatUnitModel, 'id' | 'name'> {
  return {
    maxHp: rank * 2 + 14,
    attacks: {
      main: { name: '棍棒', dmgName: '叩', dmgDice: 2, dmgMod: -1, dmgType: 0, level: rank + 11, ev: 1, ready: 1,
               isChain: false, isTwoHanded: false, isPole: false, isMissile: false, isShield: false },
      sub: EMPTY_ATTACK, spare: EMPTY_ATTACK, shield: EMPTY_ATTACK
    },
    defenses: makeDefenses('革服'),
    ev: rank + 10, pre: 10, mre: 8, dmgBuff: 0, evBuff: 0,
    spells: NO_SPELLS, tactic: 'heavyWarrior'
  }
}

/** 4. ホブリン (小剣) ダメージはまずまずだが, 滅多に当たらない
 * maxHp: Rank * 2 + 14
 * attack: ショートソード Dmg: 1d(切), ev:1, 技能値: Rank + 11
 * defense: 革服 DR: 1
 * ev: Rank + 10, pre: 10, mre: 10
 * tactic: 'heavyWarrior'
 */
function hoblinB(rank: number): Omit<CombatUnitModel, 'id' | 'name'> {
  return {
    maxHp: rank * 2 + 14,
    attacks: {
      main: { name: 'ショートソード', dmgName: '切', dmgDice: 1, dmgMod: 0, dmgType: 1, level: rank + 11, ev: 1, ready: 0,
               isChain: false, isTwoHanded: false, isPole: false, isMissile: false, isShield: false },
      sub: EMPTY_ATTACK, spare: EMPTY_ATTACK, shield: EMPTY_ATTACK
    },
    defenses: makeDefenses('革服'),
    ev: rank + 10, pre: 10, mre: 8, dmgBuff: 0, evBuff: 0,
    spells: NO_SPELLS, tactic: 'heavyWarrior'
  }
}

/** 5. ゴブリンキング
 * maxHp: Rank * 2 + 18
 * attack: ロングソード Dmg: 1d+2(切), ev:1, 技能値: Rank + 12
 * defense: 革鎧 DR: 2
 * ev: Rank + 10, pre: 10, mre: 10
 * tactic: 'heavyWarrior'
 */
function goblinKing(rank: number): Omit<CombatUnitModel, 'id' | 'name'> {
  return {
    maxHp: rank * 2 + 18,
    attacks: {
      main: { name: 'ロングソード', dmgName: '切', dmgDice: 1, dmgMod: 2, dmgType: 1, level: rank + 12, ev: 1, ready: 0,
               isChain: false, isTwoHanded: false, isPole: false, isMissile: false, isShield: false },
      sub: EMPTY_ATTACK, spare: EMPTY_ATTACK, shield: EMPTY_ATTACK
    },
    defenses: makeDefenses('革鎧'),
    ev: rank + 10, pre: 10, mre: 10, dmgBuff: 0, evBuff: 0,
    spells: NO_SPELLS, tactic: 'heavyWarrior'
  }
}

/** 6. ドビー
 * maxHp: Rank * 2 + 10
 * attack: 短弓 Dmg: 1d-2(刺), ev:-, 技能値: Rank + 12
 * defense: 服 DR: 1(0)
 * ev: Rank + 10, pre: 8, mre: 8
 * tactic: 'archer'
 */
function dobby(rank: number): Omit<CombatUnitModel, 'id' | 'name'> {
  return {
    maxHp: rank * 2 + 10,
    attacks: {
      main: { name: '短弓', dmgName: '刺', dmgDice: 1, dmgMod: -2, dmgType: 2, level: rank + 12, ev: 0, ready: 1,
               isChain: false, isTwoHanded: false, isPole: false, isMissile: true, isShield: false },
      sub: EMPTY_ATTACK, spare: EMPTY_ATTACK, shield: EMPTY_ATTACK
    },
    defenses: makeDefenses('服'),
    ev: rank + 10, pre: 8, mre: 8, dmgBuff: 0, evBuff: 0,
    spells: NO_SPELLS, tactic: 'archer'
  }
}

/** 7. ゴブリン術士 (火行)
 * maxHp: Rank * 2 + 10
 * attack: 杖 Dmg: 2d-4(叩), ev:3, 技能値: Rank + 10
 * defense: 服 DR: 1(0)
 * ev: Rank + 10, pre: 8, mre: 10
 * spells: { earth: Rank + 12, metal: Rank + 12 }
 * tactic: 'sorcerer'
 */
function goblinMageA(rank: number): Omit<CombatUnitModel, 'id' | 'name'> {
  return {
    maxHp: rank * 2 + 10,
    attacks: {
      main: { name: '杖', dmgName: '叩', dmgDice: 2, dmgMod: -4, dmgType: 0, level: rank + 10, ev: 3, ready: 0,
               isChain: false, isTwoHanded: false, isPole: false, isMissile: false, isShield: false },
      sub: EMPTY_ATTACK, spare: EMPTY_ATTACK, shield: EMPTY_ATTACK
    },
    defenses: makeDefenses('服'),
    ev: rank + 10, pre: 8, mre: 10, dmgBuff: 0, evBuff: 0,
    spells: { ...NO_SPELLS, fire: rank + 12 }, tactic: 'fireSpell'
  }
}

/** 7. ゴブリン術士 (土行/金行)
 * maxHp: Rank * 2 + 10
 * attack: 杖 Dmg: 2d-4(叩), ev:3, 技能値: Rank + 10
 * defense: 服 DR: 1(0)
 * ev: Rank + 10, pre: 8, mre: 10
 * spells: { earth: Rank + 12, metal: Rank + 12 }
 * tactic: 'sorcerer'
 */
function goblinMageB(rank: number): Omit<CombatUnitModel, 'id' | 'name'> {
  return {
    maxHp: rank * 2 + 10,
    attacks: {
      main: { name: '杖', dmgName: '叩', dmgDice: 2, dmgMod: -4, dmgType: 0, level: rank + 10, ev: 3, ready: 0,
               isChain: false, isTwoHanded: false, isPole: false, isMissile: false, isShield: false },
      sub: EMPTY_ATTACK, spare: EMPTY_ATTACK, shield: EMPTY_ATTACK
    },
    defenses: makeDefenses('服'),
    ev: rank + 10, pre: 8, mre: 10, dmgBuff: 0, evBuff: 0,
    spells: { ...NO_SPELLS, earth: rank + 12, metal: rank + 12 }, tactic: 'earthMetalSpell'
  }
}

type EnemyKey = 'goblinA' | 'goblinB' | 'hoblinA' | 'hoblinB' | 'goblinKing' | 'dobby' | 'goblinMageA' | 'goblinMageB'

const ENEMY_TEMPLATES: Record<EnemyKey, (rank: number) => Omit<CombatUnitModel, 'id' | 'name'>> = {
  goblinA, goblinB, hoblinA, hoblinB, goblinKing, dobby, goblinMageA, goblinMageB
}

// Rank算出 (プレイヤー保有CPから0〜3を導出する. Easyのゴブリン生成に使用する)
export function getRankFromCp(cp: number): number {
  if (cp < 16) return 0
  else if (cp < 24) return 1
  else if (cp < 40) return 2
  else return 3
}

// 敵編成 (ランダムに複数編成を抽選する)
type EnemyFormationDef = { members: {name: string, key: EnemyKey}[], rewardCp: number, rewardGold: number }

/**
 * 敵編成 (バトル難度 Easy 用)
 *
 * ランダムで下記編成 (ゴブリン) とバトル (※スライム戦も実装予定)
 * バトル難度 Normal は Combat.tsx 側でサンプルユニット (人間) を直接生成するため, ここには含まない.
 * Hard は敵データ未実装 (今後対応)
 */
const EASY_FORMATIONS: EnemyFormationDef[] = [
  { members: [ // 1
    {name: 'ドビー', key: 'dobby'},
    {name: 'ホブリン', key: 'hoblinA'},
    {name: 'ゴブリンA', key: 'goblinA'}, // 1～6固定
    {name: 'ゴブリンB', key: 'goblinB'}  // 1～6固定
  ], rewardCp: 1, rewardGold: 50 },
  { members: [ // 2
    {name: 'ドビー', key: 'dobby'},
    {name: 'ホブリン', key: 'hoblinB'}, // A → B
    {name: 'ゴブリンA', key: 'goblinA'},
    {name: 'ゴブリンB', key: 'goblinB'}
  ], rewardCp: 1, rewardGold: 50 },
  { members: [ //3
    {name: 'ゴブリン術士', key: 'goblinMageA'}, // dobby → mageA
    {name: 'ホブリン', key: 'hoblinA'},
    {name: 'ゴブリンA', key: 'goblinA'},
    {name: 'ゴブリンB', key: 'goblinB'},
  ], rewardCp: 1, rewardGold: 50 },
  { members: [ //4
    {name: 'ゴブリン術士', key: 'goblinMageA'},
    {name: 'ホブリン', key: 'hoblinB'}, // A → B
    {name: 'ゴブリンA', key: 'goblinA'},
    {name: 'ゴブリンB', key: 'goblinB'},
  ], rewardCp: 1, rewardGold: 50 },
  { members: [ // 5
    {name: 'ゴブリン術士', key: 'goblinMageB'}, // mageA → mageB
    {name: 'ホブリン', key: 'hoblinA'},
    {name: 'ゴブリンA', key: 'goblinA'},
    {name: 'ゴブリンB', key: 'goblinB'},
  ], rewardCp: 1, rewardGold: 50 },
  { members: [ // 6
    {name: 'ゴブリン術士', key: 'goblinMageB'},
    {name: 'ホブリン', key: 'hoblinB'}, // A → B
    {name: 'ゴブリンA', key: 'goblinA'},
    {name: 'ゴブリンB', key: 'goblinB'},
  ], rewardCp: 1, rewardGold: 50 },
  { members: [ // 7
    {name: 'ゴブリン術士', key: 'goblinMageA'},
    {name: 'ドビー', key: 'dobby'},
    {name: 'ホブリン', key: 'hoblinA'}, // 7～9固定
    {name: 'ゴブリン', key: 'goblinB'}, // 7～9固定
  ], rewardCp: 1, rewardGold: 75 },
  { members: [ // 8
    {name: 'ゴブリン術士', key: 'goblinMageB'}, // mageA → mageB
    {name: 'ドビー', key: 'dobby'},
    {name: 'ホブリン', key: 'hoblinA'},
    {name: 'ゴブリン', key: 'goblinB'},
  ], rewardCp: 1, rewardGold: 75 },
  { members: [ // 9
    {name: 'ゴブリン術士A', key: 'goblinMageA'}, // dobby → mageA
    {name: 'ゴブリン術士B', key: 'goblinMageB'},
    {name: 'ホブリン', key: 'hoblinA'},
    {name: 'ゴブリン', key: 'goblinB'},
  ], rewardCp: 1, rewardGold: 75 },
  { members: [ // 10
    {name: 'ゴブリン術士', key: 'goblinMageA'},
    {name: 'ドビー', key: 'dobby'},
    {name: 'ホブリン', key: 'hoblinB'}, // 10～12固定
    {name: 'ゴブリン', key: 'goblinA'}, // 10～12固定
  ], rewardCp: 1, rewardGold: 75 },
  { members: [ // 11
    {name: 'ゴブリン術士', key: 'goblinMageB'}, // mageA → mageB
    {name: 'ドビー', key: 'dobby'},
    {name: 'ホブリン', key: 'hoblinB'},
    {name: 'ゴブリン', key: 'goblinA'},
  ], rewardCp: 1, rewardGold: 75 },
  { members: [ // 12
    {name: 'ゴブリン術士A', key: 'goblinMageA'}, // dobby → mageA
    {name: 'ゴブリン術士B', key: 'goblinMageB'},
    {name: 'ホブリン', key: 'hoblinB'}, // A → B
    {name: 'ゴブリン', key: 'goblinA'}, // B → A
  ], rewardCp: 1, rewardGold: 75 },
  { members: [ // 13
    {name: 'ドビー', key: 'dobby'},
    {name: 'ゴブリンキング', key: 'goblinKing'}, // 13～15固定
    {name: 'ゴブリンA', key: 'goblinA'}, // 13～15固定
    {name: 'ゴブリンB', key: 'goblinB'}, // 13～15固定
  ], rewardCp: 1, rewardGold: 100 },
  { members: [ // 14
    {name: 'ゴブリン術士A', key: 'goblinMageA'}, // dobby → mageA
    {name: 'ゴブリンキング', key: 'goblinKing'},
    {name: 'ゴブリンA', key: 'goblinA'},
    {name: 'ゴブリンB', key: 'goblinB'},
  ], rewardCp: 1, rewardGold: 100 },
  { members: [ // 15
    {name: 'ゴブリン術士B', key: 'goblinMageB'}, // mageA → mageB
    {name: 'ゴブリンキング', key: 'goblinKing'},
    {name: 'ゴブリンA', key: 'goblinA'},
    {name: 'ゴブリンB', key: 'goblinB'},
  ], rewardCp: 1, rewardGold: 100 },
  
]

// Rank を指定して敵編成 (4体) を1つランダムに選び, 実際の CombatUnitModel[] と報酬を返す
// (id はテンプレートを編成間で使い回すため, ここで 101〜104 に振り直す)
export function getEnemyFormation(rank: number): { models: CombatUnitModel[], rewardCp: number, rewardGold: number } {
  const picked = EASY_FORMATIONS[Math.floor(Math.random() * EASY_FORMATIONS.length)]
  const models = picked.members.map((enemy, i) => ({
    id: 101 + i,
    name: enemy.name,
    ...ENEMY_TEMPLATES[enemy.key](rank)
  }))
  return { models, rewardCp: picked.rewardCp, rewardGold: picked.rewardGold }
}

// 手動上書き用配列 (このファイルだけを編集すれば, 戦闘の敵メンバーを差し替えられる開発用ショートカット.
// SLOT_SIZE (4) 体分を書けばそちらが優先され, 空のままなら Combat.tsx 側で難度別に自動生成される)
export const enemy: CombatUnitModel[] = []
