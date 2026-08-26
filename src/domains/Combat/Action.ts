// Combat/Action.ts

import { CombatState as State } from './State'
import { POSITION_KEYS, POSTURE_KEYS, type Posture } from './Unit'
import { SPELL_ELEMENTS, type SpellElement } from './Spells'
import { ACTION_KEYS, ACTION_LABELS, POSITION_LABELS, FULL_POWER_KEYS, FULL_POWER_OPTIONS, AIM_KEYS, AIM_OPTIONS, type ActionKey, type ActionOptions, type ActionRequest, type ActionResult, type ShieldResult, type FeintResult, type SpellResult, type CastCanceledResult, type InjuryOnLimbResult, type FlashResult, type HealResult, type CleanseResult, type DebuffAllResult, type FullPower, type Aim } from './Action/types'
import { ActionAvailability } from './Action/availability'
import { ActionEffects } from './Action/effects'

// 定数・型定義は Action/types.ts に集約する
// 既存の呼び出し元 (Action.tsx, Log.tsx) が引き続き参照できるよう, ここから re-export する
export { ACTION_KEYS, ACTION_LABELS, POSITION_LABELS, FULL_POWER_KEYS, FULL_POWER_OPTIONS, AIM_KEYS, AIM_OPTIONS }
export type { ActionKey, ActionOptions, ActionRequest, ActionResult, InjuryOnLimbResult, ShieldResult, FeintResult, SpellResult, CastCanceledResult, FlashResult, HealResult, CleanseResult, DebuffAllResult, FullPower, Aim }

// 行動の管理を司るクラス / Actionコンポーネントに対応
// 行動可否判定は Action/availability.ts, 状態変更は Action/effects.ts に委譲する
export class CombatAction {
  private state: State
  public round: number
  public unlocked: boolean // コマンドパレットのロック状態 → Actions にて検知
  public hasChangedWeapon: boolean // 「装備変更」を実行したかどうか (1ターンに1度まで)
  public hasChangedPosture: boolean // 「姿勢変更」を実行したかどうか (1ターンに1度まで)
  public promise: Promise<void>
  public ready: Promise<void> // 開幕時の自動実行 (朦朧回復・消火) が完了したら解決される (敵の自動行動 (AI) はこれを待ってから起動する)
  private resolve!: () => void
  private readonly availabilityChecker: ActionAvailability
  private readonly effects: ActionEffects

  constructor(state: State) {
    this.state = state
    this.round = state.round
    this.unlocked = true // コマンドパレットをアンロック
    this.hasChangedWeapon = false
    this.hasChangedPosture = false
    this.availabilityChecker = new ActionAvailability(state)
    this.effects = new ActionEffects(state)

    // ターン終了を Promise で State に伝え, 次のターンへ進む
    this.promise = new Promise(resolve => {
      this.resolve = resolve
    })

    // 朦朧状態の場合は「回復」を自動実行する
    // 火だるま状態の場合は「消火」を自動実行する (両方に該当する場合は「回復」を優先し,「消火」は朦朧から回復した後のターンに持ち越す)
    if (this.actor.health.stunned) {
      this.ready = this.execute({ key: 'recovery', options: {}, targets: [] })
    } else if (this.actor.health.burning) {
      this.ready = this.execute({ key: 'extinguish', options: {}, targets: [] })
    } else {
      this.ready = Promise.resolve()
    }
  }

  get actor() {
    return this.state.actor
  }

  // 実行可否
  get availability() {
    return {
      ready: this.availabilityChecker.canReady(),
      attack: this.availabilityChecker.canAttack(),
      fullAttack: this.availabilityChecker.canFullAttack(),
      doubleAttack: this.availabilityChecker.canDoubleAttack(),
      legAttack: this.availabilityChecker.canLegAttack(),
      feint: this.availabilityChecker.canFeint(),
      shoot: this.availabilityChecker.canShoot(),
      snipe: this.availabilityChecker.canSnipe(),
      cast: SPELL_ELEMENTS.reduce((acc, element) => {
        acc[element] = this.availabilityChecker.canCast(element)
        return acc
      }, {} as Record<SpellElement, boolean>),
      spell: SPELL_ELEMENTS.some(element => this.availabilityChecker.canSpell(element)),
      defense: this.availabilityChecker.canDefense(),
      move: POSITION_KEYS.reduce((acc, position) => {
        acc[position] = this.availabilityChecker.canMove(position)
        return acc
      }, {} as Record<typeof POSITION_KEYS[number], boolean>),
      changeWeapon: this.availabilityChecker.canChangeWeapon() && !this.hasChangedWeapon,
      changePosture: POSTURE_KEYS.reduce((acc, posture) => {
        acc[posture as Posture] = this.availabilityChecker.canChangePosture(posture as Posture) && !this.hasChangedPosture
        return acc
      }, {} as Record<Posture, boolean>),
      wait: this.availabilityChecker.canWait()
    }
  }

  // ターゲットを結果として生成 (Formation の配置情報を元に絞り込む)
  // 気絶・死亡したユニットは戦闘から除外扱いとし, いずれの対象プールにも含めない (「傀儡」等の例外は未実装. 実装時は専用の取得ロジックを設ける)
  get target() {
    const formation = this.state.formation
    return {
      all: this.state.units.filter(unit => !unit.health.unconscious && !unit.health.dead),
      allies: formation?.getAllies() ?? [],
      enemies: formation?.getEnemies() ?? [],
      melee: formation?.getMeleeTargets() ?? [],
      puppet: formation?.getPuppetTargets() ?? []
    }
  }

  // 実行
  // ActionRequest のプロパティ (key, options, targets) を引数に取って処理を進め,
  // ActionResult の配列を Log に渡し, 再生して次のターンへ移る
  async execute (action: ActionRequest) {
    // コマンドパレットをロック (アンロックはコンストラクタで行われる)
    this.unlocked = false

    // コマンド実行前の姿勢 (「姿勢変更」のターン終了判定に用いる)
    const prevPosture = this.actor.posture

    // 「集中」「法術」以外のコマンドを実行した場合, 継続中の精神集中を破棄する (「法術」は集中を消費する行動そのものなので対象外)
    // プレイヤー自身の選択による中断のため, ログには残さない (状態のリセットのみ行う)
    if (action.key !== 'cast' && action.key !== 'spell') this.effects.cancelCastByOtherAction()
    const results: ActionResult[] = []

    // 行動実行
    switch (action.key) {
      case 'ready':
        results.push(...this.effects.ready())
        break

      case 'attack':
        results.push(...this.effects.attack(action.options.aim, action.options.fullPower, action.targets[0]))
        break

      case 'feint':
        results.push(...this.effects.feint(action.targets[0]))
        break

      case 'shoot':
        results.push(...this.effects.shoot(action.options.aim, action.targets[0]))
        break

      case 'snipe':
        results.push(...this.effects.snipe(action.targets[0]))
        break

      case 'cast':
        results.push(...this.effects.cast(action.options.element))
        break

      case 'spell':
        results.push(...this.effects.spell(action.options.element, action.options.spellId, action.targets[0]))
        break

      case 'defense':
        results.push(...this.effects.defense())
        break

      case 'move':
        this.effects.move(action.options.position)
        break

      case 'changeWeapon':
        results.push(...this.effects.changeWeapon(action.options.weaponSlotKey))
        this.hasChangedWeapon = true // 1ターンに1度まで
        break

      case 'changePosture':
        results.push(...this.effects.changePosture(action.options.posture))
        this.hasChangedPosture = true // 1ターンに1度まで
        break

      case 'recovery':
        results.push(...this.effects.recovery())
        break

      case 'extinguish':
        results.push(...this.effects.extinguish())
        break

      default: // case 'wait':
        this.effects.wait()
    }

    // ログを更新
    const log = this.state.logs[0]
    log.receiveResults(action, results)

    // 「傀儡」の発動成功判定 (成功時, 対象のターンへその場で即座に移行する. 術者自身のコマンドパレットには戻らない)
    const spellResult = results.find((result): result is Extract<ActionResult, { type: 'spell' }> => result.type === 'spell')
    const puppetTarget = action.key === 'spell' && spellResult?.judge.effectResults.some(effectResult => effectResult.kind === 'puppet')
      ? action.targets[0]
      : null

    // 行動終了分岐 (回復成功時・装備変更時・姿勢変更時 (「這い」からの起き上がりを除く) ・射撃時・法術発動時 (「傀儡」成功時を除く) はターンを終えず, コマンドパレットを再度アンロックして同じ actor の行動を続ける)
    let nextTurn = true
    const recoveryResult = results.find(result => result.type === 'recovery')
    if (action.key === 'recovery' && recoveryResult?.judge.success) {
      this.unlocked = true
      nextTurn = false
    }
    if (action.key === 'changeWeapon') {
      this.unlocked = true
      nextTurn = false
    }
    if (action.key === 'changePosture' && prevPosture !== 'prone') {
      this.unlocked = true
      nextTurn = false
    }
    if (action.key === 'shoot' || (action.key === 'spell' && !puppetTarget)) {
      this.unlocked = true
      nextTurn = false
    }

    // 行動終了
    await this.state.playLog() // ログの再生完了を待つ
    if (puppetTarget) {
      // 「傀儡」: 対象のターンへ移行し, それが終わり次第, 術者自身のターンも終了する (そこから術者の行動には戻れない)
      await this.state.startPuppetTurn(puppetTarget)
      this.resolve()
    } else if (nextTurn) {
      this.resolve()
    }
  }

  // 現在の行動者の所属陣営が「濃霧」の影響下にあるか否か (UI側の目標値プレビュー表示用)
  get shootPenalty() {
    return this.state.shootPenalty[this.state.actor.side]
  }
}
