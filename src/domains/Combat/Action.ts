// Combat/Action.ts

import { CombatState as State } from './State'
import { POSITION_KEYS } from './Unit'
import { ACTION_KEYS, ACTION_LABELS, POSITION_LABELS, type ActionKey, type ActionOptions, type ActionRequest } from './Action/types'
import { ActionAvailability } from './Action/availability'
import { ActionEffects } from './Action/effects'

// 定数・型定義は Action/types.ts に集約する
// 既存の呼び出し元 (Action.tsx, Log.tsx) が引き続き参照できるよう, ここから re-export する
export { ACTION_KEYS, ACTION_LABELS, POSITION_LABELS }
export type { ActionKey, ActionOptions, ActionRequest }

// 行動の管理を司るクラス / Actionコンポーネントに対応
// 行動可否判定は Action/availability.ts, 状態変更は Action/effects.ts に委譲する
export class CombatAction {
  private state: State
  public round: number
  public unlocked: boolean // コマンドパレットのロック状態 → Actions にて検知
  public promise: Promise<void>
  private resolve!: () => void
  private readonly availabilityChecker: ActionAvailability
  private readonly effects: ActionEffects

  constructor(state: State) {
    this.state = state
    this.round = state.round
    this.unlocked = true // コマンドパレットをアンロック
    this.availabilityChecker = new ActionAvailability(state)
    this.effects = new ActionEffects(state)

    // ターン終了を Promise で State に伝え, 次のターンへ進む
    this.promise = new Promise(resolve => {
      this.resolve = resolve
    })
  }

  get actor() {
    return this.state.actor
  }

  // 実行可否
  get availability() {
    return {
      move: POSITION_KEYS.reduce((acc, position) => {
        acc[position] = this.availabilityChecker.canMove(position)
        return acc
      }, {} as Record<typeof POSITION_KEYS[number], boolean>),
      wait: this.availabilityChecker.canWait()
    }
  }

  // 実行
  // ActionRequest のプロパティ (key, options) を引数に取って処理を進め,
  // ActionResult の配列を Log に渡し, 再生して次のターンへ移る
  async execute (action: ActionRequest) {
    // コマンドパレットをロック (アンロックはコンストラクタで行われる)
    this.unlocked = false

    // 行動実行
    switch (action.key) {
      case 'move':
        this.effects.move(action.options.position)
        break

      default: // case 'wait':
        this.effects.wait()
    }

    // ログを更新
    const log = this.state.logs[0]
    log.receiveResults(action)

    // 行動終了
    await this.state.playLog() // ログの再生完了を待つ
    this.resolve()
  }
}
