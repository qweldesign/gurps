// Combat/State.ts

import { CombatLog as Log } from './Log'
import { type CombatUnitModel as Model, CombatUnit as Unit } from './Unit'
import { CombatFormation as Formation } from './Formation'
import { CombatAction as Action } from './Action'

// 全ての情報を集約・管理するクラス
export class CombatState {
  public round: number // 経過時間
  public turnIndex: number // 行動順
  public units: Unit[]
  public formation: Formation | null
  public logs: Log[]
  public playLog: () => Promise<void> // Combat 本体から受け取り, Action から呼び出す
  public action: Action | null

  constructor(models: Model[], playLog: () => Promise<void>) {
    this.round = 1 // 1からカウント
    this.turnIndex = -1 // 開幕前は -1, 開幕と同時に 0 になる
    this.units = models.map((model, i) => {
      return new Unit(model, i + 1) // combatIdは1からカウント
    })
    this.formation = null
    this.logs = []
    this.playLog = playLog
    this.action = null
  }

  get actor() {
    return this.units[this.turnIndex]
  }

  // 次のターンへ進む
  async nextTurn() {
    // 倒れているユニットのターンをパス
    let isAlive = false
    while (!isAlive) {
      this.turnIndex++
      if (this.turnIndex === this.units.length) {
        this.round++
        this.turnIndex %= this.units.length
      }
      isAlive = !this.actor.health.unconscious
    }
    this.formation = new Formation(this.actor, this.units)
    // 前ターンのログを, その行動者の履歴として保持 (Summaryの行動ラベル表示用)
    if (this.logs[0]) this.logs[0].actor.history = this.logs[0]
    // 新しいログを追加
    const newLog = new Log(this.actor)
    this.logs.unshift(newLog)
    // ターン開始ログを表示
    await this.playLog()
    // コマンドパレット初期化
    this.action = new Action(this)
    //　コマンド入力待機
    await this.action.promise.then(() => {
      // 牽制の持ち越し状態を更新 (自身のターン終了時点で適用可能に, 未適用なら破棄)
      this.actor.attack.nextTurn()
      // 行動者の能動防御 (受け・止めの試行回数, 全力防御) をリセット
      this.actor.defense.nextTurn()
      // 行動者の状態異常・バフの残存時間を更新
      this.actor.statusEffects.nextTurn()
      this.actor.statusBuff.nextTurn()
      // 自身を呼び出し, また次のターンへ進む
      this.debug()
      this.nextTurn()
    })
  }

  debug() {
    const { round, turnIndex, units } = this
    console.log({ round, turnIndex, units })
  }
}
