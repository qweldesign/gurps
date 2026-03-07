// SampleCharacter.ts

import { type Point, type ParameterName, type Parameter } from './Parameters'
import { type WeaponName, type ArmorName } from './Equipments'
import { Character } from './Character'

const DEFAULT_POINTS = 10

// 基本能力値
const ABILITY_TABLE: Point[][] = [
  [  8,   0,   0,   1], //  0:戦士 | ST特化
  [  4,   4,   0,   1], //  1:戦士 | DX+HT-
  [  4,   2,   0,   2], //  2:戦士 | 標準
  [  4,   2,   1,   2], //  3:戦士 | IN+
  [  4,   0,   4,   1], //  4:術戦士 | 標準
  [  4,   1,   2,   2], //  5:術戦士 | IN-DX+HT+
  [  2,   4,   1,   2], //  6:剣士 | IN+HT+
  [  2,   4,   0,   2], //  7:剣士 | HT+
  [  2,   4,   0,   1], //  8:剣士 | 標準
  [  2,   4,   1,   1], //  9:剣士 | IN+
  [  1,   4,   1,   2], // 10:剣士 | ST-IN+HT+
  [0.5,   8,   0, 0.5], // 11:剣士 | DX特化
  [  0,   8, 0.5, 0.5], // 12:弓使い | DX特化
  [  1,   4,   1,   2], // 13:弓使い | IN-ST+HT+
  [  1,   4,   2,   1], // 14:弓使い | ST+
  [  0,   4,   2,   1], // 15:弓使い | 標準
  [  0,   4,   2,   2], // 16:弓使い | HT+
  [  1,   4,   2,   2], // 17:弓使い | ST+HT+
  [  2,   1,   4,   2], // 18:術戦士 | ST-DX+HT+
  [  4,   0,   4,   1], // 19:術戦士 | 標準
  [  1,   2,   4,   2], // 20:術士 | ST+
  [  0,   2,   4,   2], // 21:術士 | 標準
  [  0,   4,   4,   1], // 22:術士 | DX+HT-
  [  0,   0,   8,   1]  // 23:術士 | IN特化
]

// 能力値修正 (派生)
const BRANCH_TABLE: [ParameterName, -1 | 1][] = [
  ['筋力', 1], // 0:男性 (派生1)
  ['知力', 1], // 1:男性 (派生2)
  ['敏捷力', 1], // 2:女性 (派生3)
  ['生命力', 1] // 3:女性 (派生4)
]

// 修得技能セット
const TACTIC_TABLE: ParameterName[][] = [
  ['武術', '怪力', '鍛錬', '格闘', '運動', '探索', '修養', '歌唱'], // 0:重戦士
  ['武術', '運動', '探索', '鍛錬', '隠密', '軽業', '怪力', '格闘', '修養', '歌唱'], // 1:軽戦士
  ['武術', '水行術', '怪力', '鍛錬', '格闘', '修養', '礼法', '尋問', '治癒'], // 2:術戦士(ST)
  ['剣術', '運動', '探索', '細工', '早業', '鍛錬', '怪力', '隠密', '軽業', '舞踏'], // 3:剣士(ST)
  ['剣術', '運動', '探索', '細工', '早業', '礼法', '歴史', '隠密', '軽業', '鍛錬'], // 4:剣士(IN)
  ['剣術', '運動', '探索', '細工', '早業', '隠密', '軽業', '鍛錬', '柔術', '舞踏'], // 5:剣士(BL)
  ['弓術', '探索', '運動', '隠密', '軽業', '細工', '早業', '修養', '柔術', '演奏'], // 6:弓使い(BL)
  ['弓術', '探索', '運動', '隠密', '軽業', '怪力', '細工', '早業', '修養', '演奏'], // 7:弓使い(ST)
  ['弓術', '探索', '運動', '隠密', '軽業', '交渉', '治癒', '修養', '細工', '早業'], // 8:弓使い(IN)
  ['火行術', '修養', '武術', '交渉', '演技', '歴史', '怪力', '鍛錬', '格闘'], // 9:術戦士(IN)
  ['木行術', '修養', '礼法', '交渉', '鑑定', '水行術', '探索', '運動', '尋問', '演技'], // 10:術士
  ['金行術', '土行術', '修養', '礼法', '交渉', '鑑定', '治癒', '歴史', '尋問', '演技'] // 11:術士
]

// 装備セット
// 最貧, 貧弱, 普通, 強靭の最大4段階
const EQUIPMENTS_TABLE: [WeaponName, ArmorName][][][] = [
  [ // 重戦士
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
  [ // 剣士
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

// 名前
const NAME_LIST: string[] = [
  'アーロン', 'アイゼア', 'アントニオ', 'アンドリュー', 'イアン', 'ウィリアム', 'エリック', 'オーウェン', //'カーター',
  'カイル', 'ギャレット', 'クーパー', 'クリストファー', 'ケヴィン', 'コール', 'ザビエル', 'サム', //'ジェイコブ',
  'ジェイデン', 'ジェームス', 'ジェレミア', 'ショーン', 'ジョシュア', 'ジョセフ', 'スティーブン', 'セス', //'タイラー',
  'ダニエル', 'チェイス', 'チャールズ', 'ディビッド', 'ティモシー', 'ディラン', 'トーマス', 'ドミニク', //'トリスタン',
  'ナサニエル', 'ニコラス', 'ネイサン', 'ノア', 'パーカー', 'パトリック', 'ビクター', 'ブライアン', //'ヘンリー',
  'マシュー', 'ミゲル', 'メイソン', 'ライアン', 'ライリー', 'リチャード', 'ルイス', 'ローガン', //'ワイアット',
  'アシュリン', 'アビー', 'アメリア', 'アリアナ', 'アリシア', 'アンナ', 'イザベラ', 'エマ', //'エミリー',
  'エリー', 'オードリー', 'オリビア', 'キャサリン', 'キャロライン', 'クレア', 'グレイシー', 'グレース', //'クロエ',
  'ケイト', 'サラ', 'ジェシカ', 'シエラ', 'ジェンナ', 'シドニー', 'シャーロット', 'ジャスミン', //'ジュリア',
  'ステファニー', 'ゾーィ', 'ソフィ', 'ダニエル', 'ディスティニー', 'トリニティ', 'ナタリー', '二コール', //'ハンナ',
  'ビクトリア', 'ブルック', 'ペイジ', 'マデレン', 'マヤ', 'マリア', 'マリッサ', 'ミア', //'ミーガン',
  'ミッシェル', 'メアリー', 'メリッサ', 'リア', 'リリアン', 'リリー', 'レイチェル', 'レベッカ', //'ローレン'
]

export class SampleCharacter extends Character {
  public tactic: number // 技能修得や自動行動時のロジックタイプ

  constructor(id: number, uid: number, totalPoints: number = 10) {
    const A = ABILITY_TABLE.length // 24
    const N = NAME_LIST.length // 96
    const i = uid
    const r = (i % 4) * 6 + Math.floor(i / 4) // 順序調整
    const a = r % A // 基本能力値
    const b = Math.floor(i / A) % 4 // 能力値修正 (派生)
    const g = Math.floor(b / 2) // 性別
    const p = Math.floor(a / 6) // 0: 戦士, 1: 剣士, 2: 弓使い(フリー), 3: 術士

    // ID・名前・性別・配置・能力値・装備の初期化
    const name = NAME_LIST[i % N]
    const gender = g ? '女性' : '男性'
    const abilities = ABILITY_TABLE[a]
    super(id, name, gender, p, abilities, null)

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

  // 技能修得や自動行動時のロジックタイプを設定
  getTactic(): number {
    const str = this.getParamLevel('筋力')
    const dex = this.getParamLevel('敏捷力')
    const int = this.getParamLevel('知力')
    if (str > 11) {
      if (int >= 11) return 2 // 術戦士(ST)
      else if (dex >= 11) return 1 // 軽戦士
      else return 0 // 重戦士
    } else if (int > 11) {
      if (str >= 11 ) return 9 // 術戦士(IN)
      else if (dex >= 11) return 10 // 術士
      else return 11 // 術士
    } else if (dex > 11) {
      if (this.position <= 1) {
        if (str >= 11) return 3 // 剣士(ST)
        else if (int >= 11) return 4 // 剣士(IN)
        return 5 // 剣士(BL)
      } else {
        if (str >= 11) return 7 // 弓使い(ST)
        else if (int >= 11) return 8 // 弓使い(IN)
        return 6 // 弓使い(BL)
      }
    } else {
      if (str >= 11 && int >= 11 && this.position <= 1) return 2 // 術戦士(ST)
      else if (str >= 11 && int >= 11 && this.position > 1) return 9 // 術戦士(IN)
      else if (str >= 11) return 1 // 軽戦士
      else if (int >= 11) return 10 // 術士
      else if (this.position <= 1) return 5 // 剣士(BL)
      else return 6 // 弓使い(BL)
    }
  }

  // ロジックタイプ名を取得 (デバッグ用)
  getTacticName() {
    return [
      '重戦士', '軽戦士', '術戦士',
      '剣士', '剣士', '盗賊',
      '盗賊', '弓使い', '弓使い',
      '術戦士', '術士', '術士'
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
      2, 2, 2,
      3, 3, 3,
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
