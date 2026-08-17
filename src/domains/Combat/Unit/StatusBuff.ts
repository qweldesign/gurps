// Combat/Unit/StatusBuff.ts

// 補助呪文等に由来する, ユニットの一時的なバフを司るクラス
export class CombatUnitStatusBuff {
  private dmgInitBuff: number //「怪力」端数
  private evInitBuff: number //「運動」端数
  private levelBuff: number // 命中UP (ヒロイズム)
  private dmgBuff: number // 攻撃UP (ベルセルク)
  private evBuff: number // 回避UP (ヘイスト)
  private drBuff: number // 防御UP (水舞)

  constructor(dmgBuff: number, evBuff: number) {
    this.dmgInitBuff = dmgBuff * 10
    this.evInitBuff = evBuff * 10
    this.levelBuff = 0
    this.dmgBuff = 0
    this.evBuff = 0
    this.drBuff = 0
  }

  // 各バフは10ターン持続
  // 毎ターンバフ変数をデクリメント
  nextTurn() {
    this.levelBuff = Math.max(this.levelBuff - 1, 0)
    this.dmgBuff = Math.max(this.dmgBuff - 1, 0)
    this.evBuff = Math.max(this.evBuff - 1, 0)
    this.drBuff = Math.max(this.drBuff - 1, 0)
  }

  // ヒロイズムの付与 (10ターン, +3まで累積)
  addLevelBuff() {
    this.levelBuff = Math.min(this.levelBuff + 10, 30)
  }

  // ベルセルクの付与 (10ターン, +3まで累積)
  addDmgBuff() {
    this.dmgBuff = Math.min(this.dmgBuff + 10, 30)
  }

  // ヘイストの付与 (10ターン, +3まで累積)
  addEvBuff() {
    this.evBuff = Math.min(this.evBuff + 10, 30)
  }

  // 水舞の付与 (10ターン, 累積しない)
  addDrBuff() {
    this.drBuff = 10
  }

  get level() {
    // 残ターン数の10分の1 (端数切り上げ) が実際の効果
    return Math.ceil(this.levelBuff / 10)
  }

  get dmg() {
    // 残ターン数の10分の1 (端数切り上げ) + 初期値(10) の半分 が実際の効果
    return Math.floor(Math.ceil((this.dmgInitBuff + this.dmgBuff) / 10) / 2)
  }

  get ev() {
    // 残ターン数の10分の1 (端数切り上げ) + 初期値(10) の半分 が実際の効果
    return Math.floor(Math.ceil((this.evInitBuff + this.evBuff) / 10) / 2)
  }

  get dr() {
    // 残ターン数が残っていれば, 効果は一定
    return this.drBuff > 0 ? 1 : 0
  }

  // Summary 表示用ラベル取得 (該当するバフを1つ返す)
  get label(): string {
    if (this.levelBuff > 0) return '命中UP'
    if (this.dmgBuff > 0) return '攻撃UP'
    if (this.evBuff > 0) return '回避UP'
    if (this.drBuff > 0) return '防御UP'
    return ''
  }
}
