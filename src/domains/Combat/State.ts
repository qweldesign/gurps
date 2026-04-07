// Combat/State.ts

import { CombatLog as Log } from './Log'
import { type CombatUnitModel as Model, CombatUnit as Unit } from './Unit'
import { CombatFormationStore as FormationStore } from './Stores/FormationStore'
import { CombatActionStore as ActionStore } from './Stores/ActionStore'

// 全ての情報を集約・管理するクラス
export class CombatState {
  public round: number // 経過時間
  public turnIndex: number // 行動順
  public units: Unit[]
  public formationStore: FormationStore | null
  public logs: Log[]
  public playLog: () => Promise<void> // Combat 本体から受け取り, ActionStore から呼び出す
  public actionStore: ActionStore | null

  constructor(models: Model[], playLog: () => Promise<void>) {
    this.round = 1 // 1からカウント
    this.turnIndex = -1 // 開幕前は -1, 開幕と同時に 0 になる
    this.units = models.map((model, i) => {
      return new Unit(model, i + 1) // combatIdは1からカウント
    })
    this.formationStore = null
    this.logs = []
    this.playLog = playLog
    this.actionStore = null
  }

  get actor() {
    return this.units[this.turnIndex]
  }

  // 次のターンへ進む
  async nextTurn() {
    this.turnIndex++
    if (this.turnIndex === this.units.length) {
      this.round++
      this.turnIndex %= this.units.length
    }
    this.formationStore = new FormationStore(this.actor, this.units)
    // 新しいログを追加
    const newLog = new Log(this.actor)
    this.logs.unshift(newLog)
    // ターン開始ログを表示
    await this.playLog()
    // コマンドパレット初期化
    this.actionStore = new ActionStore(this)
    //　コマンド入力待機
    await this.actionStore.promise.then(() => {
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
