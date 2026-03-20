// Log.ts

import { type ActionRequest } from './ActionStore'
import { CombatUnit as Unit } from './Unit'

export const ACTION_LABELS = {
  attack: '攻撃',
  move: '移動',
  wait: '待機'
} as const

let count = 0

export class CombatLog {
  public id: number
  public actor: Unit
  public request: ActionRequest
  public label: string

  constructor(actor: Unit, request: ActionRequest) {
    this.id = count++
    this.actor = actor
    this.request = request
    this.label = ACTION_LABELS[request.type]
  }
}
