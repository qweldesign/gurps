// Combat/Action/availability.ts

import { CombatState as State } from '../State'
import { type Position, type Posture } from '../Unit'
import { type SpellElement } from '../Spells'

// 行動可否判定を司るクラス / Action.availability に対応
export class ActionAvailability {
  private state: State

  constructor(state: State) {
    this.state = state
  }

  //「準備」実行可否取得
  // 武器が非準備状態であることが条件
  canReady(): boolean {
    return this.state.actor.attack.ready > 0
  }

  // 「攻撃」「特殊攻撃」共通の基本条件
  // 射撃武器ではない, かつ自身が前方に配置されていることが条件 (武器の準備状態はここに含めない)
  private canAttackBase(): boolean {
    const actor = this.state.actor
    return !actor.attack.model.isMissile && actor.position !== 'back'
  }

  // 「攻撃」: 基本条件 + 武器が準備状態であること + 狂戦士状態ではないこと
  canAttack(): boolean {
    const actor = this.state.actor
    return this.canAttackBase() && actor.attack.ready === 0 && !actor.statusEffects.berserk
  }

  // 「特殊攻撃」: 基本条件のみ (武器の準備状態・狂戦士状態のどちらも問わない)
  // 非準備状態の場合は「準備即攻撃」のみ, 狂戦士状態の場合は全力攻撃が強制される, という形で Action.tsx 側が出し分ける
  canFullAttack(): boolean {
    return this.canAttackBase()
  }

  //「脚・足首狙い」実行可否取得
  // 屈み以上の姿勢 (直立以外), または竿状武器・射撃武器を構えていることが条件
  canLegAttack(): boolean {
    const actor = this.state.actor
    return actor.posture !== 'standing' || actor.attack.model.isPole || actor.attack.model.isMissile
  }

  //「牽制」実行可否取得
  // 「攻撃」と同条件
  canFeint(): boolean {
    return this.canAttack()
  }

  //「射撃」実行可否取得
  // 武器が準備状態, かつ射撃武器を構えていることが条件
  canShoot(): boolean {
    return this.state.actor.attack.ready === 0 && this.state.actor.attack.model.isMissile
  }

  //「狙い」実行可否取得
  // 「射撃」の実行可否条件に加え, 狂戦士状態ではないことが条件
  canSnipe(): boolean {
    return this.canShoot() && !this.state.actor.statusEffects.berserk
  }

  //「集中」実行可否取得
  // 該当する系統の術の技能値が11以上であることが条件
  canCast(element: SpellElement): boolean {
    return this.state.actor.spells[element] > 10
  }

  //「法術」実行可否取得
  // 該当する系統の詠唱時間 (「集中」の実行回数) が1以上であることが条件
  canSpell(element: SpellElement): boolean {
    return this.state.actor.spellCast[element] > 0
  }

  //「全力防御」実行可否取得
  // 狂戦士状態ではないことが条件
  canDefense(): boolean {
    return !this.state.actor.statusEffects.berserk
  }

  //「移動」実行可否取得
  // 姿勢が「膝着き」でないこと
  // 後退は自身が後方に配置されていないこと, かつ狂戦士状態ではないこと
  // 前進はそこへ既にユニットが配置されていないことが, それぞれ条件となる
  canMove(position: Position): boolean {
    const actor = this.state.actor
    if (!this.state.formation) return false
    if (actor.posture === 'kneeling') return false
    if (position === 'back') {
      return this.state.formation[actor.side].back[actor.combatId] === null && !actor.statusEffects.berserk ? true : false
    } else {
      return this.state.formation[actor.side].front[position] === null ? true : false
    }
  }

  //「装備変更」実行可否取得
  // sub, spare のいずれかに武器を持っていることが条件 (他に持ち替え先の武器が無ければ非表示)
  canChangeWeapon(): boolean {
    const isSingle = (['sub', 'spare'] as const).every(key => this.state.actor.attack.getModelByKey(key).name === '装備無し')
    return !isSingle
  }

  //「姿勢変更」実行可否取得
  // 直立 → 這い は不可能
  // 這い → 膝着きのみ可能
  // その他, 現行の姿勢以外にはいつでも変更可能
  canChangePosture(posture: Posture): boolean {
    const current = this.state.actor.posture
    if (posture === current) return false
    if (current === 'standing') return posture !== 'prone'
    if (current === 'prone') return posture === 'kneeling'
    return true
  }

  //「待機」実行可否取得
  canWait(): boolean {
    return true
  }
}
