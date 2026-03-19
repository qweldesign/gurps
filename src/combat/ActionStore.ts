// ActionStore.ts

import { CombatCore as Core } from './Core'
import { POSITION_VALUES, type Position } from './FormationStore'
import { CombatUnit as Unit } from './Unit'

export type ActionRequest =
  | { type: 'move', option: Position }
  | { type: 'wait', option: null }

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

export class CombatActionStore {
  public actor: Unit
  private core: Core
  public round: number
  public turnIndex: number
  private readonly actions: ActionDefinition

  constructor(actor: Unit, core: Core) {
    this.actor = actor
    this.core = core
    this.round = core.round
    this.turnIndex = core.turnIndex
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

  canMove(position: Position) {
    if (position === 'back') {
      return this.core.formationStore[this.actor.side].back[this.actor.combatId] === null ? true : false
    } else {
      return this.core.formationStore[this.actor.side].front[position] === null ? true : false
    }
  }

  execute(action: ActionRequest) {
    switch (action.type) {
      case 'move':
        if (!this.actions.move.canExecute(action.option)) return
        this.actions.move.execute(action.option)
        break

      default: // case 'wait':
        if (!this.actions.wait.canExecute()) return
        this.actions.wait.execute()
        break
    }
  }

  move(position: Position) {
    this.actor.position = position
  }
}
