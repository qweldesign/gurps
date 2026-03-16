// Unit.ts

import { type CharacterModel, Character } from '../domains/Character'

export type CombatUnitModel = CharacterModel

export class CombatUnit extends Character {
  public combatId: number

  constructor(model: CombatUnitModel, combatId: number) {
    super(model)
    this.combatId = combatId
  }
}
