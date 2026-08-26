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

  // 幻惑によるコマンド封じ判定 (「傀儡」中はこれを無視し, 自由に行動できる. 対象は元々幻惑・気絶・死亡のいずれかの状態にあるため)
  private isDazed(): boolean {
    const actor = this.state.actor
    return !!actor.statusEffects.dazed && !actor.health.puppeted
  }

  //「準備」実行可否取得
  // 武器が非準備状態であること, かつ幻惑状態ではないことが条件
  canReady(): boolean {
    return this.state.actor.attack.ready > 0 && !this.isDazed()
  }

  // 「攻撃」「特殊攻撃」共通の基本条件
  // 射撃武器ではない, 自身が前方に配置されている, かつ幻惑状態ではないことが条件 (武器の準備状態はここに含めない)
  // 「傀儡」中は, 位置 (後列を含む) を問わず対象を取れる (Formation.getMeleeTargets 参照. 気絶等で後列に
  // 追いやられた状態のまま傀儡にされることが多いため) ので, 前方配置の条件を外す
  private canAttackBase(): boolean {
    const actor = this.state.actor
    return !actor.attack.model.isMissile && (actor.position !== 'back' || actor.health.puppeted) && !this.isDazed()
  }

  // 「攻撃」: 基本条件 + 武器が準備状態であること + 狂戦士状態ではないこと
  canAttack(): boolean {
    const actor = this.state.actor
    return this.canAttackBase() && actor.attack.ready === 0 && !actor.statusEffects.berserk
  }

  // 「特殊攻撃」: 基本条件のみ (武器の準備状態・狂戦士状態のどちらも問わない)
  // 非準備状態の場合は「準備即攻撃」のみ, 狂戦士状態の場合は全力攻撃が強制される, という形で Action.tsx 側が出し分ける
  // 「傀儡」中は不可 (被攻撃対象にならない1ターン限りの行動のため, 次の自分のターンまで防御を放棄する意味が無い)
  canFullAttack(): boolean {
    return this.canAttackBase() && !this.state.actor.health.puppeted
  }

  // 全力攻撃オプション「2回攻撃」実行可否取得
  // 攻撃毎に準備を要する武器 (model.ready > 0) では, 1回目の攻撃後に非準備状態になり
  // 同じターン内で2回目の攻撃ができないため, 選択不可 (常に準備不要な武器のみ選択可能)
  canDoubleAttack(): boolean {
    return this.state.actor.attack.model.ready === 0
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
  // 武器が準備状態, 射撃武器を構えている, かつ幻惑状態ではないことが条件
  // 「傀儡」中は不可 (準備・狙いの持ち越しなど, 複数ターンにまたがる仕組みとの整合が複雑になるため)
  canShoot(): boolean {
    const actor = this.state.actor
    return actor.attack.ready === 0 && actor.attack.model.isMissile && !this.isDazed() && !actor.health.puppeted
  }

  //「狙い」実行可否取得
  // 「射撃」の実行可否条件に加え, 狂戦士状態ではないことが条件 (「傀儡」中の不可は canShoot 側の条件により自動的に反映される)
  canSnipe(): boolean {
    return this.canShoot() && !this.state.actor.statusEffects.berserk
  }

  //「集中」実行可否取得
  // 該当する系統の術の技能値が11以上, かつ幻惑状態ではないこと, かつ「這い」の姿勢ではないことが条件
  // 「傀儡」中は不可 (蓄積した詠唱時間が次のターンへ持ち越されないため)
  canCast(element: SpellElement): boolean {
    const actor = this.state.actor
    return actor.spells[element] > 10 && !this.isDazed() && actor.posture !== 'prone' && !actor.health.puppeted
  }

  //「法術」実行可否取得
  // 該当する系統の詠唱時間 (「集中」の実行回数) が1以上, 幻惑状態ではないこと, かつ「這い」の姿勢ではないことが条件
  // 「傀儡」中は不可 (集中と同様の理由)
  canSpell(element: SpellElement): boolean {
    const actor = this.state.actor
    return actor.spellCast[element] > 0 && !this.isDazed() && actor.posture !== 'prone' && !actor.health.puppeted
  }

  //「全力防御」実行可否取得
  // 狂戦士状態ではないことが条件 (幻惑状態でも「身を守るための単純な行動」として選択できる)
  // 「傀儡」中は不可 (被攻撃対象にならないため, 防御に専念する意味が無い)
  canDefense(): boolean {
    return !this.state.actor.statusEffects.berserk && !this.state.actor.health.puppeted
  }

  //「移動」実行可否取得
  // 姿勢が「膝着き」でないこと, かつ幻惑状態ではないこと
  // 後退は自身が後方に配置されていないこと, かつ狂戦士状態ではないこと
  // 前進はそこへ既にユニットが配置されていないことが, それぞれ条件となる
  // 「傀儡」中は不可 (被攻撃対象にならないため, 配置を変える意味が無い)
  canMove(position: Position): boolean {
    const actor = this.state.actor
    if (!this.state.formation) return false
    if (actor.posture === 'kneeling') return false
    if (this.isDazed()) return false
    if (actor.health.puppeted) return false
    if (position === 'back') {
      return this.state.formation[actor.side].back[actor.combatId] === null && !actor.statusEffects.berserk ? true : false
    } else {
      return this.state.formation[actor.side].front[position] === null ? true : false
    }
  }

  //「装備変更」実行可否取得
  // sub, spare のいずれかに武器を持っていること, かつ幻惑状態ではないことが条件 (他に持ち替え先の武器が無ければ非表示)
  canChangeWeapon(): boolean {
    const isSingle = (['sub', 'spare'] as const).every(key => this.state.actor.attack.getModelByKey(key).name === '装備無し')
    return !isSingle && !this.isDazed()
  }

  //「姿勢変更」実行可否取得
  // 直立 → 這い は不可能
  // 這い → 膝着きのみ可能
  // 脚・足首を故障している間は, 杖のような支えが無い前提のため, 二度と「直立」「屈み」には戻れない
  // その他, 現行の姿勢以外にはいつでも変更可能 (幻惑状態では一切変更不可)
  canChangePosture(posture: Posture): boolean {
    const actor = this.state.actor
    if (this.isDazed()) return false
    if (actor.health.injuryOnLeg && (posture === 'standing' || posture === 'crouching')) return false
    const current = actor.posture
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
