// Combat/Unit/StatusEffects.ts

// 「時間遡行」用のスナップショット
export type CombatUnitStatusEffectsSnapshot = {
  silence: number
  resistant: number
  poisoned: number
  paralyzed: number
  dazed: number
  berserk: number
  panic: number
  flashed: number
}

// ターン経過で自然に減衰する, ユニットの一時的な状態異常を司るクラス
export class CombatUnitStatusEffects {
  public silence: number // 沈黙
  public resistant: number // 痛覚鈍麻
  public poisoned: number // 毒
  public paralyzed: number // 麻痺
  public dazed: number // 幻惑
  public berserk: number // 狂戦士
  public panic: number // パニック
  public flashed: number // 目くらみ

  constructor() {
    this.silence = 0
    this.resistant = 0
    this.poisoned = 0
    this.paralyzed = 0
    this.dazed = 0
    this.berserk = 0
    this.panic = 0
    this.flashed = 0
  }

  // 毎ターン残存時間をデクリメント
  nextTurn() {
    this.silence = Math.max(this.silence - 1, 0)
    this.resistant = Math.max(this.resistant - 1, 0)
    this.poisoned = Math.max(this.poisoned - 1, 0)
    this.paralyzed = Math.max(this.paralyzed - 1, 0)
    this.dazed = Math.max(this.dazed - 1, 0)
    this.berserk = Math.max(this.berserk - 1, 0)
    this.panic = Math.max(this.panic - 1, 0)
    this.flashed = Math.max(this.flashed - 1, 0)
  }

  // 「時間遡行」用: 現在の状態のスナップショットを取得する
  getSnapshot(): CombatUnitStatusEffectsSnapshot {
    return {
      silence: this.silence,
      resistant: this.resistant,
      poisoned: this.poisoned,
      paralyzed: this.paralyzed,
      dazed: this.dazed,
      berserk: this.berserk,
      panic: this.panic,
      flashed: this.flashed
    }
  }

  // 「時間遡行」用: スナップショットの状態へ復元する
  restoreSnapshot(snapshot: CombatUnitStatusEffectsSnapshot) {
    this.silence = snapshot.silence
    this.resistant = snapshot.resistant
    this.poisoned = snapshot.poisoned
    this.paralyzed = snapshot.paralyzed
    this.dazed = snapshot.dazed
    this.berserk = snapshot.berserk
    this.panic = snapshot.panic
    this.flashed = snapshot.flashed
  }

  // Summary 表示用ラベル取得 (優先度が高い状態異常を1つ返す. 残り持続ターン数を () で併記する)
  get label(): string {
    if (this.silence) return `沈黙(${this.silence})`
    if (this.resistant) return `痛覚鈍麻(${this.resistant})`
    if (this.poisoned) return `毒(${this.poisoned})`
    if (this.paralyzed) return `麻痺(${this.paralyzed})`
    if (this.dazed) return `幻惑(${this.dazed})`
    if (this.berserk) return `狂戦士(${this.berserk})`
    if (this.panic) return `パニック(${this.panic})`
    if (this.flashed) return '目くらみ'
    return ''
  }
}
