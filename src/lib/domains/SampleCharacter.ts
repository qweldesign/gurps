// SampleCharacter.ts

import { type Point, type ParameterName } from './Parameters'
import { type WeaponName, type ArmorName } from './Equipments'
import { Character } from './Character'

const DEFAULT_POINTS = 10

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
const BRANCH_TABLE: [ParameterName, -1 | 1][] = [
  ['敏捷力', -1], // 0:男性 (派生1)
  ['生命力', -1], // 1:男性 (派生2)
  ['筋力', -1], // 2:女性 (派生3)
  ['知力', -1] // 3:女性 (派生4)
]

// 修得技能セット
const TACTIC_TABLE: ParameterName[][] = [
  ['武術', '怪力', '鍛錬', '格闘', '運動', '探索', '修養', '歌唱'], // 0:重戦士
  ['武術', '運動', '探索', '鍛錬', '隠密', '細工', '怪力', '格闘', '軽業', '早業', '修養', '舞踏'], // 1:軽戦士
  ['武術', '水行術', '怪力', '鍛錬', '修養', '礼法', '尋問', '治癒', '運動', '探索'], // 2:術戦士F
  ['剣術', '探索', '運動', '細工', '隠密', '早業', '軽業', '鍛錬', '怪力', '修養', '交渉', '柔術'], // 3:剣士
  ['剣術', '運動', '探索', '隠密', '細工', '軽業', '早業', '交渉', '演技', '尋問', '鑑定', '柔術'], // 4:盗賊
  ['弓術', '探索', '運動', '細工', '隠密', '早業', '軽業', '修養', '交渉', '柔術', '治癒', '演奏'], // 5:弓使い
  ['火行術', '修養', '武術', '礼法', '演技', '歴史', '怪力', '鍛錬', '探索', '運動'], // 6:術戦士B
  ['木行術', '修養', '剣術', '礼法', '交渉', '探索', '運動', '鍛錬', '水行術', '鑑定', '治癒', '歴史'], // 7:術剣士
  ['金行術', '土行術', '修養', '礼法', '交渉', '尋問', '演技', '探索', '運動', '鑑定', '治癒', '歴史'] // 8:術士
]

// 装備セット
// 最貧, 貧弱, 普通, 強靭の最大4段階
const EQUIPMENTS_TABLE: [WeaponName, ArmorName][][][] = [
  [ // 重戦士, 術戦士
    [['ショートソード', '革服'], ['バスタードソード', '革鎧'], ['バスタードソード', 'ブリガンディ'], ['バスタードソード', 'プレイトメイル']],
    [['ショートソード', '革服'], ['蒼龍刀', '革鎧'], ['蒼龍刀', 'ブリガンディ'], ['蒼龍刀', 'プレイトメイル']],
    [['鎚槌', '革鎧'], ['戦鎚', 'ブリガンディ'], ['戦鎚', 'ブリガンディ'], ['戦鎚', 'プレイトメイル']],
    [['手斧', '革鎧'], ['戦斧', 'ブリガンディ'], ['戦斧', 'ブリガンディ'], ['戦斧', 'プレイトメイル']]
  ],
  [ // 軽戦士
    [['ショートソード', '革服'], ['バスタードソード', '革鎧'], ['グレートソード', 'チェインメイル'], ['グレートソード', 'ブリガンディ']],
    [['ショートソード', '革服'], ['蒼龍刀', '革鎧'], ['蒼龍刀', 'チェインメイル'], ['蒼龍刀', 'ブリガンディ']],
    [['長槍', '革服'], ['薙刀', '革鎧'], ['薙刀', 'チェインメイル'], ['薙刀', 'ブリガンディ']],
    [['長槍', '革服'], ['鉾槍', '革鎧'], ['鉾槍', 'チェインメイル'], ['鉾槍', 'ブリガンディ']]
  ],
  [ // 剣士, 盗賊, 術剣士
    [['ダガー', '服'], ['レイピア', '革服'], ['レイピア', '革鎧']],
    [['ショートソード', '服'], ['ロングソード', '革服'], ['ロングソード', '革鎧']],
    [['ショートソード', '服'], ['三日月刀', '革服'], ['三日月刀', '革鎧']],
    [['鎚槌', '革服'], ['鎚槌', '革鎧']],
    [['手斧', '革服'], ['手斧', '革鎧']],
    [['長槍', '服'], ['長槍', '革服'], ['長槍', '革鎧']]
  ],
  [ // 弓使い
    [['長弓', '服'], ['長弓', '革服'], ['長弓', '革鎧']]
  ],
  [ // 術士
    [['杖', '服'], ['杖', '革服'], ['杖', '革鎧']]
  ],
]

// 名前 (PC用)
/*const PC_LIST: string[] = [
  'アントニオ', 'ウィリアム', 'カイル', 'カーター', 'クリストファー', 'ザビエル',
  'ジェームス', 'ジェイコブ', 'ジョシュア', 'セス', 'タイラー',
  'チャールズ', 'ディラン', 'トリスタン', 'ナサニエル', 'ノア', 'ビクター',
  'ヘンリー', 'ミゲル', 'ライリー', 'ローガン', 'ワイアット',
  'アメリア', 'アンナ', 'エミリー', 'エリー', 'キャサリン', 'グレイシー',
  'クロエ', 'サラ', 'ジェンナ', 'ジャスミン', 'ジュリア', 
  'ソフィ', 'トリニティ', 'ハンナ', 'ビクトリア', 'マデレン', 'マリッサ',
  'ミーガン', 'メアリー', 'リリアン', 'レベッカ', 'ローレン'
]*/

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
  public tactic: number // 技能修得や装備選択、自動行動時のロジックタイプ

  constructor(id: number, uid: number, totalPoints: number = 10) {
    const A = ABILITY_TABLE.length // 16
    const i = Math.max(Math.min(uid, 63), 0) // 最大値・最小値指定
    const r1 = Math.floor(i / A) * A
    const r2 = Math.floor(i / A) * A / 4
    const r3 = i % A
    const r = r1 + (r2 + r3) % A // 順序調整
    const a = r % A // 基本能力値
    const b = Math.floor(i / A) % 4 // 能力値修正 (派生)
    const g = Math.floor(b / 2) // 性別

    // ID・名前・性別・能力値・装備の初期化
    const name = NPC_LIST[i]
    const gender = g ? '女性' : '男性'
    const abilities = ABILITY_TABLE[a]
    super(id, name, gender, abilities, null)

    // 能力値の修正
    const branch = BRANCH_TABLE[b]
    this.stepParam(branch[0], branch[1])
    if (this.getParamTotal() > DEFAULT_POINTS - 1) {
      this.stepParam(branch[0], -1) // CP総計-1を越えたら取消
    }
    this.tactic = this.getTactic() // ロジックタイプを判定

    // 技能セットの選択
    this.setSkills(totalPoints, DEFAULT_POINTS)

    // 装備セットの選択
    this.setEquipments(a, b, totalPoints)
  }

  // 技能修得や装備選択、自動行動時のロジックタイプを設定
  getTactic(): number {
    const str = this.getParamLevel('筋力')
    const dex = this.getParamLevel('敏捷力')
    const int = this.getParamLevel('知力')
    const ht = this.getParamLevel('生命力')
    if (str > 11) {
      if (int > 10) return 2 // 術戦士F
      else if (dex > 10) return 1 // 軽戦士
      else return 0 // 重戦士
    } else if (dex > 11) {
      if (int > 10 && str > 9) return 5 // 弓使い
      else if (int > 11) return 7 // 術剣士
      else if (str > 9 && ht > 9) return 3 // 剣士
      else return 4 // 盗賊
    } else if (int > 11) {
      if (str > 10 ) return 6 // 術戦士B
      else if (dex > 10) return 7 // 術剣士
      else return 8 // 術士
    } else if (dex > 10) {
      if (int > 10) return 5 // 弓使い
      else if (str === dex) return 1 // 軽戦士
      else return 3 // 剣士
    } else {
      if (str > 10 && int > 10) return 6 // 術戦士B
      else if (str > 10) return 0 // 重戦士
      else if (str > 9 && dex > 9) return 7 // 術剣士
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
  setSkills(totalPoints: number, defaultPoints: number = 10) {
    const skills = TACTIC_TABLE[this.tactic]

    if (totalPoints > defaultPoints) {
      // Point総計が10より多い場合は主技能を切り分ける
      const [main, ...other] = skills
      this.setMainSkill(main, totalPoints)
      this.setSkillLoop(other, totalPoints)
    } else {
      // Point総計が10以下の場合は主技能を切り分けない
      this.setSkillLoop(skills, totalPoints)
    }
  }

  // Points合計に対して主技能を設定
  setMainSkill(skill: ParameterName, totalPoints: number) {
    if (totalPoints >= 32) this.setParam(skill, Math.floor(totalPoints / 16) * 8 as Point)
    else if (totalPoints >= 24) this.setParam(skill, 8)
    else if (totalPoints >= 16) this.setParam(skill, 4)
    else if (totalPoints >= 12) this.setParam(skill, 2)
    else this.setParam(skill, 1)
  }

  // 技能テーブルから順に技能を修得
  setSkillLoop(skills: ParameterName[], totalPoints: number) {
    let maxPoint = 1
    let maxLevel = 12
    let count = 0
    while (
      this.getParamTotal() < totalPoints // 合計がtotalPointsに達した場合
      && count < 4 // 安全装置 (最大4周) 
    ) {
      skills.map((skill) => {
        // 1つの技能を修得して下記条件に達したらループを抜ける
        while (
          this.getParamTotal() < totalPoints // 合計がtotalPointsに達した場合
          && this.getParam(skill) < maxPoint // 1つの技能にmaxPoint消費した場合
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
      2, 2, 3,
      0, 2, 4
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
    const skill = this.getParam('武術') > 0 ? '武術' : this.getParam('剣術') > 0 ? '剣術' : ''
    this.setWeapon(weaponName, true, skill)
    this.setBody(armorName)
  }
}
