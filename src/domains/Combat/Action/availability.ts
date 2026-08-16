// Combat/Action/availability.ts

import { CombatState as State } from '../State'
import { type Position, type Posture } from '../Unit'

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

  //「攻撃」実行可否取得
  // 武器が準備状態, かつ自身が前方に配置されていることが条件 (暫定)
  canAttack(): boolean {
    return this.state.actor.attack.ready === 0 && this.state.actor.position !== 'back'
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

  //「全力防御」実行可否取得
  canDefense(): boolean {
    return true
  }

  //「移動」実行可否取得
  // 姿勢が「膝着き」でないこと
  // 後退は自身が後方に配置されていないこと
  // 前進はそこへ既にユニットが配置されていないことが, それぞれ条件となる
  canMove(position: Position): boolean {
    const actor = this.state.actor
    if (!this.state.formation) return false
    if (actor.posture === 'kneeling') return false
    if (position === 'back') {
      return this.state.formation[actor.side].back[actor.combatId] === null ? true : false
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
