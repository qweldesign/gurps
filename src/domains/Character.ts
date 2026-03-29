// Character.ts

import { type Point, type ParameterKey, type Parameter, Parameters } from './Parameters'

type CharacterModel = {
  id: number
  name: string
  gender: string
  points: Point[]
}

// キャラクターを司るクラス
export class Character {
  public id: number
  public name: string
  public gender: string
  protected parameters: Parameters

  constructor(model: CharacterModel) {
    const { id, name, gender, points } = model
    this.id = id
    this.name = name
    this.gender = gender
    this.parameters = new Parameters(points)
  }

  // name と size を指定し, Point を増減
  // Map に無ければ追加し, 最小値(0)になれば削除する
  stepParam(name: ParameterKey, size: number = 1) {
    this.parameters.step(name, size)
  }

  // name を指定し, Point を取得
  getParam(name: ParameterKey): Point {
    return this.parameters.get(name)
  }

  // name を指定し, level を算出
  // includeWeight オプションにて胴防具の重量を加味
  getParamLevel(name: ParameterKey): number {
    return this.parameters.getLevel(name)
  }

  // name を指定し, その全ての属性を, オブジェクトに変換して取得
  getParamValue(name: ParameterKey): Parameter {
    return this.parameters.getValue(name)
  }

  // 全てのパラメータとその全ての属性を, オブジェクトの配列に変換して取得 (ソート込み)
  get params() {
    return this.parameters.params
  }

  // 全ての技能とその全ての属性を, オブジェクトの配列に変換して取得 (ソート込み)
  get skills() {
    return this.parameters.skills
  }

  // Point 総計を算出
  get total(): number {
    return this.parameters.total
  }

  // 主技能 (level が最も高いか Point 消費が最も多い技能) を取得
  // 無ければ「武術」を返す
  get mainSkill(): Parameter {
    if (this.skills.length) {
      const sorted = this.skills.sort((a, b) => {
        return b.level === a.level ? b.point - a.point : b.level - a.level
      })
      return sorted[0]
    } else {
      return {
        name: '武術', id: 4, base: '筋力', point: 0, level: this.getParamLevel('筋力') - 2
      }
    }
  }

  // 最大Hpを取得
  get maxHp() {
    return this.getParamLevel('鍛錬') * 2
  }

  // ダメージ修正を取得
  get dmgModifier() {
    return Math.floor(this.getParamLevel('怪力') / 2) - 5
  }

  //「よけ」を取得
  get DEV() {
    return Math.floor(this.getParamLevel('運動') / 2) + 5
  }

  // 身体抵抗値を取得
  get PRE() {
    return this.getParamLevel('生命力')
  }

  // 精神抵抗値を取得
  get MRE() {
    return this.getParamLevel('修養')
  }
}
