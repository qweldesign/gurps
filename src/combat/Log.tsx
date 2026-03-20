// Log.tsx

import { type ReactNode } from 'react'
import { ACTIONS, type ActionRequest } from './ActionStore'
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

export class CombatLog {
  public id: number
  public actor: Unit
  public startMessages: ReactNode[]
  public resultMessages: ReactNode[]
  public request?: ActionRequest
  public label?: string

  constructor(actor: Unit) {
    this.id = count++
    this.actor = actor
    const firstMessage = (<span className="font-bold">{actor.name} の行動順</span>)
    this.startMessages = [firstMessage]
    this.resultMessages = []
  }

  receiveRequest(request: ActionRequest) {
    this.request = request
    this.label = ACTIONS[request.type].label
    this.resultMessages = this.createMessages()
  }

  createMessages() {
    const actor = this.actor.name
    const request = this.request ?? { type: '' }
    const messages = []
    switch (request.type) {
      case 'move':
        messages.push(<>{`${actor} は ${POSITION_LABELS[request.option]} へ移動した`}</>)
        break

      default: // case 'wait':
        messages.push(<>{`${actor} は 待機している`}</>)
        break
    }
    messages.push(<>&nbsp;</>)
    return messages
  }
}
