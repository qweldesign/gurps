// Combat/Stores/ActionStore.ts

import { CombatState as State } from '../State'
import { POSITION_KEYS, type Position, CombatUnit as Unit } from '../Unit'

export const ACTION_KEYS = ['move', 'wait'] as const

export const ACTION_LABELS: Record<ActionKey, string> = {
  move: '移動',
  wait: '待機'
} as const

export const POSITION_LABELS: Record<Position, string> = {
  back: '後方',
  left: '左翼',
  center: '中央',
  right: '右翼'
} as const

// 行動キー
export type ActionKey = typeof ACTION_KEYS[number]

// 行動オプション
export type ActionOptions = {
  position?: Position
}

// 行動キーとオプションの組み合わせ
export type ActionRequest =
  | { key: 'move', options: { position: Position } }
  | { key: 'wait', options: {} }

// 行動の管理を司るクラス / Actionコンポーネントに対応
export class CombatActionStore {
  private state: State
  public round: number
  public unlocked: boolean // コマンドパレットのロック状態 → Actions にて検知
  public promise: Promise<void>
  private resolve!: () => void
  private readonly actions

  constructor(state: State) {
    this.state = state
    this.round = state.round
    this.unlocked = true // コマンドパレットをアンロック

    // ターン終了を Promise で State に伝え, 次のターンへ進む
    this.promise = new Promise(resolve => {
      this.resolve = resolve
    })

    this.actions = {
      move: {
        options: { position: POSITION_KEYS },
        canExecute: (position: Position) => this.canMove(position),
        execute: (position: Position) => this.move(position)
      },
      wait: {
        canExecute: () => true,
        execute: () => []
      }
    }
  }

  get actor() {
    return this.state.actor
  }

  // 実行可否
  get availability() {
    return {
      move: this.actions.move.options.position.reduce((acc, position) => {
        acc[position] = this.actions.move.canExecute(position)
        return acc
      }, {} as Record<Position, boolean>),
      wait: this.actions.wait.canExecute()
    }
  }

  //「移動」実行可否取得
  // 後退は自身が後方に配置されていないこと
  // 前進はそこへ既にユニットが配置されていないことが, それぞれ条件となる
  private canMove(position: Position): boolean {
    if (!this.state.formationStore) return false
    if (position === 'back') {
      return this.state.formationStore[this.actor.side].back[this.actor.combatId] === null ? true : false
    } else {
      return this.state.formationStore[this.actor.side].front[position] === null ? true : false
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
        this.actions.move.execute(action.options.position)
        break
        
      default: // case 'wait':
        this.actions.wait.execute()
    }

    // ログを更新
    const log = this.state.logs[0]
    log.receiveResults(action)

    // 行動終了
    await this.state.playLog() // ログの再生完了を待つ
    this.resolve()
  }

  //「移動」実行
  private move(position: Position) {
    this.actor.position = position
  }
}
