// StatusEffects.ts

export class UnitStatusEffects {
  public silence: number // 沈黙
  public resistant: number // 痛覚鈍麻
  public poisoned: number // 毒
  public paralyzed: number // 麻痺
  public dazed: number // 幻惑
  public berserk: number // 狂戦士
  public panic: number // パニック

  constructor() {
    this.silence = 0
    this.resistant = 0
    this.poisoned = 0
    this.paralyzed = 0
    this.dazed = 0
    this.berserk = 0
    this.panic = 0
  }

  // 毎ターン変数をデクリメント
  nextTurn() {
    this.silence = Math.max(this.silence - 1, 0)
    this.resistant = Math.max(this.resistant - 1, 0)
    this.poisoned = Math.max(this.poisoned - 1, 0)
    this.paralyzed = Math.max(this.paralyzed - 1, 0)
    this.dazed = Math.max(this.dazed - 1, 0)
    this.berserk = Math.max(this.berserk - 1, 0)
    this.panic = Math.max(this.panic - 1, 0)
  }
}
