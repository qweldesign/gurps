// Attack.ts

import { type AttackKey } from '../../domains/Equipments'
import { type Aim, AIM_OPTIONS, type FullPower } from '../ActionStore'
import { type CombatAttackModel as AttackModel, type CombatAttackModels as AttackModels, CombatUnit as Unit } from '../Unit'

export type Feint = {
  currentTurn: boolean
  target: Unit
  score: number
}

export class UnitAttack {
  private models: AttackModels
  private _key: AttackKey
  public feint: Feint | null
  private changeKeyCallback: (attacks: AttackModels, key: AttackKey) => void

  constructor(attacks: AttackModels, callback: (attacks: AttackModels, key: AttackKey) => void) {
    this.models = attacks
    this._key = 'main'
    this.feint = null
    this.changeKeyCallback = callback
  }

  nextTurn() {
    if (this.feint && this.feint.currentTurn) {
      // このターンの牽制を前ターンの牽制としてマークしておく
      this.feint.currentTurn = false
    } else if (this.feint) {
      // 前ターンの牽制をリセット
      this.feint = null
    }
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

  // 攻撃モデルの目標値を, 諸条件 (部位狙い・全力攻撃オプション) に合わせて取得
  getTarget(aim: Aim = 'body', fullPower: FullPower = 'none') {
    const aimMod = AIM_OPTIONS[aim].mod
    const fullPowerMod = fullPower === 'level' ? 4 : 0
    return this.target + aimMod + fullPowerMod
  }

  // 攻撃モデルのダメージ期待値を, ダメージ抵抗に合わせて取得
  getExpectedDmg(fullPower: FullPower = 'none', dr: number = 0) {
    const dmgType = this.model.dmgType
    let count = this.model.dmgDice
    count -= fullPower === 'dmg' ? 1 : 0
    let mod = this.model.dmgMod - dr
    mod += fullPower === 'dmg' ? 6 : 0
    const rate = dmgType === 0 ? 1 : dmgType === 1 ? 1.5 : 2
    return Math.floor((count * 3.5 + mod) * rate)
  }
}
