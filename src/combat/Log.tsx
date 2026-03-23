// Log.tsx

import { type ReactNode } from 'react'
import { ACTION_LABELS, POSITION_LABELS, type ActionRequest, type ActionResult } from './ActionStore'
import { CombatUnit as Unit } from './Unit'

let count = 0

// タイムラインへのログ表示を司るクラス / Timelineコンポーネントに対応 (名前の競合を回避)
export class CombatLog {
  public id: number
  public actor: Unit
  public startMessages: ReactNode[]
  public resultMessages: ReactNode[]
  public label?: string

  // インスタンス生成時は「XXXXの行動順」を表示する
  constructor(actor: Unit) {
    this.id = count++
    this.actor = actor
    const firstMessage = (<span className="font-bold">{actor.name} の行動順</span>)
    this.startMessages = [firstMessage]
    this.resultMessages = []
  }

  // Action コンポーネントで ActionRequet, ActionResult の配列を受け取り, ラベルと結果ログを生成する
  receiveResults(request: ActionRequest, results: ActionResult[]) {
    this.label = this.createLabel(request, results)
    this.resultMessages = this.createMessages(request, results)
  }

  // ラベル生成 (Summary履歴用)
  private createLabel(request: ActionRequest, results: ActionResult[]) {
    switch (request.type) {
      case 'attack':
        return `${ACTION_LABELS[request.type]}`
      case 'move':
        return `${ACTION_LABELS[request.type]}:${POSITION_LABELS[request.options.position]}`

      default: // case 'wait':
        return ACTION_LABELS[request.type]
    }
  }

  // 結果ログ生成
  private createMessages(request: ActionRequest, results: ActionResult[]) {
    const actor = this.actor.name
    const messages = []
    switch (request.type) {
      case 'attack':
        messages.push(<>{`${actor} の攻撃!`}</>)
        break

      case 'move':
        messages.push(<>{`${actor} は ${POSITION_LABELS[request.options.position]} へ移動した`}</>)
        break

      default: // case 'wait':
        messages.push(<>{`${actor} は 待機している`}</>)
        break
    }
    messages.push(<>&nbsp;</>)
    return messages
  }
}
