// Combat/Unit/StatusEffects.ts

// ターン経過で自然に減衰する, ユニットの一時的な状態異常を司るクラス
export class CombatUnitStatusEffects {
  public silence: number // 沈黙
  public resistant: number // 痛覚鈍麻
  public poisoned: number // 毒
  public paralyzed: number // 麻痺
  public dazed: number // 幻惑
  public berserk: number // 狂戦士
  public panic: number // パニック
  public flashed: number // 目くらみ (「閃光」用. 対象自身の次ターン終了時まで, 命中判定-4/回避判定-2のペナルティを受ける)

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

  // Summary 表示用ラベル取得 (優先度が高い状態異常を1つ返す)
  get label(): string {
    if (this.silence) return '沈黙'
    if (this.resistant) return '痛覚鈍麻'
    if (this.poisoned) return '毒'
    if (this.paralyzed) return '麻痺'
    if (this.dazed) return '幻惑'
    if (this.berserk) return '狂戦士'
    if (this.panic) return 'パニック'
    if (this.flashed) return '目くらみ'
    return ''
  }
}
