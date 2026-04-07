// Combat/Unit/Health.ts

export class CombatUnitHealth {
  public maxHp: number
  public injury: number // 負傷 (HPの減少)

  constructor(maxHp: number) {
    this.maxHp = maxHp
    this.injury = 0
  }

  // Hp
  get Hp() {
    return Math.max(this.maxHp - this.injury, 0)
  }

  // 状態
  get condition() {
    const ratio = this.Hp / this.maxHp
    if (ratio === 0) return 'unconscious'
    else if (ratio < 1 / 3) return 'stunned'
    else if (ratio < 2 / 3) return 'injured'
    else return 'normal'
  }
}
