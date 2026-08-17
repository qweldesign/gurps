// Combat/Unit/Health.ts

import { CombatUnit as Unit } from '../Unit'

export class CombatUnitHealth {
  private self: Unit
  public maxHp: number
  private _injury: number // 負傷 (HPの減少)
  private _stunned: boolean // 朦朧状態
  public unconscious: boolean // 気絶
  public dead: boolean // 死亡
  public confused: boolean // 精神朦朧
  public injuryOnArm: boolean // 腕・手首の故障
  public injuryOnLeg: boolean // 脚・足首の故障
  public blinded: boolean // 目の故障
  public deafened: boolean // 耳の故障
  public burning: boolean // 火だるま
  public dazzled: boolean // 眩しい
  public puppeted: boolean // 傀儡

  constructor(self: Unit, maxHp: number) {
    this.self = self
    this.maxHp = maxHp
    this._injury = 0
    this._stunned = false
    this.unconscious = false
    this.dead = false
    this.confused = false
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
    const dmg = newInjury - this._injury
    // 一撃のダメージが最大HPの半分以上の場合, 自動的に朦朧状態に陥る
    if (dmg >= this.maxHp / 2) {
      this.stunned = true
    }

    // 負傷が最大HPに達した場合, 自動的に気絶する
    if (newInjury >= this.maxHp) {
      this.unconscious = true
      this.self.position = 'back' // 戦線から外す
      this.self.posture = 'prone' // 姿勢変更
    }

    this._injury = newInjury
  }

  get injury() {
    return this._injury
  }

  // 朦朧状態への代入 (新たに true になろうとする代入のみ, 痛覚鈍麻状態の間はブロックする. false への代入 (回復) は常に通す)
  set stunned(value: boolean) {
    if (value && this.self.statusEffects.resistant) return
    this._stunned = value
  }

  get stunned() {
    return this._stunned
  }

  // Hp
  get Hp() {
    return Math.max(this.maxHp - this._injury, 0)
  }

  // 状態 (残りHP比率によるUI表示用の段階. stunned/unconscious とは別の判定軸)
  get condition() {
    const ratio = this.Hp / this.maxHp
    if (ratio === 0) return 'unconscious'
    else if (ratio < 1 / 3) return 'stunned'
    else if (ratio < 2 / 3) return 'injured'
    else return 'normal'
  }

  // Summary 表示用ラベル取得 (深刻度が高い状態を優先して1つ返す)
  get label(): string {
    if (this.dead) return '死亡'
    if (this.unconscious) return '気絶'
    if (this.stunned) return '朦朧状態'
    if (this.puppeted) return '傀儡'
    if (this.blinded) return '盲目'
    if (this.injuryOnArm) return '腕故障'
    if (this.injuryOnLeg) return '脚故障'
    if (this.deafened) return '聾'
    if (this.burning) return '火だるま'
    if (this.dazzled) return '眩しい'
    if (this.confused) return '混乱'
    return ''
  }
}
