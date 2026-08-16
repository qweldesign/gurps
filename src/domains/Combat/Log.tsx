// Combat/Log.tsx

import { type ReactNode } from 'react'
import { POSTURE_MODS, CombatUnit as Unit } from './Unit'
import { type Judge } from './Dice'
import { ACTION_LABELS, POSITION_LABELS, type ActionRequest, type ActionResult, type FeintResult, type SpellResult, type InjuryOnLimbResult } from './Action'
import { SPELL_ELEMENT_LABELS } from './Spells'

let count = 0

// タイムラインへのログ表示を司るクラス / Timelineコンポーネントに対応
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

  // Action コンポーネントで ActionRequest と ActionResult[] を受け取り, ラベルと結果ログを生成する
  receiveResults(request: ActionRequest, results: ActionResult[] = []) {
    this.label = this.createLabel(request, results)
    this.messages.push(this.createMessages(request, results))
  }

  // ラベル生成 (Summary履歴用)
  private createLabel(request: ActionRequest, results: ActionResult[]): string {
    switch (request.key) {
      case 'attack':
        return `${ACTION_LABELS[request.key]}:${this.createAttackResultLabel(request, results)}`

      case 'feint':
        return `${ACTION_LABELS[request.key]}:${this.createFeintResultLabel(results)}`

      case 'cast':
        return `${ACTION_LABELS[request.key]}:${SPELL_ELEMENT_LABELS[request.options.element]}(${this.actor.spellCast[request.options.element]})`

      case 'spell':
        return (results[0].judge as SpellResult).spell

      case 'move':
        return `${ACTION_LABELS[request.key]}:${POSITION_LABELS[request.options.position]}`

      case 'changePosture':
        return `${ACTION_LABELS[request.key]}:${POSTURE_MODS[request.options.posture].label}`

      default: // case 'ready': case 'changeWeapon': case 'recovery': case 'wait':
        return ACTION_LABELS[request.key]
    }
  }

  // 攻撃の成否ラベルを生成
  // 攻撃(成功) → 防御(失敗) → ダメージ(貫通) の場合のみ「成功」を返す
  private createAttackResultLabel(request: ActionRequest, results: ActionResult[]): string {
    if (request.key !== 'attack') return ''
    let success = false
    results.forEach(result => {
      switch (result.type) {
        case 'attack':
          success = result.judge.success
          break
        case 'defense':
          success = !result.judge.success
          break
        case 'dmg':
          success = result.judge.success
          break
      }
    })
    return success ? '成功' : '失敗'
  }

  // 牽制の成否ラベルを生成 (成功時は成功度も表示)
  private createFeintResultLabel(results: ActionResult[]): string {
    let success = false
    let score = 0
    results.forEach(result => {
      if (result.type === 'feint') {
        success = result.judge.success
        score = result.judge.score
      }
    })
    return success ? `成功(${score})` : '失敗'
  }

  // 結果ログ生成
  private createMessages(request: ActionRequest, results: ActionResult[]): ReactNode[] {
    const actor = this.actor.name
    const messages = this.createResultMessages(request, results)
    switch (request.key) {
      case 'ready':
        messages.push(<>{`${actor} は ${this.actor.attack.model.name} を構えた`}</>)
        break

      case 'move':
        messages.push(<>{`${actor} は ${POSITION_LABELS[request.options.position]} へ移動した`}</>)
        break

      case 'changeWeapon':
        messages.push(<>{`${actor} は武器を ${this.actor.attack.model.name} に持ち替えた`}</>)
        break

      case 'changePosture':
        messages.push(<>{`${actor} は ${POSTURE_MODS[request.options.posture].label} の姿勢に変更した`}</>)
        break

      case 'wait':
        messages.push(<>{`${actor} は 待機している`}</>)
        break

      case 'cast':
        messages.push(<>{`${actor} は ${SPELL_ELEMENT_LABELS[request.options.element]} の呪文に集中している`}</>)
        break

      case 'spell':
        messages.push(<>{`${actor} の ${(results[0].judge as SpellResult).spell} 発動!!`}</>)
        break

      default: // case 'attack': case 'feint': case 'shoot': case 'snipe': case 'recovery':
        break
    }
    messages.push(<>&nbsp;</>)
    return messages
  }

  // 攻撃・回復の判定結果ログを生成
  private createResultMessages(request: ActionRequest, results: ActionResult[]): ReactNode[] {
    const messages: ReactNode[] = []
    const actor = this.actor.name
    switch (request.key) {
      case 'attack': case 'shoot': {
        const target = request.targets[0].name
        results.forEach(result => {
          switch (result.type) {
            case 'attack':
              messages.push(<>{`${actor} の ${this.actor.attack.model.name} による攻撃!`}</>)
              messages.push(<>{`出目は ${result.judge.roll}、${this.getResultLabel(result.judge)}`}</>)
              if (!result.judge.success && !result.judge.ready) {
                // 攻撃失敗時のみ非準備状態への変化をログに表示
                messages.push(<>{`${actor} の ${this.actor.attack.model.name} は非準備状態になった`}</>)
              }
              break

            case 'defense': {
              const defenseTypeLabel = result.judge.defenseType === 'parry' ? '武器による受け流し'
                : result.judge.defenseType === 'block' ? '盾による受け止め' : '回避'
              messages.push(<>{`${target} は ${defenseTypeLabel} を試みた!`}</>)
              messages.push(<>{`出目は ${result.judge.roll}、${this.getResultLabel(result.judge)}`}</>)
              if (result.judge.success && !result.judge.ready) {
                // 受け成功時のみ非準備状態への変化をログに表示
                messages.push(<>{`${target} の ${request.targets[0].attack.model.name} は非準備状態になった`}</>)
              }
              break
            }

            case 'feint': // 全力攻撃オプション「牽制即攻撃」による, 直後の攻撃に先立つ牽制の結果ログ
              this.pushFeintMessages(messages, actor, target, result.judge)
              break

            case 'dmg':
              if (result.judge.roll < 1) messages.push(<>{`ダメージは ${target} の鎧によって完全に止められた...`}</>)
              else if (!result.judge.critical) messages.push(<>{`${target} は ${result.judge.roll} 点のダメージを受けた!!`}</>)
              else messages.push(<>{`${target} は ${result.judge.roll} 点のダメージを受けた!!!`}</>)
              break

            case 'injuryOnLimb': // 部位狙いによる, 顔・四肢の故障ログ
              this.pushInjuryOnLimbMessage(messages, target, result.judge)
              break

            case 'knockedDown': // 朦朧状態・転倒判定の結果ログ
              if (result.judge.success) messages.push(<>{`${target} は 朦朧状態に陥った!`}</>)
              else messages.push(<>{`${target} は 転倒した!!`}</>)
              break

            case 'fatal': // 気絶・死亡判定の結果ログ
              if (result.judge.success) messages.push(<>{`${target} は 気絶した...`}</>)
              else messages.push(<>{`${target} は 死亡した...`}</>)
              break

            case 'unconscious': // 気絶判定 (頭狙い) の結果ログ. 失敗 (=気絶) 時のみ結果が渡ってくる
              if (!result.judge.success) messages.push(<>{`${target} は 気絶した!!`}</>)
              break

            case 'dead': // 即死判定 (喉狙い) の結果ログ. 失敗 (=即死) 時のみ結果が渡ってくる
              if (!result.judge.success) messages.push(<>{`${target} は 即死した!!!`}</>)
              break
          }
        })
        break
      }

      case 'feint': case 'snipe': { // 牽制・狙いの判定結果ログ
        const target = request.targets[0].name
        const label = request.key === 'feint' ? '牽制' : '狙い'
        results.forEach(result => {
          if (result.type !== 'feint') return
          this.pushFeintMessages(messages, actor, target, result.judge, label)
        })
        break
      }

      case 'recovery': // 朦朧状態からの回復判定の結果ログ
        results.forEach(result => {
          if (result.type !== 'recovery') return
          if (result.judge.success) messages.push(<>{`${actor} は 朦朧状態から回復した!`}</>)
          else messages.push(<>{`${actor} は 朦朧としていて何も行動できない...`}</>)
        })
        break

      case 'cast': // 聾・沈黙状態での集中判定の結果ログ (判定が発生した場合のみ渡ってくる. 失敗時のみ表示)
        results.forEach(result => {
          if (result.type !== 'cast') return
          if (!result.judge.success) messages.push(<>{`${actor} は 集中に失敗した!`}</>)
        })
        break

      default: // case 'ready': case 'move': case 'changeWeapon': case 'changePosture': case 'wait': case 'spell':
        break
    }
    return messages
  }

  // 牽制・狙いの判定結果ログを追加する (「牽制」「狙い」単体実行と, 全力攻撃オプション「牽制即攻撃」の両方から利用される)
  private pushFeintMessages(messages: ReactNode[], actor: string, target: string, judge: FeintResult, label: string = '牽制') {
    const opening = label === '牽制' ? `${label}を仕掛けた!` : `${label}を定めた`
    messages.push(<>{`${actor} は ${target} に対して${opening}`}</>)
    if (judge.success) {
      messages.push(<>{`出目は ${judge.roll}、${label}は成功した!`}</>)
      messages.push(<>{`次のターン, ${target} は防御判定に -${judge.score} の修正が課せられる!`}</>)
    } else {
      messages.push(<>{`出目は ${judge.roll}、${label}は失敗した...`}</>)
    }
  }

  // 部位狙いによる, 顔・四肢の故障ログを追加する
  private pushInjuryOnLimbMessage(messages: ReactNode[], target: string, judge: InjuryOnLimbResult) {
    if (judge.limb === 'ear') {
      messages.push(<>{`${target} は 耳を故障した!!`}</>)
    } else if (judge.limb === 'eye') {
      messages.push(<>{`${target} は 目を故障した!!`}</>)
    } else if (judge.limb === 'arm' || judge.limb === 'hand') {
      messages.push(<>{`${target} は 腕を故障した!!`}</>)
    } else if (judge.limb === 'leg' || judge.limb === 'foot') {
      messages.push(<>{`${target} は 脚を故障した!!`}</>)
    }
  }

  private getResultLabel(judge: Judge): string {
    return judge.success && judge.critical ? 'クリティカル!!'
      : judge.success && !judge.critical ? '成功!'
      : !judge.success && !judge.critical ? '失敗!' : 'ファンブル!!!'
  }
}
