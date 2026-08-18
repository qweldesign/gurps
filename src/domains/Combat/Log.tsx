// Combat/Log.tsx

import { type ReactNode } from 'react'
import { POSTURE_MODS, CombatUnit as Unit } from './Unit'
import { type Judge } from './Dice'
import { ACTION_LABELS, POSITION_LABELS, type ActionRequest, type ActionResult, type ShieldResult, type FeintResult, type SpellResult, type InjuryOnLimbResult, type FlashResult, type HealResult, type CleanseResult } from './Action'
import { SPELL_ELEMENT_LABELS, SPELL_BUFF_LABELS, STATUS_EFFECT_LABELS } from './Spells'

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

      case 'spell': {
        const spellJudge = results[0].judge as SpellResult
        return spellJudge.success ? spellJudge.spell : `${spellJudge.spell}(不発)`
      }

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
        case 'shield':
          success = !result.judge.success
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

      case 'extinguish':
        messages.push(<>{`${actor} は 燃えている体を地面に転がして消火した!`}</>)
        break

      default: // case 'attack': case 'feint': case 'shoot': case 'snipe': case 'recovery': case 'spell':
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

            case 'feint': // 全力攻撃オプション「牽制即攻撃」による, 直後の攻撃に先立つ牽制の結果ログ
              this.pushFeintMessages(messages, actor, target, result.judge)
              break

            case 'shield': // 対象が「盾」を発動した場合の結果ログ (通常の防御試行回数とは別枠)
              this.pushShieldMessage(messages, result.judge)
              break

            default: // case 'defense': case 'dmg': case 'injuryOnLimb': case 'knockedDown': case 'fatal': case 'unconscious': case 'dead': case 'trip':
              this.pushDamageResolutionMessage(messages, request.targets[0], result)
              break

            case 'readyInterrupted': // 防御を試みたことによる, 射撃武器の準備の中断
              messages.push(<>{`${target} は ${result.judge.weaponName} の準備動作が中断された!`}</>)
              break

            case 'aimInterrupted': // 防御を試みたことによる,「狙い」の中断
              messages.push(<>{`${target} は 狙いの照準が乱れた!`}</>)
              break

            case 'castInterrupted': // 防御を試みたことによる, 精神集中の維持判定
              messages.push(<>{`${target} による精神集中の維持判定`}</>)
              messages.push(<>{`出目は ${result.judge.roll}、${this.getResultLabel(result.judge)}`}</>)
              if (!result.judge.success) messages.push(<>{`${target} の精神集中が途絶えた!`}</>)
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

      case 'spell': { // 法術の発動判定結果ログ (成功時のみ, 適用された効果の結果も表示する)
        const spellJudge = (results[0].judge as SpellResult)
        if (!spellJudge.success) {
          messages.push(<>{`${actor} の ${spellJudge.spell} は不発に終わった...`}</>)
          break
        }
        messages.push(<>{`${actor} の ${spellJudge.spell} 発動!!`}</>)
        const target = request.targets[0].name
        spellJudge.effectResults.forEach(result => {
          if (result.kind === 'buff') {
            messages.push(<>{`${target} の ${SPELL_BUFF_LABELS[result.target]} が上昇した!`}</>)
          } else if (result.kind === 'status') {
            messages.push(<>{`${target} は ${STATUS_EFFECT_LABELS[result.target]} の効果を得た!`}</>)
          } else if (result.applied) {
            messages.push(<>{`${target} は ${STATUS_EFFECT_LABELS[result.target]} 状態になった!`}</>)
          } else {
            messages.push(<>{`${target} は抵抗した!`}</>)
          }
        })
        // 直接ダメージ型 (射撃呪文)・転倒効果・範囲デバフ・回復・範囲浄化の結果ログ
        // (防御判定以降, 攻撃・射撃と共通の形式で表示する. 範囲呪文は複数対象のため, target が結果側に埋め込まれていればそちらを優先する)
        results.slice(1).forEach(result => {
          if (result.type === 'flash') {
            this.pushFlashMessage(messages, result.judge)
          } else if (result.type === 'heal') {
            this.pushHealMessage(messages, result.judge)
          } else if (result.type === 'cleanse') {
            this.pushCleanseMessage(messages, result.judge)
          } else if (result.type === 'shield') {
            this.pushShieldMessage(messages, result.judge)
          } else if (result.type === 'defense') {
            this.pushDamageResolutionMessage(messages, result.judge.target ?? request.targets[0], result)
          } else {
            this.pushDamageResolutionMessage(messages, request.targets[0], result)
          }
        })
        break
      }

      default: // case 'ready': case 'move': case 'changeWeapon': case 'changePosture': case 'wait':
        break
    }
    return messages
  }

  // 術の範囲デバフ効果の結果ログを追加する (「閃光」用. 回避判定に失敗した対象にのみ呼ばれる)
  private pushFlashMessage(messages: ReactNode[], judge: FlashResult) {
    const targetName = judge.target.name
    messages.push(<>{`${targetName} は閃光に目がくらんだ!`}</>)
    messages.push(<>{`次のターンの終わりまで 命中-4, 回避-2の修正を課される!`}</>)
  }

  // 回復呪文の結果ログを追加する (「大地の癒し」「杯」「生命の雫」用)
  private pushHealMessage(messages: ReactNode[], judge: HealResult) {
    const targetName = judge.target.name
    if (!judge.applied) {
      messages.push(<>{`${targetName} は効果を得られなかった...`}</>)
      return
    }
    if (judge.healedAmount > 0) messages.push(<>{`${targetName} の傷が癒え, ${judge.healedAmount} 点回復した!`}</>)
    if (judge.curedStun) messages.push(<>{`${targetName} は朦朧状態から回復した!`}</>)
    if (judge.curedLimbInjury) messages.push(<>{`${targetName} の腕・脚の故障が治癒した!`}</>)
  }

  // 術の範囲浄化効果の結果ログを追加する (「リストレーション」用. 何か1つでも治癒した対象にのみ呼ばれる)
  private pushCleanseMessage(messages: ReactNode[], judge: CleanseResult) {
    const targetName = judge.target.name
    const cured: string[] = []
    if (judge.curedStun) cured.push('朦朧状態')
    if (judge.curedDazed) cured.push('幻惑状態')
    if (judge.curedBerserk) cured.push('狂戦士状態')
    if (judge.curedConfused) cured.push('混乱状態')
    messages.push(<>{`${targetName} の ${cured.join('・')} が解除された`}</>)
  }

  // 「盾」の発動結果ログを追加する (金行術. 通常の防御試行回数とは別枠の追加防御として発動する)
  private pushShieldMessage(messages: ReactNode[], judge: ShieldResult) {
    const targetName = judge.target.name
    messages.push(<>{`${targetName} は「盾」を発動した!`}</>)
    messages.push(<>{`出目は ${judge.roll}、${this.getResultLabel(judge)}`}</>)
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

  // 攻撃・射撃・術 (直接ダメージ型/転倒効果) に共通する, 防御判定以降の結果ログを1件追加する
  private pushDamageResolutionMessage(messages: ReactNode[], target: Unit, result: ActionResult) {
    const targetName = target.name
    switch (result.type) {
      case 'defense': {
        const defenseTypeLabel = result.judge.defenseType === 'parry' ? '武器による受け流し'
          : result.judge.defenseType === 'block' ? '盾による受け止め' : '回避'
        messages.push(<>{`${targetName} は ${defenseTypeLabel} を試みた!`}</>)
        messages.push(<>{`出目は ${result.judge.roll}、${this.getResultLabel(result.judge)}`}</>)
        if (result.judge.success && !result.judge.ready) {
          // 受け成功時のみ非準備状態への変化をログに表示
          messages.push(<>{`${targetName} の ${target.attack.model.name} は非準備状態になった`}</>)
        }
        break
      }

      case 'dmg':
        if (result.judge.roll < 1) messages.push(<>{`ダメージは ${targetName} の鎧によって完全に止められた...`}</>)
        else if (!result.judge.critical) messages.push(<>{`${targetName} は ${result.judge.roll} 点のダメージを受けた!!`}</>)
        else messages.push(<>{`${targetName} は ${result.judge.roll} 点のダメージを受けた!!!`}</>)
        break

      case 'injuryOnLimb': // 部位狙いによる, 顔・四肢の故障ログ
        this.pushInjuryOnLimbMessage(messages, targetName, result.judge)
        break

      case 'knockedDown': // 朦朧状態・転倒判定の結果ログ
        if (result.judge.success) messages.push(<>{`${targetName} は 朦朧状態に陥った!`}</>)
        else messages.push(<>{`${targetName} は 転倒した!!`}</>)
        break

      case 'fatal': // 気絶・死亡判定の結果ログ
        if (result.judge.success) messages.push(<>{`${targetName} は 気絶した...`}</>)
        else messages.push(<>{`${targetName} は 死亡した...`}</>)
        break

      case 'unconscious': // 気絶判定 (頭狙い) の結果ログ. 失敗 (=気絶) 時のみ結果が渡ってくる
        if (!result.judge.success) messages.push(<>{`${targetName} は 気絶した!!`}</>)
        break

      case 'dead': // 即死判定 (喉狙い) の結果ログ. 失敗 (=即死) 時のみ結果が渡ってくる
        if (!result.judge.success) messages.push(<>{`${targetName} は 即死した!!!`}</>)
        break

      case 'trip': // 術の転倒効果の結果ログ (「アースハンド」用). 成功 (転倒を免れた) 時は表示しない
        if (!result.judge.success) messages.push(<>{`${targetName} は 転倒した!!`}</>)
        break
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
