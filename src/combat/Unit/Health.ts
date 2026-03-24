// Health.ts

import { CombatUnit as Unit } from "../Unit"

export class UnitHealth {
  private self: Unit
  public _injury: number // 負傷 (HPの減少)
  public stunned: boolean // 朦朧状態
  public confused: boolean // 精神朦朧
  public unconscious: boolean // 気絶
  public dead: boolean // 死亡
  public injuryOnArm: boolean // 腕・手首の故障
  public injuryOnLeg: boolean // 脚・足首の故障
  public blinded: boolean // 目の故障
  public deafened: boolean // 耳の故障
  public burning: boolean // 火だるま
  public dazzled: boolean // 眩しい
  public puppeted: boolean // 傀儡

  constructor(self: Unit) {
    this.self = self
    this._injury = 0
    this.stunned = false
    this.confused = false
    this.unconscious = false
    this.dead = false
    this.injuryOnArm = false
    this.injuryOnLeg = false
    this.blinded = false
    this.deafened = false
    this.burning = false
    this.dazzled = false
    this.puppeted = false
  }

  // ダメージ効果 (判定不要の処理はここで解決する)
  set injury(newInjury: number) {
    // ダメージ算出
    const dmg = newInjury - this._injury
    // ダメージが最大HPの半分以上の場合, 自動的に朦朧状態に陥る
    if (dmg >= this.self.maxHP / 2) {
      this.stunned = true
    }

    // 負傷が最大HPに達した場合, 自動的に気絶する
    if (newInjury >= this.self.maxHP) {
      this.unconscious = true
      this.self.position = 'back' // 戦線から外す
      this.self.posture = 'prone' // 姿勢変更
    }

    // メンバ変数を更新
    this._injury = newInjury
  }

  get injury() {
    return this._injury
  }
}
