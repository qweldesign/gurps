// Combat/Action/availability.ts

import { CombatState as State } from '../State'
import { type Position } from '../Unit'

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
  // 後退は自身が後方に配置されていないこと
  // 前進はそこへ既にユニットが配置されていないことが, それぞれ条件となる
  canMove(position: Position): boolean {
    const actor = this.state.actor
    if (!this.state.formation) return false
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

  //「待機」実行可否取得
  canWait(): boolean {
    return true
  }
}
