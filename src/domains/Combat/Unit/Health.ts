// Combat/Unit/Health.ts

import { CombatUnit as Unit } from '../Unit'

export class CombatUnitHealth {
  private self: Unit
  public maxHp: number
  private _injury: number // 負傷 (HPの減少)
  public stunned: boolean // 朦朧状態
  public unconscious: boolean // 気絶
  public dead: boolean // 死亡

  constructor(self: Unit, maxHp: number) {
    this.self = self
    this.maxHp = maxHp
    this._injury = 0
    this.stunned = false
    this.unconscious = false
    this.dead = false
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
}
