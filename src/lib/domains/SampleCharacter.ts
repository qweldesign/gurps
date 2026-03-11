// SampleCharacter.ts

import { type Point, type ParameterName } from './Parameters'
import { type WeaponName, type ArmorName } from './Equipments'
import { Character } from './Character'

const DEFAULT_POINTS = 10
const MULTIPLIER_NUM = [1, 2, 4] as const // Point倍率

export type Multiplier = typeof MULTIPLIER_NUM[number]

// 基本能力値: CP10点をなるべく使い切って派生で技能分を削る
const ABILITY_TABLE: Point[][] = [
  [  1,   4,   1,   4], //  0: DX/HT
  [  2,   4,   2,   2], //  1: DX/BL
  [0.5,   8,   1, 0.5], //  2: DX
  [  1,   4,   4,   1], //  3: DX/IN
  [  2,   2,   1,   4], //  4: HT/BL
  [  4,   1, 0.5,   4], //  5: ST/HT
  [  4,   2,   1,   2], //  6: ST/BL
  [  4,   4,   1,   1], //  7: ST/DX
  [  4,   1,   4,   1], //  8: ST/IN
  [  4,   1,   2,   2], //  9: ST/BL
  [  4, 0.5,   1,   4], // 10: ST/HT
  [  2,   1,   2,   4], // 11: HT/BL
  [  1,   4,   4,   1], // 12: DX/IN
  [0.5,   1,   8, 0.5], // 13: IN
  [  2,   2,   4,   2], // 14: IN/BL
  [  1,   1,   4,   4], // 15: IN/HT
]

// 能力値修正 (派生) 下方修正のみに変更
const MOD_TABLE: ParameterName[] = [
  '敏捷力', // 0:男性 (派生1)
  '生命力', // 1:男性 (派生2)
  '筋力', // 2:女性 (派生3)
  '知力' // 3:女性 (派生4)
]

// 修得技能セット
const TACTIC_TABLE: ParameterName[][] = [
  ['武術', '怪力', '鍛錬', '格闘', '運動', '探索', '修養', '歌唱'], // 0:重戦士
  ['武術', '運動', '探索', '鍛錬', '隠密', '細工', '怪力', '格闘', '軽業', '早業', '修養', '舞踏'], // 1:軽戦士
  ['武術', '水行術', '怪力', '鍛錬', '修養', '礼法', '尋問', '治癒', '運動', '探索'], // 2:術戦士F
  ['剣術', '探索', '運動', '細工', '隠密', '早業', '軽業', '鍛錬', '怪力', '修養', '交渉', '柔術'], // 3:剣士
  ['剣術', '運動', '探索', '隠密', '細工', '軽業', '早業', '交渉', '演技', '尋問', '鑑定', '柔術'], // 4:盗賊
  ['弓術', '探索', '運動', '細工', '隠密', '早業', '軽業', '修養', '剣術', '交渉', '治癒', '演奏'], // 5:弓使い
  ['火行術', '修養', '武術', '礼法', '演技', '歴史', '怪力', '鍛錬', '探索', '運動'], // 6:術戦士B
  ['木行術', '修養', '剣術', '礼法', '交渉', '探索', '運動', '鍛錬', '水行術', '鑑定', '治癒', '歴史'], // 7:術剣士
  ['金行術', '土行術', '修養', '礼法', '交渉', '尋問', '演技', '探索', '運動', '鑑定', '治癒', '歴史'] // 8:術士
]

// 装備セット
// 最貧, 貧弱, 普通, 強靭の最大4段階
const EQUIPMENTS_TABLE: [WeaponName, ArmorName][][][] = [
  [ // 重戦士, 術戦士F
    [['ロングソード', '革鎧'], ['バスタードソード', 'チェインメイル'], ['バスタードソード', 'ブリガンディ'], ['バスタードソード', 'プレイトメイル']],
    [['戦鎚', '革鎧'], ['戦鎚', 'チェインメイル'], ['戦鎚', 'ブリガンディ'], ['戦鎚', 'プレイトメイル']],
    [['戦斧', '革鎧'], ['戦斧', 'チェインメイル'], ['戦斧', 'ブリガンディ'], ['戦斧', 'プレイトメイル']]
  ],
  [ // 軽戦士
    [['蒼龍刀', '革服'], ['蒼龍刀', '革鎧'], ['蒼龍刀', 'チェインメイル'], ['蒼龍刀', 'ブリガンディ']],
    [['バスタードソード', '革服'], ['バスタードソード', '革鎧'], ['グレートソード', 'チェインメイル'], ['グレートソード', 'ブリガンディ']],
    [['鉾槍', '革鎧'], ['鉾槍', 'チェインメイル'], ['鉾槍', 'チェインメイル'], ['鉾槍', 'ブリガンディ']]
  ],
  [ // 術戦士B
    [['ショートソード', '革服'], ['ロングソード', '革服'], ['バスタードソード', '革鎧'], ['バスタードソード', 'チェインメイル']],
    [['ショートソード', '革服'], ['三日月刀', '革服'], ['蒼龍刀', '革鎧'], ['蒼龍刀', 'チェインメイル']],
    [['長槍', '革服'], ['長槍', '革鎧'], ['薙刀', '革鎧'], ['薙刀', 'チェインメイル']]
  ],
  [ // 剣士, 盗賊, 術剣士
    [['レイピア', '服'], ['レイピア', '革服'], ['レイピア', '革鎧']],
    [['ロングソード', '服'], ['ロングソード', '革服'], ['ロングソード', '革鎧']],
    [['三日月刀', '服'], ['三日月刀', '革服'], ['三日月刀', '革鎧']],
    [['鎚槌', '革服'], ['鎚槌', '革鎧']],
    [['手斧', '革服'], ['手斧', '革鎧']],
    [['長槍', '革服'], ['長槍', '革鎧']]
  ],
  [ // 弓使い
    [['装備無し', '革服'], ['ダガー', '革服'], ['レイピア', '革鎧']]
  ],
  [ // 術士
    [['杖', '革服'], ['杖', '革鎧']]
  ],
]

const MISSILE_TABLE: WeaponName[] = [
  '短弓', '弩', '長弓'
]

// 名前 (PC用)
export const PC_LIST: string[] = [
  'アントニオ', 'ウィリアム', 'カイル', 'カーター', 'クリストファー', 'ザビエル',
  'ジェームス', 'ジェイコブ', 'ジョシュア', 'セス', 'タイラー',
  'チャールズ', 'ディラン', 'トリスタン', 'ナサニエル', 'ノア', 'ビクター',
  'ヘンリー', 'ミゲル', 'ライリー', 'ローガン', 'ワイアット',
  'アメリア', 'アンナ', 'エミリー', 'エリー', 'キャサリン', 'グレイシー',
  'クロエ', 'サラ', 'ジェンナ', 'ジャスミン', 'ジュリア', 
  'ソフィ', 'トリニティ', 'ハンナ', 'ビクトリア', 'マデレン', 'マリッサ',
  'ミーガン', 'メアリー', 'リリアン', 'レベッカ', 'ローレン'
]

// 名前 (NPC用)
const NPC_LIST: string[] = [
  'アーロン', 'アイゼア', 'アンドリュー', 'イアン', 'エリック', 'オーウェン',
  'ギャレット', 'クーパー', 'ケヴィン', 'コール', 'サム',
  'ジェイデン', 'ジェレミア', 'ショーン', 'ジョセフ', 'スティーブン',
  'ダニエル', 'チェイス', 'ディビッド', 'ティモシー', 'トーマス', 'ドミニク',
  'ニコラス', 'ネイサン', 'パーカー', 'パトリック', 'ブライアン',
  'マシュー', 'メイソン', 'ライアン', 'リチャード', 'ルイス',
  'アシュリン', 'アビー', 'アリアナ', 'アリシア', 'イザベラ', 'エマ',
  'オードリー', 'オリビア', 'キャロライン', 'クレア', 'グレース',
  'ケイト', 'ジェシカ', 'シエラ', 'シドニー', 'シャーロット',
  'ステファニー', 'ゾーィ', 'ダニエル', 'ディスティニー', 'ナタリー', '二コール',
  'ブルック', 'ペイジ', 'マヤ', 'マリア', 'ミア',
  'ミッシェル', 'メリッサ', 'リア', 'リリー', 'レイチェル'
]

export class SampleCharacter extends Character {
  public uid: number // キャラクター生成のアルゴリズムを決定するKey (デバッグ用)
  public tactic: number // 技能修得や装備選択、自動行動時のロジックタイプ

  constructor(id: number, uid: number, totalPoints: number = 10, multiplier: Multiplier = 1) {
    const A = ABILITY_TABLE.length // 16
    const i = Math.max(Math.min(uid, 63), 0) // 最大値・最小値指定
    const r1 = Math.floor(i / A) * A
    const r2 = Math.floor(i / A) * A / 4
    const r3 = i % A
    const r = r1 + (r2 + r3) % A // 順序調整
    const a = r % A // 基本能力値
    const b = Math.floor(i / A) % 4 // 能力値修正 (派生)
    const g = Math.floor(b / 2) // 性別

    // Points倍率オプション
    const points = [...ABILITY_TABLE[a]].map(p => p * multiplier as Point)

    // ID・名前・性別・能力値・装備の初期化
    const name = NPC_LIST[i]
    const gender = g ? '女性' : '男性'
    super({ id, name, gender, points, equipments: null })
    this.uid = i

    // 能力値の修正
    this.modifyAbilities(MOD_TABLE[b], multiplier)
    this.tactic = this.getTactic(multiplier) // ロジックタイプを判定

    // 技能セットの選択
    this.setSkills(totalPoints, DEFAULT_POINTS, multiplier)

    // 装備セットの選択
    this.setEquipments(a, b, totalPoints)
  }

  modifyAbilities(mod: ParameterName, multiplier: Multiplier = 1) {
    let level = 12
    while (multiplier > 1) {
      level++
      multiplier /= 2
    }

    // MOD_TABLE に対応した能力値を下げる (技能分を確保)
    this.stepParam(mod, -1)

    const str = this.getParamLevel('筋力')
    const dex = this.getParamLevel('敏捷力')
    const int = this.getParamLevel('知力')
    const ht = this.getParamLevel('生命力')
    const param = this.getParamLevel(mod)

    // 個性が失われた場合の救済措置 (12 → 11に減少した場合のみ)
    // HTが12ある場合、ST, DX, IN のいずれかを12に戻す
    if (str < level && dex < level && int < level && ht > level - 1 && param === level - 1) {
      this.stepParam('生命力', -1)
      this.stepParam(mod, 1)
    }
  }

  // 技能修得や装備選択、自動行動時のロジックタイプを設定
  getTactic(multiplier: Multiplier = 1): number {
    let level = 12
    while (multiplier > 1) {
      level++
      multiplier /= 2
    }
    const str = this.getParamLevel('筋力')
    const dex = this.getParamLevel('敏捷力')
    const int = this.getParamLevel('知力')
    const ht = this.getParamLevel('生命力')
    if (str > level - 1) {
      if (int > level - 2) return 2 // 術戦士F
      else if (dex > level - 2) return 1 // 軽戦士
      else return 0 // 重戦士
    } else if (dex > level - 1) {
      if (int > level - 2 && str > level - 3) return 5 // 弓使い
      else if (int > level - 1) return 7 // 術剣士
      else if (str > level - 3 && ht > level - 3) return 3 // 剣士
      else return 4 // 盗賊
    } else if (int > level - 1) {
      if (str > level - 2 ) return 6 // 術戦士B
      else if (dex > level - 2) return 7 // 術剣士
      else return 8 // 術士
    } else if (dex > level - 2) {
      if (int > level - 2) return 5 // 弓使い
      else if (str === dex) return 1 // 軽戦士
      else return 3 // 剣士
    } else {
      if (str > level - 2 && int > level - 2) return 2 // 術戦士F
      else if (str > level - 2) return 0 // 重戦士
      else if (str > level - 3 && dex > level - 3) return 7 // 術剣士
      else return 8 // 術士
    }
  }

  // ロジックタイプ名を取得 (デバッグ用)
  getTacticName() {
    return [
      '重戦士', '軽戦士', '術戦士F',
      '剣士', '盗賊', '弓使い',
      '術戦士B', '術剣士', '術士'
    ][this.tactic]
  }

  // 技能の初期化
  setSkills(totalPoints: number, defaultPoints: number = 10, multiplier: Multiplier = 1) {
    const skills = TACTIC_TABLE[this.tactic]

    if (totalPoints > defaultPoints * multiplier) {
      // Point総計が標準(10)より多い場合は主技能を切り分ける
      const [main, ...other] = skills
      this.setMainSkill(main, totalPoints, multiplier)
      this.setSkillLoop(other, totalPoints, multiplier)
    } else {
      // Point総計が標準(10)以下の場合は主技能を切り分けない
      this.setSkillLoop(skills, totalPoints, multiplier)
    }
  }

  // Points合計に対して主技能を設定
  setMainSkill(skill: ParameterName, totalPoints: number, multiplier: Multiplier = 1) {
    if (multiplier === 1) {
      if (totalPoints >= 32) this.setParam(skill, Math.floor(totalPoints / 16) * 8 as Point)
        // 32CP = 初期:10 + 主:16 + 副:6
        // 40CP = 初期:10 + 主:16 + 副:14
        // 48CP = 初期:10 + 主:24 + 副:14
        // 64CP = 初期:10 + 主:32 + 副:22
      else if (totalPoints >= 24) this.setParam(skill, 8) // 追加副技能: 6点
      else if (totalPoints >= 16) this.setParam(skill, 4) // 追加副技能: 2点
      else if (totalPoints >= 12) this.setParam(skill, 2) // 追加副技能: 0点
      else this.setParam(skill, 1)
    } else if (multiplier === 2) {
      if (totalPoints >= 32) this.setParam(skill, (Math.floor(totalPoints / 16) - 1) * 8 as Point)
        // 32CP = 初期:20 + 主:8 + 副:4
        // 40CP = 初期:20 + 主:8 + 副:12
        // 48CP = 初期:20 + 主:16 + 副:12
        // 64CP = 初期:20 + 主:24 + 副:20
      else if (totalPoints >= 24) this.setParam(skill, 2) // 追加副技能: 2点
      else this.setParam(skill, 1)
    } else if (multiplier === 4) {
      if (totalPoints >= 56) this.setParam(skill, (Math.floor(totalPoints / 16) - 2) * 8 as Point)
        // 56CP = 初期:40 + 主:8 + 副:8
        // 64CP = 初期:40 + 主:16 + 副:8
      else if (totalPoints >= 48) this.setParam(skill, 4) // 追加副技能: 4点
      else this.setParam(skill, 1)
    }
  }

  // 技能テーブルから順に技能を修得
  setSkillLoop(skills: ParameterName[], totalPoints: number, multiplier: Multiplier = 1) {
    // Multiplierが有効な場合、1つ目の技能には必ず振る
    // 能力値が16以上の場合、技能無しで maxLevel に到達してループを無視されるため
    if (multiplier > 1) this.stepParam(skills[0])

    // 上限設定
    let maxPoint = 1
    let maxLevel = 12
    let firstPoint = maxPoint // Multiplierが有効な場合は1つ目の技能に多めに振る
    while (multiplier > 1) {
      maxLevel++
      firstPoint *= 2
      multiplier /= 2
    }

    // ループ開始
    let count = 0
    while (
      this.getParamTotal() < totalPoints // 合計がtotalPointsに達した場合
      && count < 4 // 安全装置 (最大4周) 
    ) {
      skills.map((skill, i) => {
        // 1つの技能を修得して下記条件に達したらループを抜ける
        while (
          this.getParamTotal() < totalPoints // 合計がtotalPointsに達した場合
          && ((i === 0 && this.getParam(skill) < firstPoint) // 1つ目の技能にfirstPoint消費した場合
            || (i > 0 && this.getParam(skill) < maxPoint)) // 1つの技能にmaxPoint消費した場合
          && this.getParamLevel(skill) < maxLevel // 技能値がmaxLevelに達した場合
        ) {
          this.stepParam(skill)
        }
        if (this.getParamTotal() > totalPoints) this.stepParam(skill, -1) // CP総計を越えたら取消
      })
      maxPoint *= 2 // maxPointをシフト
      maxLevel++ // maxLevelをシフト
      count++
    }
  }

  // 技能をオブジェクトとして返す (index 指定で修得優先度の高い技能から取得可能)
  getSkillByPriority(index: number = 0) {
    const skill = TACTIC_TABLE[this.tactic][index]
    const param = this.getParamValue(skill)
    const level = this.getParamLevel(skill)
    return { ...param, level }
  }

  // 装備セットのマップ番号を取得
  getEquipmentSetMap() {
    return [
      0, 1, 0,
      3, 3, 4,
      2, 3, 5
    ][this.tactic]
  }

  // 装備の初期化
  setEquipments(a: number, b: number, totalPoints: number) {
    const e = this.getEquipmentSetMap()
    const table1 = EQUIPMENTS_TABLE[e]
    const len1 = table1.length
    const r = (a + b) % len1
    const table2 = table1[r]
    const len2 = table2.length
    const t = Math.min((totalPoints >= 24 ? 3 : totalPoints >= 16 ? 2 : totalPoints >= 12 ? 1 : 0), len2 - 1)
    const weaponName = table2[t][0]
    const armorName = table2[t][1]
    const missileName = MISSILE_TABLE[this.tactic % 3]
    const skill = this.getParam('武術') > 0 ? '武術' : this.getParam('剣術') > 0 ? '剣術' : ''
    this.setWeapon(weaponName, true, skill)
    this.setBody(armorName)
    if ((Math.floor(this.tactic / 3) === 1 && totalPoints >= 16) || this.tactic === 5) {
      this.setMissile(missileName) // 条件に応じて射撃武器をセット
    }
  }
}

// サンプルキャラクター生成
export function createSamples(totalPoints = 10, multiplier: Multiplier = 1, size = 64, mod = 0) {
  const step = 64 / size // size より step を算出 (実質16固定)
  const samples = []

  for (let n = 0; n < size; n++) {
    const id = n + 1 // 1からカウント (呼び出すときは-1)
    const uid = Math.floor(n * step) + mod // 定数を足してサンプル生成
    const sample = new SampleCharacter(id, uid, totalPoints, multiplier)
    samples.push(sample)
  }

  return samples
}
