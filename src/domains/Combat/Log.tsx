// Combat/Log.tsx

import { type ReactNode } from 'react'
import { POSTURE_MODS, CombatUnit as Unit } from './Unit'
import { type Judge } from './Dice'
import { ACTION_LABELS, POSITION_LABELS, type ActionRequest, type ActionResult, type ShieldResult, type FeintResult, type SpellResult, type CastCanceledResult, type InjuryOnLimbResult, type FlashResult, type HealResult, type CleanseResult, type DebuffAllResult } from './Action'
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

  // 「時間遡行」用: State (nextTurn) から直接呼び出される, ターン全体に対する追加のログ
  // (特定の ActionRequest/ActionResult に紐づかないため, receiveResults とは別枠で messages に積む)
  receiveTimeRegression(caster: Unit, judge: Judge) {
    const messages: ReactNode[] = []
    if (!judge.success) {
      // 失敗時は発動判定の出目を見せず,「不発」であったことだけを示す (他の術の不発時のログと同じ体裁)
      messages.push(<>{`${caster.name} の「時間遡行」は不発に終わった...`}</>)
      messages.push(<>&nbsp;</>)
      this.messages.push(messages)
      return
    }
    messages.push(<>{`${caster.name} の「時間遡行」が発動!!`}</>)
    messages.push(<>{`出目は ${judge.roll}、${this.getResultLabel(judge)}`}</>)
    messages.push(<>{`時間が巻き戻り、${this.actor.name} の行動は無かったことになった!!`}</>)
    messages.push(<>&nbsp;</>)
    this.messages.push(messages)
  }

  // 「勝敗判定」用: State (nextTurn) から直接呼び出される, 決着時の追加ログ
  // (特定の ActionRequest/ActionResult に紐づかないため, receiveResults とは別枠で messages に積む)
  receiveResult(result: 'win' | 'lose') {
    const messages: ReactNode[] = []
    if (result === 'win') {
      messages.push(<span className="font-bold">{'敵陣営の前衛が崩れた!! 勝利!!'}</span>)
    } else {
      messages.push(<span className="font-bold">{'味方陣営の前衛が崩れた... 敗北...'}</span>)
    }
    this.messages.push(messages)
  }

  // ラベル生成 (Summary履歴用)
  private createLabel(request: ActionRequest, results: ActionResult[]): string {
    switch (request.key) {
      case 'attack': {
        // 全力攻撃 (fullPower !== 'none') の場合は「攻撃」ではなく「全力攻撃」と表示し, 通常攻撃と判別できるようにする
        const attackLabel = request.options.fullPower !== 'none' ? '全力攻撃' : ACTION_LABELS[request.key]
        return `${attackLabel}:${this.createAttackResultLabel(request, results)}`
      }

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

      default: // case 'ready': case 'defense': case 'changeWeapon': case 'recovery': case 'wait':
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

      case 'defense':
        messages.push(<>{`${actor} は 防御に専念!`}</>)
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
        messages.push(<>{`${actor} は 恐慌状態で行動できない`}</>) // 恐慌状態のみ
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

            case 'readyInterrupted': // 防御を試みたことによる, 射撃武器の準備の中断
              messages.push(<>{`${target} は ${result.judge.weaponName} の準備動作が中断された!`}</>)
              break

            case 'aimInterrupted': // 防御を試みたことによる,「狙い」の中断
              messages.push(<>{`${target} は 狙いの照準が乱れた!`}</>)
              break

            case 'overextended': // 対象の防御判定のクリティカル成功による, 攻撃側の体勢崩れ (武器種を問わない追加の引き戻し)
              messages.push(<>{`${actor} は 大きく体勢を崩した!`}</>)
              messages.push(<>{`${actor} の ${result.judge.weaponName} は非準備状態になった`}</>)
              break

            default: // case 'defense': case 'dmg': case 'castCanceled': case 'injuryOnLimb': case 'knockedDown': case 'fatal': case 'unconscious': case 'dead': case 'trip':
              this.pushDamageResolutionMessage(messages, request.targets[0], result)
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
          if (spellJudge.critical) {
            messages.push(<>{`${actor} の ${spellJudge.spell} はファンブルした!!`}</>)
            messages.push(<>{`${actor} は ${STATUS_EFFECT_LABELS.dazed} 状態になった!`}</>)
          } else {
            messages.push(<>{`${actor} の ${spellJudge.spell} は不発に終わった...`}</>)
          }
          break
        }
        messages.push(<>{`${actor} の ${spellJudge.spell} 発動!!`}</>)
        const target = request.targets[0].name
        spellJudge.effectResults.forEach(result => {
          if (result.kind === 'buff') {
            messages.push(<>{`${target} の ${SPELL_BUFF_LABELS[result.target]} が上昇した!`}</>)
          } else if (result.kind === 'status') {
            messages.push(<>{`${target} は ${STATUS_EFFECT_LABELS[result.target]} の効果を得た!`}</>)
          } else if (result.kind === 'puppet') {
            messages.push(<>{`${target} を傀儡として操る!`}</>)
          } else if (result.kind === 'shootPenalty') {
            messages.push(<>{`風の精霊の加護が働く!`}</>)
          } else if (result.applied) {
            messages.push(<>{`${target} は ${STATUS_EFFECT_LABELS[result.target]} 状態になった!`}</>)
          } else {
            messages.push(<>{`${target} は抵抗した!`}</>)
          }
        })
        // 直接ダメージ型 (射撃呪文/範囲呪文)・転倒効果・範囲デバフ・回復・範囲浄化・盾の結果ログ
        // (防御判定以降, 攻撃・射撃と共通の形式で表示する. 範囲呪文は複数対象のため, 結果側に target が埋め込まれていれば随時それを直近の対象として引き継ぐ
        // (dmg は resolveDamage 側で常に埋められるため, 後続の injuryOnLimb/knockedDown/fatal/unconscious/dead は同じ対象の一連の結果として正しく引き継がれる))
        let currentTarget = request.targets[0]
        results.slice(1).forEach(result => {
          if (result.type === 'flash') {
            currentTarget = result.judge.target
            this.pushFlashMessage(messages, result.judge)
          } else if (result.type === 'heal') {
            currentTarget = result.judge.target
            this.pushHealMessage(messages, result.judge)
          } else if (result.type === 'cleanse') {
            currentTarget = result.judge.target
            this.pushCleanseMessage(messages, result.judge)
          } else if (result.type === 'shield') {
            currentTarget = result.judge.target
            this.pushShieldMessage(messages, result.judge)
          } else if (result.type === 'debuffAll') {
            currentTarget = result.judge.target
            this.pushDebuffAllMessage(messages, result.judge)
          } else if (result.type === 'defense') {
            currentTarget = result.judge.target ?? currentTarget
            this.pushDamageResolutionMessage(messages, currentTarget, result)
          } else if (result.type === 'dmg') {
            currentTarget = result.judge.target ?? currentTarget
            this.pushDamageResolutionMessage(messages, currentTarget, result)
          } else {
            this.pushDamageResolutionMessage(messages, currentTarget, result)
          }
        })
        break
      }

      default: // case 'ready': case 'defense': case 'move': case 'changeWeapon': case 'changePosture': case 'wait':
        break
    }
    return messages
  }

  // 術の範囲デバフ効果の結果ログを追加する (「閃光」用. 回避判定に失敗した対象にのみ呼ばれる)
  private pushFlashMessage(messages: ReactNode[], judge: FlashResult) {
    const targetName = judge.target.name
    messages.push(<>{`${targetName} は閃光に目がくらんだ!`}</>)
    messages.push(<>{`次のターンの終わりまで 命中-2, 回避-1の修正を課される!`}</>)
  }

  // 術の範囲デバフ効果の結果ログを追加する (「サイレン」用. 抵抗判定に失敗した対象にのみ呼ばれる)
  private pushDebuffAllMessage(messages: ReactNode[], judge: DebuffAllResult) {
    const targetName = judge.target.name
    messages.push(<>{`${targetName} は ${STATUS_EFFECT_LABELS[judge.statusTarget]} 状態になった!`}</>)
  }

  // 回復呪文の結果ログを追加する (「杯」「生命の雫」用)
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

  // 術の範囲浄化効果の結果ログを追加する (「癒しの風」用. 何か1つでも治癒した対象にのみ呼ばれる)
  private pushCleanseMessage(messages: ReactNode[], judge: CleanseResult) {
    const targetName = judge.target.name
    const cured: string[] = []
    if (judge.curedStun) cured.push('朦朧状態')
    if (judge.curedDazed) cured.push('幻惑状態')
    if (judge.curedBerserk) cured.push('狂戦士状態')
    if (judge.curedFear) cured.push('恐慌状態')
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

      case 'knockedDown': // 朦朧状態・転倒判定の結果ログ (成功時, アンデッド・スライムは朦朧状態に陥らないため何も表示しない)
        if (result.judge.success) {
          if (target.defense.creatureType === 'normal') messages.push(<>{`${targetName} は 朦朧状態に陥った!`}</>)
        } else {
          messages.push(<>{`${targetName} は 転倒した!!`}</>)
        }
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

      case 'trip': // 術の転倒効果の結果ログ (「アースハンド」用).
        if (!result.judge.success) messages.push(<>{`${targetName} は 転倒した!!`}</>)
        else messages.push(<>{`だが、${targetName} は 転倒に耐えた!`}</>)
        break

      case 'castCanceled': // 精神集中の強制解除ログ (継続中の系統があった場合のみ渡ってくる. judge.target で対象を直接特定する)
        this.pushCastCanceledMessage(messages, result.judge)
        break
    }
  }

  // 精神集中の強制解除ログを追加する (転倒・防御を試みた際の維持判定失敗のいずれの由来でも共通のログで表示する)
  private pushCastCanceledMessage(messages: ReactNode[], judge: CastCanceledResult) {
    messages.push(<>{`${judge.target.name} の ${SPELL_ELEMENT_LABELS[judge.element]} による精神集中が途切れた!!`}</>)
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
      : !judge.success && !judge.critical ? '失敗!' : '!!!'
  }
}
