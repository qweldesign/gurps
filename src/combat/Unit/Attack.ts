// Attack.ts

import { type AttackKey } from '../../domains/Equipments'
import { type CombatAttackModel as AttackModel, type CombatAttackModels as AttackModels } from '../Unit'

export class UnitAttack {
  private models: AttackModels
  private _key: AttackKey
  private changeKeyCallback: (attacks: AttackModels, key: AttackKey) => void

  constructor(attacks: AttackModels, callback: (attacks: AttackModels, key: AttackKey) => void) {
    this.models = attacks
    this._key = 'main'
    this.changeKeyCallback = callback
  }

  // 攻撃キーの変更 (装備変更)
  set key(key: AttackKey) {
    this._key = key
    this.changeKeyCallback(this.models, key)
  }

  // 攻撃モデルを取得
  get model(): AttackModel {
    return this.models[this._key]
  }

  // 攻撃モデルの目標値を取得
  get target(): number {
    return this.model.level
  }
}
