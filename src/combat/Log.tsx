// Log.tsx

import { type ReactNode } from 'react'
import { type ActionRequest } from './ActionStore'
import { CombatUnit as Unit } from './Unit'

export const ACTION_LABELS = {
  move: '移動',
  wait: '待機'
} as const

export const POSITION_LABELS = {
  back: '後方',
  left: '左翼',
  center: '中央',
  right: '右翼'
} as const

let count = 0

// タイムラインへのログ表示を司るクラス / Timelineコンポーネントに対応 (名前の競合を回避)
export class CombatLog {
  public id: number
  public actor: Unit
  public startMessages: ReactNode[]
  public resultMessages: ReactNode[]
  public request?: ActionRequest
  public label?: string

  // インスタンス生成時は「XXXXの行動順」を表示する
  constructor(actor: Unit) {
    this.id = count++
    this.actor = actor
    const firstMessage = (<span className="font-bold">{actor.name} の行動順</span>)
    this.startMessages = [firstMessage]
    this.resultMessages = []
  }

  // Action コンポーネントで ActionRequet を受け取り, ラベルと結果ログを生成する
  receiveRequest(request: ActionRequest) {
    this.request = request
    this.label = this.createLabel()
    this.resultMessages = this.createMessages()
  }

  // ラベル生成 (Summary履歴用)
  private createLabel() {
    const request = this.request ?? { type: 'wait' }
    switch (request.type) {
      case 'move':
        return `${ACTION_LABELS[request.type]}:${POSITION_LABELS[request.options.position]}`

      default: // case 'wait':
        return ACTION_LABELS[request.type]
    }
  }

  // 結果ログ生成
  private createMessages() {
    const actor = this.actor.name
    const request = this.request ?? { type: '' }
    const messages = []
    switch (request.type) {
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
