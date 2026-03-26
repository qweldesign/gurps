// Defense.ts

import { type AttackKey, type DefanseKey } from '../../domains/Equipments'
import { type CombatAttackModels as AttackModels, type CombatDefenseModel as DefenseModel, type CombatDefenseModels as DefenseModels, CombatUnit as Unit } from '../Unit'
import { type Feint } from './Attack'

export class UnitDefense {
  private self: Unit
  private models: DefenseModels
  public parryTarget: number //「受け」目標値
  public blockTarget: number //「止め」目標値
  public dodgeTarget: number //「よけ」目標値
  private _canParry: boolean //「受け」可能な武器の所有
  private _canBlock: boolean //「止め」可能な盾の所有
  public parryCount: number //「受け」試行回数
  public blockCount: number //「止め」試行回数
  public isFullDefense: boolean //「全力防御」選択中
  public ev: number //「よけ」基本値
  public pre: number // 身体抵抗値
  public mre: number // 精神抵抗値

  constructor(self: Unit, attacks: AttackModels, defenses: DefenseModels, ev: number, pre: number, mre: number) {
    this.self = self
    this.models = defenses
    this.parryTarget = ev + attacks.main.ev
    this.blockTarget = ev + attacks.shield.ev
    this.dodgeTarget = ev - defenses.body.wt
    this._canParry = attacks.main.ev > 0
    this._canBlock = attacks.shield.ev > 0
    this.parryCount = 0
    this.blockCount = 0
    this.isFullDefense = false
    this.ev = ev
    this.pre = pre
    this.mre = mre
  }

  nextTurn() {
    this.parryCount = 0
    this.blockCount = 0
    this.isFullDefense = false
  }

  // 攻撃キーの変更 (装備変更)
  changeAttackKey(attacks: AttackModels, key: AttackKey) {
    this.parryTarget = this.ev + attacks[key].ev
    this._canParry = attacks[key].ev > 0

    // 盾を攻撃に用いる場合,「止め」不能になる
    if (key === 'shield') {
      this._canBlock = false
    } else {
      this._canBlock = attacks.shield.ev > 0
    }
  }

  //「受け」可能な状態か否かを返す
  get canParry(): boolean {
    return this._canParry && this.parryCount < (this.isFullDefense ? 2 : 1) && this.self.attack.ready === 0
  }

  //「止め」可能な状態か否かを返す
  get canBlock(): boolean {
    return this._canBlock && this.blockCount < (this.isFullDefense ? 2 : 1)
  }

  // 可能な防御のうちで, 最も成功率の高い防御の目標値を取得
  get target(): number {
    let target
    if (this.canBlock) {
      target = this.blockTarget
    } else if (this.canParry) {
      target = this.parryTarget
    } else {
      target = this.dodgeTarget
    }
    return Math.max(target, 4)
  }

  // 朦朧状態, 牽制のターゲットの場合に, ペナルティを引いた目標値を返す
  getTarget(feint: Feint | null) {
    let target = this.target
    if (this.self.health.stunned) target -= 4 // 朦朧状態による修正
    if (feint && feint.target === this.self) target -= feint.score // 牽制のターゲットの場合の修正
    return Math.max(target, 4)
  }

  // 胴防御モデルを取得
  get body(): DefenseModel {
    return this.models.body
  }

  // 頭防御モデルを取得
  get head(): DefenseModel {
    return this.models.head
  }

  // 腕防御モデルを取得
  get arm(): DefenseModel {
    return this.models.arm
  }

  // 脚防御モデルを取得
  get leg(): DefenseModel {
    return this.models.leg
  }

  // 防御キーを指定して防御モデルを取得
  getModel(key: DefanseKey = 'body'): DefenseModel {
    if (key === 'head') return this.head
    else if (key === 'arm') return this.arm
    else if (key === 'leg') return this.leg
    else return this.body
  }

  // 防御キーとダメージ型を指定してダメージ抵抗を取得
  getDR(key: DefanseKey = 'body', dmgType: number = 0) {
    const model = this.getModel(key)
    return dmgType === 2 ? model.tdr : model.sdr
  }
}
