// ActionStore.ts

import { CombatState as State } from './State'
import { POSITION_VALUES, type Position } from './FormationStore'
import { CombatUnit as Unit } from './Unit'

// コマンド名の定義
export type ActionType = 'move' | 'wait'

// コマンドオプションの定義
export type ActionOptions = {
  position?: Position
}

// コマンド名とオプションの組み合わせ定義
export type ActionRequest =
  | { type: 'move', options: { position: Position }, targets: [] }
  | { type: 'wait', options: {}, targets: [] }

// コマンド実行可否取得関数と実行関数の定義
type ActionDefinition = {
  move: {
    options: readonly Position[]
    canExecute: (position: Position) => boolean
    execute: (position: Position) => void
  }
  wait: {
    canExecute: () => boolean
    execute: () => void
  }
}

// コマンド (行動) の管理と実行を司るクラス / Actionコンポーネントに対応
export class CombatActionStore {
  public actor: Unit
  private state: State
  public round: number
  private readonly actions: ActionDefinition

  constructor(actor: Unit, state: State) {
    this.actor = actor
    this.state = state
    this.round = state.round
    this.actions = {
      move: {
        options: POSITION_VALUES,
        canExecute: (position) => this.canMove(position),
        execute: (position) => this.move(position)
      },
      wait: {
        canExecute: () => true,
        execute: () => {}
      }
    }
  }

  // ターン毎に更新
  update(actor: Unit, state: State) {
    this.actor = actor
    this.state = state
    this.round = state.round
  }

  // availability を結果として生成
  get availability() {
    return {
      move: this.actions.move.options.reduce((acc, position) => {
        acc[position] = this.actions.move.canExecute(position)
        return acc
      }, {} as Record<Position, boolean>),
      wait: this.actions.wait.canExecute()
    }
  }

  // 「移動」実行可否取得
  // 後退は自身が後方に配置されていないこと, 前進はそこへ既にユニットが配置されていないことが, それぞれ条件となる
  canMove(position: Position) {
    if (position === 'back') {
      return this.state.formationStore[this.actor.side].back[this.actor.combatId] === null ? true : false
    } else {
      return this.state.formationStore[this.actor.side].front[position] === null ? true : false
    }
  }

  // 実行
  // ActionRequest のプロパティ (type, options, targets) を引数に取って処理を進める
  execute(action: ActionRequest) {
    switch (action.type) {
      case 'move':
        if (!this.actions.move.canExecute(action.options.position)) return
        this.actions.move.execute(action.options.position)
        break

      default: // case 'wait':
        if (!this.actions.wait.canExecute()) return
        this.actions.wait.execute()
        break
    }
  }

  // 「移動」実行
  move(position: Position) {
    this.actor.position = position
  }
}
