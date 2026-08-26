// Combat/Unit/StatusEffects.ts

// 「時間遡行」用のスナップショット
export type CombatUnitStatusEffectsSnapshot = {
  resistant: number
  dazed: number
  berserk: number
  fear: number
  flashed: number
}

// ターン経過で自然に減衰する, ユニットの一時的な状態異常を司るクラス
export class CombatUnitStatusEffects {
  public resistant: number // 痛覚鈍麻
  public dazed: number // 幻惑
  public berserk: number // 狂戦士
  public fear: number // 恐慌
  public flashed: number // 目くらみ

  constructor() {
    this.resistant = 0
    this.dazed = 0
    this.berserk = 0
    this.fear = 0
    this.flashed = 0
  }

  // 毎ターン残存時間をデクリメント
  nextTurn() {
    this.resistant = Math.max(this.resistant - 1, 0)
    this.dazed = Math.max(this.dazed - 1, 0)
    this.berserk = Math.max(this.berserk - 1, 0)
    this.fear = Math.max(this.fear - 1, 0)
    this.flashed = Math.max(this.flashed - 1, 0)
  }

  // 「時間遡行」用: 現在の状態のスナップショットを取得する
  getSnapshot(): CombatUnitStatusEffectsSnapshot {
    return {
      resistant: this.resistant,
      dazed: this.dazed,
      berserk: this.berserk,
      fear: this.fear,
      flashed: this.flashed
    }
  }

  // 「時間遡行」用: スナップショットの状態へ復元する
  restoreSnapshot(snapshot: CombatUnitStatusEffectsSnapshot) {
    this.resistant = snapshot.resistant
    this.dazed = snapshot.dazed
    this.berserk = snapshot.berserk
    this.fear = snapshot.fear
    this.flashed = snapshot.flashed
  }

  // 精神異常 (幻惑・狂戦士・恐慌) が競合した場合の優先順位: 幻惑 > 狂戦士 > 恐慌
  // 単なる残存ターン数 (dazed / berserk / fear) は複数の状態が同時に成立しうるため,
  // 「この状態が実際に行動へ反映されるか (=効果として表れるか)」を判定するにはこちらを参照する
  // (Action.ts の開幕時自動実行, AI/index.ts の decideForImpairedState, availability.ts の canDefense で使用)
  get dazedActive(): boolean {
    return this.dazed > 0
  }

  get berserkActive(): boolean {
    return this.berserk > 0 && !this.dazedActive
  }

  get fearActive(): boolean {
    return this.fear > 0 && !this.dazedActive && !this.berserkActive
  }

  // Summary 表示用ラベル取得 (優先度が高い状態異常を1つ返す. 残り持続ターン数を () で併記する)
  get label(): string {
    if (this.resistant) return `痛覚鈍麻(${this.resistant})`
    if (this.dazed) return `幻惑(${this.dazed})`
    if (this.berserk) return `狂戦士(${this.berserk})`
    if (this.fear) return `恐慌(${this.fear})`
    if (this.flashed) return '目くらみ'
    return ''
  }
}
