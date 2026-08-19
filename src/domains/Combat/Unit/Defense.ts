// Defense.ts

import { type WeaponSlotKey, type ArmorSlotKey } from '../../Equipments'
import { type Aim } from '../Action/types'
import { POSTURE_MODS, type CombatAttackModels as AttackModels, type CombatDefenseModel as DefenseModel, type CombatDefenseModels as DefenseModels, CombatUnit as Unit } from '../Unit'

export class CombatUnitDefense {
  private self: Unit
  private models: DefenseModels
  public _parryTarget: number //「受け」目標値
  public _blockTarget: number //「止め」目標値
  public _dodgeTarget: number //「よけ」目標値
  private _canParry: boolean //「受け」可能な武器の所有
  private _canBlock: boolean //「止め」可能な盾の所有
  public parryCount: number //「受け」試行回数
  public blockCount: number //「止め」試行回数
  public isFullAttackTurn: boolean //「全力攻撃」選択ターン
  public isFullAttack: boolean //「全力攻撃」可否
  public isFullDefenseTurn: boolean //「全力防御」選択ターン
  public isFullDefense: boolean //「全力防御」可否
  public ev: number //「よけ」基本値
  public pre: number // 身体抵抗値
  public mre: number // 精神抵抗値

  constructor(self: Unit, attacks: AttackModels, defenses: DefenseModels, ev: number, pre: number, mre: number) {
    this.self = self
    this.models = defenses
    this._parryTarget = ev + attacks.main.ev
    this._blockTarget = ev + attacks.shield.ev
    this._dodgeTarget = ev - defenses.body.wt
    this._canParry = attacks.main.ev > 0
    this._canBlock = attacks.shield.ev > 0
    this.parryCount = 0
    this.blockCount = 0
    this.isFullAttackTurn = false
    this.isFullAttack = false
    this.isFullDefenseTurn = false
    this.isFullDefense = false
    this.ev = ev
    this.pre = pre
    this.mre = mre
  }

  nextTurn() {
    this.parryCount = 0
    this.blockCount = 0
    // このターンに全力攻撃を選択したなら, 全力攻撃を true に変更
    this.isFullAttack = this.isFullAttackTurn
    this.isFullAttackTurn = false
    // このターンに全力防御を選択したなら, 全力防御を true に変更
    this.isFullDefense =  this.isFullDefenseTurn
    this.isFullDefenseTurn = false
  }

  // 攻撃キーの変更 (装備変更)
  changeWeaponSlotKey(attacks: AttackModels, key: WeaponSlotKey) {
    this._parryTarget = this.ev + attacks[key].ev
    this._canParry = attacks[key].ev > 0

    // 盾を攻撃に用いる場合,「止め」不能になる
    if (key === 'shield') {
      this._canBlock = false
    } else {
      this._canBlock = attacks.shield.ev > 0
    }
  }

  get parryTarget() {
    let target = this._parryTarget + this.self.statusBuff.ev // 回避UPバフ (ヘイスト)
    if (this.self.posture === 'prone') {
      target -= 4 // 転倒状態による修正
    } else {
      target += POSTURE_MODS[this.self.posture].defenseMod // 姿勢による修正
      target += this.self.health.stunned ? -4 : 0 // 朦朧状態による修正 (転倒による修正とは重複しない)
    }
    target += this.self.statusEffects.flashed > 0 ? -2 : 0 // 目くらみによる回避判定ペナルティ (「閃光」)
    target += this.self.health.blinded ? -6 : 0 // 目の故障による防御判定ペナルティ
    target += this.self.health.deafened ? -1 : 0 // 耳の故障による防御判定ペナルティ
    return target
  }

  get blockTarget() {
    let target = this._blockTarget + this.self.statusBuff.ev // 回避UPバフ (ヘイスト)
    if (this.self.posture === 'prone') {
      target -= 4 // 転倒状態による修正
    } else {
      target += POSTURE_MODS[this.self.posture].defenseMod // 姿勢による修正
      target += this.self.health.stunned ? -4 : 0 // 朦朧状態による修正 (転倒による修正とは重複しない)
    }
    target += this.self.statusEffects.flashed > 0 ? -2 : 0 // 目くらみによる回避判定ペナルティ (「閃光」)
    target += this.self.health.blinded ? -6 : 0 // 目の故障による防御判定ペナルティ
    target += this.self.health.deafened ? -1 : 0 // 耳の故障による防御判定ペナルティ
    return target
  }

  get dodgeTarget() {
    let target = this._dodgeTarget + this.self.statusBuff.ev // 回避UPバフ (ヘイスト)
    if (this.self.posture === 'prone') {
      target -= 4 // 転倒状態による修正
    } else {
      target += POSTURE_MODS[this.self.posture].defenseMod // 姿勢による修正
      target += this.self.health.stunned ? -4 : 0 // 朦朧状態による修正 (転倒による修正とは重複しない)
    }
    target += this.self.statusEffects.flashed > 0 ? -2 : 0 // 目くらみによる回避判定ペナルティ (「閃光」)
    target += this.self.health.blinded ? -6 : 0 // 目の故障による防御判定ペナルティ
    target += this.self.health.deafened ? -1 : 0 // 耳の故障による防御判定ペナルティ
    return target
  }

  //「受け」可能な状態か否かを返す
  get canParry(): boolean {
    return !this.isFullAttack && this._canParry && this.parryCount < (this.isFullDefense ? 2 : 1) && this.self.attack.ready === 0
  }

  //「止め」可能な状態か否かを返す
  get canBlock(): boolean {
    return !this.isFullAttack && this._canBlock && this.blockCount < (this.isFullDefense ? 2 : 1)
  }

  //「よけ」可能な状態か否かを返す
  get canDodge(): boolean {
    return !this.isFullAttack
  }

  // 可能な防御のうちで, 最も成功率の高い防御の目標値を取得
  // 牽制のターゲットの場合, 射撃の場合による修正までは含めない
  // 尚, 転倒 (這い) による修正と朦朧状態による修正は重複しない
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

  // 牽制のターゲットの場合, 射撃の場合に, ペナルティを引いた目標値を返す
  // 「受け」
  getParryTarget(actor: Unit) {
    let target = this.parryTarget
    // 後で牽制のターゲットによる修正を追記
    target += actor.attack.model.isMissile ? -4 : 0 // 射撃による修正
    return Math.max(target, 4)
  }
  
  // 「止め」
  getBlockTarget(actor: Unit) {
    let target = this.blockTarget
    // 後で牽制のターゲットによる修正を追記
    target += actor.attack.model.isMissile ? -2 : 0 // 射撃による修正
    return Math.max(target, 4)
  }
  
  // 「よけ」
  getDodgeTarget() {
    let target = this.dodgeTarget
    // 後で牽制のターゲットによる修正を追記
    return Math.max(target, 4)
  }

  getCanBlock(aim: Aim) {
    const shieldSize = this.self.attack.getModelByKey('shield').ev
    return this.canBlock && ((
      aim !== 'leg' && aim !== 'foot') // 脚・足首狙い以外なら盾の大きさは問わない
      || (aim === 'leg' && shieldSize > 2) // 脚狙いなら中盾以上
      || (aim === 'foot' && shieldSize > 3) // 足首狙いなら大盾
    )
  }

  // 可能な防御のうちで, 最も成功率の高い防御の目標値を取得 (表示用)
  // actor が自身に牽制を成功させている場合, その分の修正も反映する (judgeDefense と同じ優先順・同じ計算)
  getTarget(actor: Unit, aim: Aim) {
    let target
    if (this.getCanBlock(aim)) {
      target = this.getBlockTarget(actor)
    } else if (this.canParry) {
      target = this.getParryTarget(actor)
    } else {
      target = this.getDodgeTarget()
    }
    const feint = actor.attack.feint
    const feintScore = (feint && feint.target === this.self) ? feint.score : 0
    return target - feintScore
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
  getModelByKey(key: ArmorSlotKey = 'body'): DefenseModel {
    if (key === 'head') return this.head
    else if (key === 'arm') return this.arm
    else if (key === 'leg') return this.leg
    else return this.body
  }

  // 防御キーとダメージ型を指定してダメージ抵抗を取得
  getDR(key: ArmorSlotKey = 'body', dmgType: number = 0) {
    const model = this.getModelByKey(key)
    const base = dmgType === 2 ? model.tdr : model.sdr
    return base + this.self.statusBuff.dr // 防御UPバフ (水舞)
  }
}
