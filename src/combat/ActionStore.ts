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

// ロール定義
type Roll = {
  roll: number // 出目
}

// 判定定義
type Judge = Roll & {
  success: boolean // 成功/失敗
  critical: boolean // クリティカル/ファンブル
}

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
  private canMove(position: Position) {
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

  // ロール結果 (Roll型) を返す
  private roll(count: number = 3, mod: number = 0, sides: number = 6): Roll {
    const roll = this.getRoll(count, mod, sides)
    return { roll }
  }

  // 判定結果 (Judge型) を返す
  private judge(target: number): Judge {
    const roll = this.getRoll()
    const criticalTarget = Math.max(4, Math.min((target - 10), 6)) // クリティカル
    const fumbleTarget = Math.max(17, Math.min((target + 1), 18)) // ファンブル
    const success = roll <= criticalTarget || (roll <= target && roll < 17)
    const critical = roll <= criticalTarget || roll >= fumbleTarget
    return { roll, success, critical }
  }

  // ダイスを振った出目を取得
  private getRoll(count: number = 3, mod: number = 0, sides: number = 6): number {
    return Array.from<number>({ length: count }).reduce(sum => {
      return sum + Math.ceil(Math.random() * sides)
    }, 0) + mod
  }

  // 「移動」実行
  private move(position: Position) {
    this.actor.position = position
  }
}
