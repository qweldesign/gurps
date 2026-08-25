// Combat/Unit/Health.ts

import { CombatUnit as Unit } from '../Unit'

// 「時間遡行」用のスナップショット (可変な状態のみを持つ. ev/pre/mre等の固定値は含まない)
export type CombatUnitHealthSnapshot = {
  injury: number
  stunned: boolean
  unconscious: boolean
  dead: boolean
  injuryOnArm: boolean
  injuryOnLeg: boolean
  blinded: boolean
  deafened: boolean
  burning: boolean
  puppeted: boolean
}

export class CombatUnitHealth {
  private self: Unit
  public maxHp: number
  private _injury: number // 負傷 (HPの減少)
  private _stunned: boolean // 朦朧状態
  public unconscious: boolean // 気絶
  public dead: boolean // 死亡
  public injuryOnArm: boolean // 腕・手首の故障
  public injuryOnLeg: boolean // 脚・足首の故障
  public blinded: boolean // 目の故障
  public deafened: boolean // 耳の故障
  public burning: boolean // 火だるま
  public puppeted: boolean // 傀儡

  constructor(self: Unit, maxHp: number) {
    this.self = self
    this.maxHp = maxHp
    this._injury = 0
    this._stunned = false
    this.unconscious = false
    this.dead = false
    this.injuryOnArm = false
    this.injuryOnLeg = false
    this.blinded = false
    this.deafened = false
    this.burning = false
    this.puppeted = false
  }

  // ダメージ効果 (判定不要の処理はここで解決する)
  // アンデッド・スライム (defense.creatureType === 'undead' | 'slime') は朦朧状態にも気絶状態にも陥らない (public/docs/04-04.md 「魔物」章参照)
  // (負傷が最大HPに達した場合は, 気絶を経由せず Action/effects.ts の resolveDamage 側で自動的に死亡する)
  set injury(newInjury: number) {
    const dmg = newInjury - this._injury
    const isUndeadOrSlime = this.self.defense.creatureType === 'undead' || this.self.defense.creatureType === 'slime'

    // 一撃のダメージが最大HPの半分以上の場合, 自動的に朦朧状態に陥る
    if (!isUndeadOrSlime && dmg >= this.maxHp / 2) {
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

  // 朦朧状態への代入 (新たに true になろうとする代入のみ, 痛覚鈍麻状態・アンデッド/スライムの間はブロックする. false への代入 (回復) は常に通す)
  set stunned(value: boolean) {
    if (value && (this.self.statusEffects.resistant || this.self.defense.creatureType === 'undead' || this.self.defense.creatureType === 'slime')) return
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

  // 「時間遡行」用: 現在の可変状態のスナップショットを取得する
  getSnapshot(): CombatUnitHealthSnapshot {
    return {
      injury: this._injury,
      stunned: this._stunned,
      unconscious: this.unconscious,
      dead: this.dead,
      injuryOnArm: this.injuryOnArm,
      injuryOnLeg: this.injuryOnLeg,
      blinded: this.blinded,
      deafened: this.deafened,
      burning: this.burning,
      puppeted: this.puppeted
    }
  }

  // 「時間遡行」用: スナップショットの状態へ復元する (setter の副作用 (自動朦朧・気絶等) を経由せず, 直接値を書き戻す)
  restoreSnapshot(snapshot: CombatUnitHealthSnapshot) {
    this._injury = snapshot.injury
    this._stunned = snapshot.stunned
    this.unconscious = snapshot.unconscious
    this.dead = snapshot.dead
    this.injuryOnArm = snapshot.injuryOnArm
    this.injuryOnLeg = snapshot.injuryOnLeg
    this.blinded = snapshot.blinded
    this.deafened = snapshot.deafened
    this.burning = snapshot.burning
    this.puppeted = snapshot.puppeted
  }

  // Summary 表示用ラベル取得 (深刻度が高い状態を優先して1つ返す)
  get label(): string {
    if (this.dead) return '死亡'
    if (this.unconscious) return '気絶'
    if (this.puppeted) return '傀儡'
    if (this.blinded) return '盲目'
    if (this.injuryOnArm) return '腕故障'
    if (this.injuryOnLeg) return '脚故障'
    if (this.deafened) return '聾'
    if (this.burning) return '火だるま'
    if (this.self.posture === 'prone') return '転倒'
    if (this.stunned) return '朦朧状態'
    return ''
  }
}
