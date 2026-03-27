// Log.tsx

import { type ReactNode } from 'react'
import { ACTION_LABELS, POSITION_LABELS, type ActionType, type ActionRequest, type Judge, type AttackResult, type DefenseResult, type DmgResult, type FeintResult, type ActionResult } from './ActionStore'
import { CombatUnit as Unit } from './Unit'

let count = 0

// タイムラインへのログ表示を司るクラス / Timelineコンポーネントに対応 (名前の競合を回避)
export class CombatLog {
  public id: number
  public actor: Unit
  public messages: ReactNode[][]
  public label?: string

  // インスタンス生成時は「XXXXの行動順」を表示する
  constructor(actor: Unit) {
    this.id = count++
    this.actor = actor
    const firstMessage = (<span className="font-bold">{actor.name} の行動順</span>)
    this.messages = [[firstMessage]]
  }

  // Action コンポーネントで ActionRequet, ActionResult の配列を受け取り, ラベルと結果ログを生成する
  receiveResults(request: ActionRequest, results: ActionResult[]) {
    this.label = this.createLabel(request, results)
    this.messages.push(this.createMessages(request, results))
  }

  // ラベル生成 (Summary履歴用)
  private createLabel(request: ActionRequest, results: ActionResult[]) {
    const type = request.type
    const resultLabel = this.createResultLabel(type, results)
    switch (type) {
      case 'attack':
      case 'feint':
        return `${ACTION_LABELS[request.type]}:${resultLabel}`
      case 'move':
        return `${ACTION_LABELS[request.type]}:${POSITION_LABELS[request.options.position]}`
      case 'recovery':
        return resultLabel
      default: // case 'ready': case 'defense': case 'wait':
        return ACTION_LABELS[request.type]
    }
  }

  private createResultLabel(type: ActionType, results: ActionResult[]): string {
    let success = false
    let score = 0
    switch (type) {
      case 'attack':
        // 攻撃(成功) → 防御(失敗) → ダメージ(貫通) の場合のみ「成功」を返す
        results.forEach(result => {
          switch (result.type) {
            case 'attack':
              const attackResult = result.judge as AttackResult
              success = attackResult.success
              break

            case 'defense':
              const defenseResult = result.judge as DefenseResult
              success = !defenseResult.success
              break

            case 'dmg':
              const dmgResult = result.judge as DmgResult
              success = dmgResult.success
              break
          }
        })
        return success ? '成功' : '失敗'
      
      case 'feint':
        // 成功時は score (成功度) を表示
        results.forEach(result => {
          const feintResult = result.judge as FeintResult
          success = feintResult.success
          score = feintResult.score
        })
        return success ? `成功(${score})` : '失敗'

      case 'recovery':
        // 回復判定の結果で分岐
        results.forEach(result => {
          const recoveryResult = result.judge as Judge
          success = recoveryResult.success
        })
        return success ? '回復' : '朦朧状態'

      default: // case 'ready': case 'defense': case 'move': case 'wait':
        return ''
    }
  }

  // 結果ログ生成
  private createMessages(request: ActionRequest, results: ActionResult[]) {
    const actor = this.actor.name
    const type = request.type
    const messages = this.createResultMessages(type, request, results)
    switch (type) {
      case 'ready':
        messages.unshift(<>{`${actor} は ${this.actor.attack.model.name} を構えた`}</>)
        break

      case 'defense':
        messages.unshift(<>{`${actor} は 防御に専念!`}</>)
        break

      case 'move':
        messages.unshift(<>{`${actor} は ${POSITION_LABELS[request.options.position]} へ移動した`}</>)
        break

      case 'wait':
        messages.unshift(<>{`${actor} は 待機している`}</>)
        break
      
      default: // case 'attack': case 'feint':
        break
    }
    messages.push(<>&nbsp;</>)
    return messages
  }

  private createResultMessages(type: ActionType, request: ActionRequest, results: ActionResult[]): ReactNode[] {
    const actor = this.actor.name
    let target: string | undefined
    const messages: ReactNode[] = []
    switch (type) {
      case 'attack': case'feint':// 攻撃の結果ログを作成
        target = request.targets[0]?.name
        results.forEach(result => {
          switch (result.type) {
            case 'feint':
              const feintResult = result.judge as FeintResult
              const feintSuccess = feintResult.success
              const feintScore = feintResult.score
              messages.push(<>{`${actor} は ${target} に対して牽制を仕掛けた`}</>)
              if (feintSuccess) {
                // 成功
                messages.push(<>{`出目は ${feintResult.roll}, 牽制は成功した!`}</>)
                messages.push(<>{`次のターン, ${target} は防御判定に -${feintScore} の修正が課せられる!`}</>)
              } else {
                // 失敗
                messages.push(<>{`出目は ${feintResult.roll}, 牽制は失敗した...`}</>)
              }
              break

            case 'attack': // 攻撃判定の結果ログ
              const attackResult = result.judge as AttackResult
              messages.push(<>{`${actor} の ${this.actor.attack.model.name} による攻撃!`}</>)
              messages.push(<>{`出目は ${attackResult.roll}, ${this.getResultLabel(attackResult)}`}</>)
              if (!attackResult.success && !attackResult.ready) {
                // 攻撃失敗時のみ非準備状態への変化をログに表示
                messages.push(<>{`${actor} の ${this.actor.attack.model.name} は非準備状態になった`}</>)
              }
              break

            case 'defense': // 防御判定の結果ログ
              const defenseResult = result.judge as DefenseResult
              const defnseTypeLabel = defenseResult.defenseType === 'parry' ? '武器による受け流し'
                : defenseResult.defenseType === 'block' ? '盾による受け止め': '回避'
              messages.push(<>{`${target} は ${defnseTypeLabel} を試みた!`}</>)
              messages.push(<>{`出目は ${defenseResult.roll}, ${this.getResultLabel(defenseResult)}`}</>)
              if (defenseResult.success && !defenseResult.ready) {
                // 受け成功時のみ非準備状態への変化をログに表示
                messages.push(<>{`${target} の ${request.targets[0]?.attack.model.name} は非準備状態になった`}</>)
              }
              break

            case 'dmg': // ダメージ判定の結果ログ
              const dmgResult = result.judge as DmgResult
              if (dmgResult.roll < 1) {
                messages.push(<>{`ダメージは ${target} の鎧によって完全に止められた...`}</>)
              }
              else if (!dmgResult.critical) {
                messages.push(<>{`${target} は ${dmgResult.roll} 点のダメージを受けた!!`}</>)
              }
              else if (dmgResult.critical) {
                messages.push(<>{`${target} は ${dmgResult.roll} 点のダメージを受けた!!!`}</>)
              }
              break

            case 'knockedDown': // 転倒判定の結果ログ
              const knockedDownResult = result.judge
              if (knockedDownResult.success) {
                // 朦朧状態
                messages.push(<>{`${target} は 朦朧状態に陥った!`}</>)
              } else {
                // 朦朧状態 + 転倒
                messages.push(<>{`${target} は 転倒した!!`}</>)
              }
              break

            case 'fatal': // 転倒判定の結果ログ
              const fatalResult = result.judge
              if (fatalResult.success) {
                // 気絶
                messages.push(<>{`${target} は 気絶した...`}</>)
              } else {
                // 死亡
                messages.push(<>{`${target} は 死亡した...`}</>)
              }
              break
          }
        })
        return messages

      case 'recovery':
        results.forEach(result => {
          const recoveryResult = result.judge
          if (recoveryResult.success) {
            // 回復
            messages.push(<>{`${actor} は 朦朧状態から回復した!`}</>)
          } else {
            // 朦朧状態の継続
            messages.push(<>{`${actor} は 朦朧としていて何も行動できない...`}</>)
          }
        })
        return messages

      default: // case 'defense': case 'move': case 'wait':
        return messages
    }
  }

  private getResultLabel(judge: Judge) {
    return judge.success && judge.critical ? 'クリティカル!!'
      : judge.success && !judge.critical ? '成功!'
      : !judge.success && !judge.critical ? '失敗!' : 'ファンブル!!!'
  }
}
