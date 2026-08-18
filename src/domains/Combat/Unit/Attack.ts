// Attack.ts

import { type WeaponSlotKey } from '../../Equipments'
import { type Aim, AIM_OPTIONS, type FullPower } from '../Action/types'
import { POSTURE_MODS, type CombatAttackModel as AttackModel, type CombatAttackModels as AttackModels, CombatUnit as Unit } from '../Unit'

// 牽制の持ち越し情報 (成功時, 次の自分の攻撃 (対象が同じ場合のみ) の防御目標値を下げる)
export type Feint = {
  currentTurn: boolean // true: 牽制を行ったターン自身 (まだ適用されない), false: 次ターン以降 (適用可能)
  target: Unit
  score: number
  source: 'feint' | 'snipe' // 発生源 ('feint': 牽制, 'snipe': 狙い). 「狙い」由来の持ち越しのみ, 対象が防御を試みると乱れて破棄される
}

export class CombatUnitAttack {
  private self: Unit
  private models: AttackModels
  private _key: WeaponSlotKey
  public ready: number
  public feint: Feint | null
  private changeKeyCallback: (attacks: AttackModels, key: WeaponSlotKey) => void

  constructor(self: Unit, attacks: AttackModels, callback: (attacks: AttackModels, key: WeaponSlotKey) => void) {
    this.self = self
    this.models = attacks
    this._key = 'main'
    this.ready = 0
    this.feint = null
    this.changeKeyCallback = callback
  }

  nextTurn() {
    if (this.feint && this.feint.currentTurn) {
      // 牽制を行った自身のターンが終わったので, 次ターンに適用可能な状態としてマークする
      this.feint.currentTurn = false
    } else if (this.feint) {
      // 適用されないまま次のターンを迎えたので, 牽制を破棄する
      this.feint = null
    }
  }

  // 攻撃キーの変更 (装備変更)
  set key(key: WeaponSlotKey) {
    this._key = key
    // 鉾槍(振り)のみ例外対応
    if (this.models[key].name !== '鉾槍(振り)') {
      this.ready = this.models[key].ready // 装備変更したら準備が必要
    }
    this.changeKeyCallback(this.models, key)
  }

  // 攻撃キーの取得
  get key() {
    return this._key
  }

  // 攻撃モデルを取得
  get model(): AttackModel {
    return this.models[this._key]
  }

  // キーを指定して攻撃モデルを取得
  getModelByKey(WeaponSlotKey: WeaponSlotKey): AttackModel {
    return this.models[WeaponSlotKey]
  }

  // 攻撃モデルの目標値を取得
  // 部位狙い・全力攻撃オプション・射撃のターゲットの姿勢・距離による修正までは含めない
  get target(): number {
    let target = this.model.level
    target += POSTURE_MODS[this.self.posture].attackMod // 姿勢による修正
    target += this.self.statusBuff.level // 命中UPバフ (ヒロイズム)
    target += this.self.statusEffects.flashed > 0 ? -4 : 0 // 目くらみによる命中判定ペナルティ (「閃光」)
    return Math.max(target, 4)
  }

  // 攻撃モデルの目標値を, 諸条件 (部位狙い・全力攻撃オプション・ターゲットの姿勢・距離) に合わせて取得
  getTarget(aim: Aim = 'body', fullPower: FullPower = 'none', target: Unit) {
    const aimMod = AIM_OPTIONS[aim].mod
    const fullPowerMod = fullPower === 'level' ? 4 : 0
    const targetPosture = POSTURE_MODS[target.posture]
    const missileMod = this.model.isMissile ? targetPosture.missileMod : 0
    const distanceMod = this.model.isMissile ? (target.position === 'back' ? -4 : -2) : 0
    return Math.max(this.target + aimMod + fullPowerMod + missileMod + distanceMod, 4)
  }

  // 攻撃モデルのダメージ期待値を, ダメージ抵抗に合わせて取得
  getExpectedDmg(fullPower: FullPower = 'none', dr: number = 0) {
    const dmgType = this.model.dmgType
    let count = this.model.dmgDice
    count -= fullPower === 'dmg' ? 1 : 0
    let mod = this.model.dmgMod - dr + this.self.statusBuff.dmg // 攻撃UPバフ (ベルセルク)
    mod += fullPower === 'dmg' ? 6 : 0
    const rate = dmgType === 0 ? 1 : dmgType === 1 ? 1.5 : 2
    return Math.max(0, Math.floor((count * 3.5 + mod) * rate))
  }
}
