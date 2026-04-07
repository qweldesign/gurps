// Combat/Log.tsx

import { type ReactNode } from 'react'
import { CombatUnit as Unit } from './Unit'
import { ACTION_LABELS, POSITION_LABELS, type ActionRequest } from './Stores/ActionStore'

let count = 0

// タイムラインへのログ表示を司るクラス / Timelineコンポーネントに対応
export class CombatLog {
  public id: number
  public actor: Unit
  public messages: ReactNode[][]
  public label?: string

  // インスタンス生成時は「XXXXの行動順」を表示する
  constructor(actor: Unit) {
    this.id = count++
    this.actor = actor
    const firstMessage = (<span className="font-bold">{actor.name} の行動順</span>)
    this.messages = [[firstMessage]]
  }

  // Action コンポーネントで ActionRequet を受け取り, ラベルと結果ログを生成する
  receiveResults(request: ActionRequest) {
    this.label = this.createLabel(request)
    this.messages.push(this.createMessages(request))
  }

  // ラベル生成 (Summary履歴用)
  private createLabel(request: ActionRequest): string {
    const key = request.key
    switch (key) {
      case 'move':
        return `${ACTION_LABELS[request.key]}:${POSITION_LABELS[request.options.position]}`
      
      default: // case 'wait':
        return ACTION_LABELS[request.key]
    }
  }

  // 結果ログ生成
  private createMessages(request: ActionRequest): ReactNode[] {
    const actor = this.actor.name
    const key = request.key
    const messages = []
    switch (key) {
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
