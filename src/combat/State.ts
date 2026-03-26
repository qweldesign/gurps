// State.ts

import { type CombatUnitModel as Model, CombatUnit as Unit } from './Unit'
import { CombatFormationStore as FormationStore } from './FormationStore'
import { CombatActionStore as ActionStore } from './ActionStore'
import { CombatLog as Log } from './Log'
import { CombatSummaryStore as SummaryStore } from './SummaryStore'

// 全ての情報を集約・管理するクラス
export class CombatState {
  public round: number // 経過時間
  public turnIndex: number // 行動順
  public units: Unit[]
  public actor: Unit | null
  public formationStore: FormationStore | null
  public actionStore: ActionStore | null
  public summaryStore: SummaryStore | null
  public logs: Log[]
  public playLog: () => Promise<void> // ActionStore から呼び出す

  constructor(models: Model[], playLog: () => Promise<void>) {
    this.round = 1 // 1からカウント
    this.turnIndex = -1 // 開幕前
    this.units = models.map((model, i) => {
      return new Unit(model, i)
    })
    this.actor = null
    this.formationStore = null
    this.actionStore = null
    this.summaryStore = null
    this.logs = []
    this.playLog = playLog
    // this.nextTurn() ← 初期化後に手動で呼び出す
  }

  // 次のターンへ進む
  async nextTurn() {
    // 生存者のターンまでスキップ
    let isAlive = false
    while (!isAlive) {
      this.turnIndex++
      if (this.turnIndex === this.units.length) {
        this.round++
        this.turnIndex %= this.units.length
      }
      this.actor = this.units[this.turnIndex]
      isAlive = !this.actor.health.unconscious
    }
    if (!this.actor) return

    // 前のログを Summary に渡し, Formation, Summary を再初期化
    const log = this.logs[0]
    this.formationStore = new FormationStore(this.actor, this.units)
    this.summaryStore = new SummaryStore(this.actor, this, log)
    // 新しいログを追加
    const newLog = new Log(this.actor)
    this.logs.unshift(newLog)
    // ターン開始ログを表示
    await this.playLog()
    // コマンドパレット初期化
    this.actionStore = new ActionStore(this.actor, this)
    //　コマンド入力待機
    await this.actionStore.promise.then(() => {
      // 行動者のステータス更新
      if (this.actor) {
        this.actor.defense.nextTurn()
        this.actor.health.nextTurn()
      }
      // 自身を呼び出し, また次のターンへ進む
      this.debug()
      this.nextTurn()
    })
  }

  debug() {
    const { round, turnIndex, units, logs } = this
    console.log({ round, turnIndex, units, logs })
  }
}
